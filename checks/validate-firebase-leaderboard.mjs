import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

// 1. Secret hygiene: .gitignore must ignore .env.local and .env*.local; .env.example must have empty keys
const gitignore = readFileSync(".gitignore", "utf8");
assert(gitignore.includes(".env.local"), ".gitignore must ignore .env.local");
assert(gitignore.includes(".env.*.local"), ".gitignore must ignore .env.*.local");

const envExample = readFileSync(".env.example", "utf8");
for (const key of [
  "VITE_FIREBASE_API_KEY=",
  "VITE_FIREBASE_AUTH_DOMAIN=",
  "VITE_FIREBASE_PROJECT_ID=",
  "VITE_FIREBASE_STORAGE_BUCKET=",
  "VITE_FIREBASE_MESSAGING_SENDER_ID=",
  "VITE_FIREBASE_APP_ID=",
]) {
  assert(envExample.includes(key), `.env.example missing ${key}`);
  const line = envExample.split(/\r?\n/).find((l) => l.startsWith(key));
  assert.equal(line?.trim(), key, `.env.example must not contain real secret values for ${key}`);
}

// 2. Firebase config files exist
assert(existsSync("firebase.json"), "firebase.json must exist");
assert(existsSync(".firebaserc"), ".firebaserc must exist");
assert(existsSync("firestore.rules"), "firestore.rules must exist");

// 3. Validate firestore.rules privacy, ownership, F1 anti-cheat guards, and default deny
const rules = readFileSync("firestore.rules", "utf8");
assert(rules.includes("rules_version = '2'"), "firestore.rules must use rules_version = '2'");
assert(rules.includes("match /users/{uid}"), "firestore.rules must secure users/{uid}");
assert(
  rules.includes("match /leaderboard_weekly/{weekKey}/entries/{uid}"),
  "firestore.rules must secure leaderboard_weekly/{weekKey}/entries/{uid}",
);
assert(rules.includes("hasOnly"), "firestore.rules must enforce strict field allowlists via hasOnly");
assert(!rules.includes("'email'"), "firestore.rules must never allow email field");
assert(!rules.includes("'photoURL'"), "firestore.rules must never allow photoURL field");
assert(!rules.includes("'fullName'"), "firestore.rules must never allow fullName field");
assert(!rules.includes("'classCode'"), "firestore.rules must never allow classCode field");
assert(
  /match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/s.test(rules),
  "firestore.rules must end with default deny-all fallback",
);

// F1: Deny client delete on users & leaderboard entries, enforce forward-only weekKey, weeklyXp <= totalXp, create caps
const deleteFalseMatches = rules.match(/allow delete:\s*if false;/g) ?? [];
assert(
  deleteFalseMatches.length >= 2,
  "firestore.rules must set allow delete: if false on both users/{uid} and leaderboard_weekly/{weekKey}/entries/{uid}",
);
assert(
  !/allow\s+(?:read,\s*)?delete:\s*if\s+isOwner/.test(rules),
  "firestore.rules must not allow owner delete that bypasses monotonic XP rules",
);
assert(
  rules.includes("request.resource.data.weekKey > resource.data.weekKey"),
  "firestore.rules must enforce forward-only weekKey rollover on users/{uid}",
);
const weeklyLteTotalMatches = rules.match(/data\.weeklyXp\s*<=\s*data\.totalXp/g) ?? [];
assert(
  weeklyLteTotalMatches.length >= 2,
  "firestore.rules must enforce data.weeklyXp <= data.totalXp in both user and leaderboard validators",
);
const totalCreateCapMatches = rules.match(/request\.resource\.data\.totalXp\s*<=\s*50000/g) ?? [];
const weeklyCreateCapMatches = rules.match(/request\.resource\.data\.weeklyXp\s*<=\s*5000/g) ?? [];
assert(
  totalCreateCapMatches.length >= 2 && weeklyCreateCapMatches.length >= 2,
  "firestore.rules must cap create totalXp <= 50000 and weeklyXp <= 5000 on both collections",
);

// 4. Validate Firebase services: graceful offline/unconfigured fallback, F2/F3 ACID sync, F4 credential linking, no PII
const configSrc = readFileSync("src/services/firebase/config.ts", "utf8");
assert(configSrc.includes("isFirebaseConfigured"), "config.ts must export isFirebaseConfigured");
assert(configSrc.includes("return null"), "config.ts must gracefully return null when unconfigured");

const authSrc = readFileSync("src/services/firebase/auth.ts", "utf8");
assert(authSrc.includes("signInAnonymously"), "auth.ts must support silent anonymous auth");
assert(authSrc.includes("linkWithPopup"), "auth.ts must support anonymous -> Google linking");
assert(
  authSrc.includes("auth/credential-already-in-use"),
  "auth.ts must handle auth/credential-already-in-use fallback",
);
assert(
  authSrc.includes("GoogleAuthProvider.credentialFromError") &&
    authSrc.includes("signInWithCredential"),
  "F4: auth.ts must sign in via credentialFromError + signInWithCredential on credential-already-in-use",
);
assert(
  authSrc.includes("auth/popup-blocked"),
  "F4: auth.ts must handle auth/popup-blocked with a clear user message",
);
assert(!authSrc.includes(".email"), "auth.ts must not expose user email");
assert(!authSrc.includes(".photoURL"), "auth.ts must not expose Google photoURL");

