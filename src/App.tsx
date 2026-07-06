import { useState } from 'react';
import { AppShell, BottomNav, DashboardSkeleton, ErrorState, TopBar } from './components/AppShell';
import { useDashboardData } from './hooks/useDashboardData';
import type { AppView } from './types/navigation';
import { DetailView, OverviewView } from './features/dashboard/DashboardViews';
import { ReportDetailView, ReportListView } from './features/report/ReportViews';

export function App() {
  const { data, error, loading, reload } = useDashboardData();
  const [view, setView] = useState<AppView>('overview');

  const isReportView = view.startsWith('report');

  return (
    <AppShell time={data?.summary.updateTime}>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <>
          <TopBar name={data?.user.name} subtitle={data?.user.subtitle} />
          {loading || !data ? (
            <DashboardSkeleton />
          ) : view === 'details' ? (
            <DetailView data={data} onBack={() => setView('overview')} />
          ) : view === 'reportList' ? (
            <ReportListView onEdit={() => setView('reportEdit')} onOpenDetail={() => setView('reportDetail')} />
          ) : view === 'reportDetail' ? (
            <ReportDetailView mode="readonly" onBack={() => setView('reportList')} onEdit={() => setView('reportEdit')} />
          ) : view === 'reportEdit' ? (
            <ReportDetailView mode="edit" onBack={() => setView('reportList')} onEdit={() => setView('reportEdit')} />
          ) : (
            <OverviewView data={data} onOpenDetails={() => setView('details')} />
          )}

          <BottomNav
            active={isReportView ? 'report' : 'overview'}
            onOverview={() => setView('overview')}
            onReport={() => setView('reportList')}
            unread={data?.alerts.unread || 0}
          />
        </>
      )}
    </AppShell>
  );
}

