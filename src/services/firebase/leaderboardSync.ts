import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ensureAnonymousSession } from "./auth";
import { getFirebaseServices, isFirebaseConfigured } from "./config";
import {
  ALLOWED_AVATAR_IDS,
  sanitizeAvatarTone,
  type AvatarId,
  type EngagementSnapshot,
  type LeagueStanding,
} from "../progress/engagement";

const MAX_PROCESSED_EVENT_IDS = 500;
const MAX_DELTA_PER_SYNC = 500;
const MAX_INITIAL_WEEKLY_XP = 5000;
const MAX_INITIAL_TOTAL_XP = 50000;
const MAX_CATCHUP_CHUNKS = 5;
const MIN_LEAGUE_SIZE = 10;
const TOP_QUERY_LIMIT = 25;

export interface RemoteUserState {
  displayName: string;
  avatarId: AvatarId;
  avatarTone: string;
  totalXp: number;
  weeklyXp: number;
  weekKey: string;
  processedEventIds: string[];
}

export interface GlobalStandingsResult {
  standings: LeagueStanding[];
  mode: "live" | "local";
  realPlayerCount: number;
  outsideTopLimit: boolean;
}

let syncChain: Promise<void> = Promise.resolve();

function sanitizeEventIds(ids: readonly string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const id of ids) {
    if (id && !seen.has(id)) {
      seen.add(id);
      unique.push(id);
    }
  }
  return unique.slice(-MAX_PROCESSED_EVENT_IDS);
}

/**
 * Atomically and idempotently syncs the current user's profile and XP to Firestore
 * (`users/{uid}` and `leaderboard_weekly/{effectiveWeekKey}/entries/{uid}`) via
 * `runTransaction`. Reconciles offline and post-merge positive XP gaps in bounded
 * `<= 500 XP` steps (up to 5 chunks per flush). Never writes email, fullName, or photoURL.
 */