const syncSrc = readFileSync("src/services/firebase/leaderboardSync.ts", "utf8");
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
const syncCode = stripComments(syncSrc);
assert(syncCode.includes("leaderboard_weekly"), "leaderboardSync.ts must target leaderboard_weekly");
assert(syncCode.includes("processedEventIds"), "leaderboardSync.ts must deduplicate via processedEventIds");
assert(
  syncCode.includes("runTransaction(") && !syncCode.includes("setDoc("),
  "F2/F3: leaderboardSync.ts must use atomic runTransaction instead of sequential setDoc writes",
);
assert(
  syncCode.includes("effectiveWeekKey") && syncCode.includes("remoteWeekKey > localWeekKey"),
  "F2/F3: leaderboardSync.ts must guard forward-only effectiveWeekKey against clock skew",
);
assert(
  syncCode.includes("MAX_CATCHUP_CHUNKS") && syncCode.includes("MAX_INITIAL_TOTAL_XP"),
  "F2/F3: leaderboardSync.ts must reconcile bounded offline/merge XP chunks and align create caps",
);
assert(
  syncCode.includes("sanitizeAvatarTone"),
  "F5: leaderboardSync.ts must sanitize avatarTone against Firestore allowlist",
);
assert(
  syncCode.includes("outsideTopLimit"),
  "F5: leaderboardSync.ts must expose outsideTopLimit when current user is outside Top 25",
);
assert(!/\bphotoURL\b/.test(syncCode), "leaderboardSync.ts must never write photoURL");
assert(!/\bemail\b/.test(syncCode), "leaderboardSync.ts must never write email");
assert(!/\bfullName\b/.test(syncCode), "leaderboardSync.ts must never write fullName");
assert(!/\bclassCode\b/.test(syncCode), "Slice 3 must use a single global league with no classCode");

// 5. Validate engagement.ts preserves validate-learning-path invariants + preset avatars + F5 avatarTone
const engagementSrc = readFileSync("src/services/progress/engagement.ts", "utf8");
assert(engagementSrc.includes("PRESET_AVATARS"), "engagement.ts must define PRESET_AVATARS");
assert(
  engagementSrc.includes("ALLOWED_AVATAR_TONES") &&
    engagementSrc.includes("sanitizeAvatarTone"),
  "F5: engagement.ts must export ALLOWED_AVATAR_TONES and sanitizeAvatarTone",
);
assert(engagementSrc.includes("enqueueLeaderboardSync"), "engagement.ts must trigger idempotent leaderboard sync");
assert(engagementSrc.includes("mutationQueue = operation.then("), "Must preserve mutationQueue invariant");
assert(
  engagementSrc.includes("summarizeGrammarCourseProgress().uniqueQuestions"),
  "Must preserve summarizeGrammarCourseProgress invariant",
);
assert(
  engagementSrc.includes("achievement.progress = Math.max("),
  "Must preserve monotonic achievement invariant",
);

// 6. Validate UI surfaces & F2/F5 wiring
const appShellSrc = readFileSync("src/components/AppShell.tsx", "utf8");
assert(
  appShellSrc.includes('addEventListener("online"') &&
    appShellSrc.includes("enqueueLeaderboardSync("),
  "F2: AppShell must flush leaderboard sync on online reconnect and startup",
);
const homeSrc = readFileSync("src/pages/HomePage.tsx", "utf8");
assert(homeSrc.includes("fetchGlobalWeeklyStandings"), "HomePage LeagueCard must fetch global weekly standings");
assert(
  homeSrc.includes("outsideTopLimit") && homeSrc.includes('"25+"'),
  'F5: HomePage LeagueCard must display "25+" when outside Top 25',
);
const profileSrc = readFileSync("src/pages/ProfilePage.tsx", "utf8");
assert(profileSrc.includes("connectGoogleAccount"), "ProfilePage must offer optional Google linking");
assert(profileSrc.includes("PRESET_AVATARS"), "ProfilePage must offer preset avatar selection");
assert(
  profileSrc.includes("noticeTimerRef") && profileSrc.includes("clearTimeout("),
  "F5: ProfilePage must clear toast timeout ref on repeated notices and unmount",
);

console.log(
  JSON.stringify(
    {
      firebaseConfigSafeFallback: true,
      firestoreRulesNonPiiVerified: true,
      firestoreRulesAntiCheatF1Verified: true,
      acidTransactionSyncF2F3Verified: true,
      credentialFromErrorAuthF4Verified: true,
      avatarToneAndUiHardeningF5Verified: true,
      globalWeeklyLeagueNoClassCode: true,
    },
    null,
    2,
  ),
);
