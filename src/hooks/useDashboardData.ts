import { useEffect, useState } from 'react';
import { fetchDashboardData, type DashboardData } from '../api/dashboard';

interface DashboardState {
  data: DashboardData | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

export function useDashboardData(): DashboardState {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchDashboardData(controller.signal)
      .then((nextData) => {
        setData(nextData);
      })
      .catch((nextError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : '看板数据加载失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  return {
    data,
    error,
    loading,
    reload: () => setReloadKey((key) => key + 1),
  };
}
