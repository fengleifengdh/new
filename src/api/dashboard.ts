export interface DashboardData {
  user: {
    name: string;
    subtitle: string;
  };
  period: string;
  tabs: string[];
  activeTab: string;
  summary: {
    admissionRate: number;
    admissionRateDelta: number;
    admissionCount: number;
    admissionCountDelta: number;
    updateTime: string;
  };
  trend: DashboardTrend;
  ranking: RankingItem[];
  details: DashboardDetails;
  alerts: {
    unread: number;
    riskText: string;
  };
}

export interface DashboardDetails {
  gauges: DetailGauge[];
  bars: DetailBar[];
  dealerRanking: DealerRank[];
}

export interface DetailGauge {
  title: string;
  totalRate: number;
  formalRate: number;
  tone: 'green' | 'blue';
}

export interface DetailBar {
  label: string;
  value: number;
  tone: 'green' | 'blue';
}

export interface DealerRank {
  id: string;
  name: string;
  value: number;
}

export interface DashboardTrend {
  defaultMode: TrendMode;
  modes: TrendModeData[];
}

export type TrendMode = 'monthly' | 'cumulative';

export interface TrendModeData {
  id: TrendMode;
  label: string;
  months: string[];
  rate: number[];
  baseline: number[];
  marker: {
    label: string;
    value: number;
    change: number;
    target: number;
  };
}

export interface RankingItem {
  id: string;
  name: string;
  shortName: string;
  admissionRate: number;
  admissionCount: number;
  trend: number;
  tone: 'rose' | 'cyan' | 'amber' | 'green';
}

const DASHBOARD_ENDPOINT = '/api/dashboard.json';

export async function fetchDashboardData(signal?: AbortSignal): Promise<DashboardData> {
  const response = await fetch(DASHBOARD_ENDPOINT, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`看板接口请求失败：${response.status}`);
  }

  return response.json() as Promise<DashboardData>;
}
