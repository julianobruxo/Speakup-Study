import { useCallback, useEffect, useState } from "react";
import { getProgressSummary, PROGRESS_UPDATED_EVENT } from "./localProgress";
import type { ProgressSummary } from "./progress";

interface ProgressSummaryState {
  summary: ProgressSummary | null;
  loading: boolean;
  error: boolean;
  reload: () => Promise<void>;
}

export function useProgressSummary(): ProgressSummaryState {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    try {
      setSummary(await getProgressSummary());
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
    window.addEventListener(PROGRESS_UPDATED_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener(PROGRESS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [reload]);

  return { summary, loading, error, reload };
}