export function enqueueLeaderboardSync(
  snapshot: EngagementSnapshot,
  event?: { eventId: string; deltaXp: number },
): Promise<void> {
  if (!isFirebaseConfigured()) return Promise.resolve();

  const op = syncChain.then(async () => {
    const services = getFirebaseServices();
    if (!services) return;
    const user = await ensureAnonymousSession();
    if (!user) return;

    const uid = user.uid;
    const localWeekKey = snapshot.state.league.weekKey;
    const localTotalXp = Math.max(0, Math.trunc(snapshot.state.totalXp));
    const localWeeklyXp = Math.max(0, Math.trunc(snapshot.state.weeklyXp));
    const safeDisplayName =
      snapshot.profile.displayName.trim().slice(0, 28) || "Jogador";
    const safeAvatarId: AvatarId = ALLOWED_AVATAR_IDS.has(
      snapshot.profile.avatarId,
    )
      ? snapshot.profile.avatarId
      : "fox";
    const safeAvatarTone = sanitizeAvatarTone(snapshot.profile.avatarTone);
    const userRef = doc(services.db, "users", uid);

    for (let chunk = 0; chunk < MAX_CATCHUP_CHUNKS; chunk += 1) {
      const activeEvent = chunk === 0 ? event : undefined;

      const needsMoreChunks = await runTransaction(services.db, async (tx) => {
        const userSnap = await tx.get(userRef);
        const existingUser = userSnap.exists()
          ? (userSnap.data() as Partial<RemoteUserState>)
          : null;

        const remoteWeekKey =
          typeof existingUser?.weekKey === "string" ? existingUser.weekKey : "";
        const effectiveWeekKey =
          remoteWeekKey && remoteWeekKey > localWeekKey
            ? remoteWeekKey
            : localWeekKey;

        const entryRef = doc(
          services.db,
          "leaderboard_weekly",
          effectiveWeekKey,
          "entries",
          uid,
        );
        const entrySnap = await tx.get(entryRef);
        const existingEntry = entrySnap.exists()
          ? (entrySnap.data() as { weeklyXp?: number; totalXp?: number })
          : null;

        const remoteEvents = Array.isArray(existingUser?.processedEventIds)
          ? existingUser.processedEventIds.filter(
              (id): id is string => typeof id === "string",
            )
          : [];

        const alreadyProcessed = Boolean(
          activeEvent && remoteEvents.includes(activeEvent.eventId),
        );
        const eventDelta =
          activeEvent && !alreadyProcessed
            ? Math.max(
                0,
                Math.min(Math.trunc(activeEvent.deltaXp), MAX_DELTA_PER_SYNC),
              )
            : 0;

        const targetWeeklyXp =
          effectiveWeekKey === localWeekKey ? localWeeklyXp : 0;

        let nextTotalXp: number;
        let nextWeeklyXp: number;
        let baseTotal = 0;
        let baseWeekly = 0;
        let sameWeek = false;

        if (!existingUser) {
          nextWeeklyXp = Math.min(targetWeeklyXp, MAX_INITIAL_WEEKLY_XP);
          nextTotalXp = Math.max(
            nextWeeklyXp,
            Math.min(localTotalXp, MAX_INITIAL_TOTAL_XP),
          );
        } else {
          baseTotal = Math.max(0, Math.trunc(existingUser.totalXp ?? 0));
          sameWeek = remoteWeekKey === effectiveWeekKey;
          baseWeekly = sameWeek
            ? Math.max(0, Math.trunc(existingUser.weeklyXp ?? 0))
            : 0;

          const totalGap = Math.max(0, localTotalXp - baseTotal);
          const weeklyGap = Math.max(0, targetWeeklyXp - baseWeekly);
          const appliedWeeklyDelta = Math.min(
            Math.max(eventDelta, weeklyGap),
            MAX_DELTA_PER_SYNC,
          );
          const appliedTotalDelta = Math.min(
            Math.max(eventDelta, totalGap),
            MAX_DELTA_PER_SYNC,
          );

          nextWeeklyXp = baseWeekly + appliedWeeklyDelta;
          nextTotalXp = Math.min(
            baseTotal + MAX_DELTA_PER_SYNC,
            Math.max(baseTotal + appliedTotalDelta, nextWeeklyXp),
          );
          nextWeeklyXp = Math.min(nextWeeklyXp, nextTotalXp);
        }

        let entryWeeklyXp: number;
        let entryTotalXp: number;
        if (!existingEntry) {
          entryWeeklyXp = Math.min(nextWeeklyXp, MAX_INITIAL_WEEKLY_XP);
          entryTotalXp = Math.max(
            entryWeeklyXp,
            Math.min(nextTotalXp, MAX_INITIAL_TOTAL_XP),
          );
        } else {
          const prevEntryWeekly = Math.max(
            0,
            Math.trunc(existingEntry.weeklyXp ?? 0),
          );
          const prevEntryTotal = Math.max(
            0,
            Math.trunc(existingEntry.totalXp ?? 0),
          );
          entryWeeklyXp = Math.min(
            Math.max(prevEntryWeekly, nextWeeklyXp),
            prevEntryWeekly + MAX_DELTA_PER_SYNC,
          );
          entryTotalXp = Math.min(
            Math.max(prevEntryTotal, nextTotalXp, entryWeeklyXp),
            prevEntryTotal + MAX_DELTA_PER_SYNC,
          );
          entryWeeklyXp = Math.min(entryWeeklyXp, entryTotalXp);
        }

        // Seed processedEventIds only on initial user doc creation; on updates,
        // append only the explicitly credited eventId so uncredited local events
        // are never falsely marked as synced.
        const nextEventIds = sanitizeEventIds(
          !existingUser
            ? [
                ...Object.keys(snapshot.state.processedEvents),
                ...(activeEvent ? [activeEvent.eventId] : []),
              ]
            : activeEvent && !alreadyProcessed
              ? [...remoteEvents, activeEvent.eventId]
              : remoteEvents,
        );

        tx.set(userRef, {
          displayName: safeDisplayName,
          avatarId: safeAvatarId,
          avatarTone: safeAvatarTone,
          totalXp: nextTotalXp,
          weeklyXp: nextWeeklyXp,
          weekKey: effectiveWeekKey,
          processedEventIds: nextEventIds,
          updatedAt: serverTimestamp(),
        });

        tx.set(entryRef, {
          displayName: safeDisplayName,
          avatarId: safeAvatarId,
          avatarTone: safeAvatarTone,
          weeklyXp: entryWeeklyXp,
          totalXp: entryTotalXp,
          weekKey: effectiveWeekKey,
          updatedAt: serverTimestamp(),
        });

        const madeProgress =
          !existingUser ||
          nextTotalXp > baseTotal ||
          (sameWeek && nextWeeklyXp > baseWeekly);
        const hasRemainingGap =
          localTotalXp > nextTotalXp || targetWeeklyXp > nextWeeklyXp;
        return madeProgress && hasRemainingGap;
      });

      if (!needsMoreChunks) break;
    }
  });

  syncChain = op.catch(() => undefined);
  return syncChain;
}

/**
 * Pulls remote user progress after signing into an existing Google account on another device.
 */
