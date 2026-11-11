import { useCallback, useEffect, useState } from "react";
import {
  ENGAGEMENT_UPDATED_EVENT,
  getEngagementSnapshot,
  type EngagementSnapshot,
} from "./engagement";

export function useEngagement() {
  const [snapshot, setSnapshot] = useState<EngagementSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setSnapshot(await getEngagementSnapshot());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
    const handleUpdate = () => void reload();
    window.addEventListener(ENGAGEMENT_UPDATED_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener(ENGAGEMENT_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [reload]);

  return { snapshot, loading, error, reload };
}

