interface CompletionSession {
  active: Promise<void> | null;
  completed: boolean;
  id: string;
}

interface CompletionCoordinatorOptions<Result> {
  createSessionId: () => string;
  maxAttempts?: number;
  persist: (sessionId: string, result: Result) => Promise<void>;
}

export interface CompletionCoordinator<Result> {
  complete: (result: Result) => Promise<void>;
  getSessionId: () => string;
  reset: () => string;
}

export function createCompletionCoordinator<Result>({
  createSessionId,
  maxAttempts = 2,
  persist,
}: CompletionCoordinatorOptions<Result>): CompletionCoordinator<Result> {
  const attempts = Math.max(1, Math.trunc(maxAttempts));
  let current = createSession();
  let queue = Promise.resolve();

  function createSession(): CompletionSession {
    return {
      active: null,
      completed: false,
      id: createSessionId(),
    };
  }

  function complete(result: Result): Promise<void> {
    const session = current;
    if (session.completed) return Promise.resolve();
    if (session.active) return session.active;

    const operation = queue.then(async () => {
      let lastError: unknown;
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          await persist(session.id, result);
          session.completed = true;
          return;
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError;
    });

    session.active = operation;
    queue = operation.catch(() => undefined);
    const clearActive = () => {
      if (session.active === operation) session.active = null;
    };
    void operation.then(clearActive, clearActive);
    return operation;
  }

  function reset(): string {
    current = createSession();
    return current.id;
  }

  return {
    complete,
    getSessionId: () => current.id,
    reset,
  };
}