export async function pullRemoteUserState(
  uid: string,
): Promise<RemoteUserState | null> {
  const services = getFirebaseServices();
  if (!services) return null;
  try {
    const snap = await getDoc(doc(services.db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data() as Partial<RemoteUserState>;
    return {
      displayName:
        typeof data.displayName === "string" && data.displayName.trim()
          ? data.displayName.trim().slice(0, 28)
          : "Jogador",
      avatarId:
        typeof data.avatarId === "string" && ALLOWED_AVATAR_IDS.has(data.avatarId)
          ? (data.avatarId as AvatarId)
          : "fox",
      avatarTone: sanitizeAvatarTone(
        typeof data.avatarTone === "string" ? data.avatarTone : undefined,
      ),
      totalXp: Math.max(0, Math.trunc(data.totalXp ?? 0)),
      weeklyXp: Math.max(0, Math.trunc(data.weeklyXp ?? 0)),
      weekKey: typeof data.weekKey === "string" ? data.weekKey : "",
      processedEventIds: Array.isArray(data.processedEventIds)
        ? data.processedEventIds.filter(
            (id): id is string => typeof id === "string",
          )
        : [],
    };
  } catch {
    return null;
  }
}

/**
 * Fetches live global weekly standings from Firestore and merges simulated bot
 * backfill only when fewer than 10 real active players exist for `weekKey`.
 */
export async function fetchGlobalWeeklyStandings(
  snapshot: EngagementSnapshot,
  localFallbackStandings: LeagueStanding[],
): Promise<GlobalStandingsResult> {
  if (!isFirebaseConfigured()) {
    return {
      standings: localFallbackStandings,
      mode: "local",
      realPlayerCount: 0,
      outsideTopLimit: false,
    };
  }

  try {
    const services = getFirebaseServices();
    if (!services) {
      return {
        standings: localFallbackStandings,
        mode: "local",
        realPlayerCount: 0,
        outsideTopLimit: false,
      };
    }

    const user = await ensureAnonymousSession();
    if (!user) {
      return {
        standings: localFallbackStandings,
        mode: "local",
        realPlayerCount: 0,
        outsideTopLimit: false,
      };
    }

    const weekKey = snapshot.state.league.weekKey;
    const entriesRef = collection(
      services.db,
      "leaderboard_weekly",
      weekKey,
      "entries",
    );
    const topQuery = query(
      entriesRef,
      orderBy("weeklyXp", "desc"),
      limit(TOP_QUERY_LIMIT),
    );
    const querySnap = await getDocs(topQuery);

    const realEntries: LeagueStanding[] = [];
    let currentUserFound = false;

    querySnap.forEach((docSnap) => {
      const data = docSnap.data() as {
        displayName?: string;
        avatarId?: AvatarId;
        avatarTone?: string;
        weeklyXp?: number;
      };
      const isMe = docSnap.id === user.uid;
      if (isMe) currentUserFound = true;
      const name = (data.displayName ?? "Jogador").trim() || "Jogador";
      realEntries.push({
        id: docSnap.id,
        name,
        initial: name.charAt(0).toLocaleUpperCase("pt-BR"),
        avatarId:
          typeof data.avatarId === "string" &&
          ALLOWED_AVATAR_IDS.has(data.avatarId)
            ? data.avatarId
            : "fox",
        tone: sanitizeAvatarTone(data.avatarTone),
        xp: Math.max(0, Math.trunc(data.weeklyXp ?? 0)),
        isPlayer: isMe,
        isBot: false,
      });
    });

    const outsideTopLimit = !currentUserFound && querySnap.size >= TOP_QUERY_LIMIT;

    if (!currentUserFound) {
      realEntries.push({
        id: user.uid,
        name: snapshot.profile.displayName,
        initial: snapshot.profile.avatarInitial,
        avatarId: snapshot.profile.avatarId,
        tone: sanitizeAvatarTone(snapshot.profile.avatarTone),
        xp: snapshot.state.weeklyXp,
        isPlayer: true,
        isBot: false,
      });
    }

    const realPlayerCount = realEntries.length;
    const combined: LeagueStanding[] = [...realEntries];

    if (realPlayerCount < MIN_LEAGUE_SIZE) {
      const botsNeeded = MIN_LEAGUE_SIZE - realPlayerCount;
      const bots = localFallbackStandings
        .filter((item) => !item.isPlayer)
        .slice(0, botsNeeded)
        .map((bot) => ({ ...bot, isBot: true }));
      combined.push(...bots);
    }

    combined.sort(
      (left, right) =>
        right.xp - left.xp || left.name.localeCompare(right.name),
    );

    return {
      standings: combined,
      mode: "live",
      realPlayerCount,
      outsideTopLimit,
    };
  } catch {
    return {
      standings: localFallbackStandings,
      mode: "local",
      realPlayerCount: 0,
      outsideTopLimit: false,
    };
  }
}
