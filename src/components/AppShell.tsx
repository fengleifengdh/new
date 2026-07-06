import type { ReactNode } from 'react';
import { Activity, BarChart3, Bell, Bot, CalendarCheck, Circle, Command, MoreHorizontal, RefreshCw } from 'lucide-react';

export function AppShell(props: { children: ReactNode; time?: string }) {
  return (
    <main className="page-shell">
      <section className="device" aria-label="Bayer 企业微信移动端">
        <StatusBar time={props.time || '9:41'} />
        {props.children}
      </section>
    </main>
  );
}

export function TopBar(props: { name?: string; subtitle?: string }) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <div className="brand-orbit">
          <Command size={15} />
        </div>
        <div>
          <p>{props.name || '商务智眸'}</p>
          <span>{props.subtitle || '项目准入经营看板'}</span>
        </div>
      </div>
      <button className="capsule-button" aria-label="企业微信菜单">
        <MoreHorizontal size={18} />
        <i />
        <Circle size={14} />
      </button>
    </header>
  );
}

export function BottomNav(props: {
  active: 'overview' | 'report';
  onOverview: () => void;
  onReport: () => void;
  unread: number;
}) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      <NavItem active={props.active === 'overview'} icon={<BarChart3 />} label="总览" onClick={props.onOverview} />
      <NavItem active={props.active === 'report'} icon={<CalendarCheck />} label="填报" onClick={props.onReport} />
      <NavItem icon={<Bell />} label="预警" badge={props.unread} />
      <NavItem icon={<Bot />} label="AI助手" />
    </nav>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="content-stack" aria-label="看板加载中">
      <section className="glass-panel summary-panel skeleton-panel">
        <div className="skeleton-line wide" />
        <div className="skeleton-grid">
          <div />
          <div />
        </div>
        <div className="skeleton-chart" />
      </section>
      <section className="glass-panel ranking-panel skeleton-panel small">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </section>
    </div>
  );
}

export function ErrorState(props: { message: string; onRetry: () => void }) {
  return (
    <section className="error-state">
      <Activity size={32} />
      <h1>数据暂时不可用</h1>
      <p>{props.message}</p>
      <button onClick={props.onRetry}>
        <RefreshCw size={16} />
        重新加载
      </button>
    </section>
  );
}

function StatusBar({ time }: { time: string }) {
  return (
    <div className="status-bar" aria-hidden="true">
      <span>{time}</span>
      <div className="system-icons">
        <i className="signal" />
        <i className="wifi" />
        <i className="battery" />
      </div>
    </div>
  );
}

function NavItem(props: { icon: ReactNode; label: string; active?: boolean; badge?: number; onClick?: () => void }) {
  return (
    <button className={props.active ? 'nav-item active' : 'nav-item'} onClick={props.onClick} type="button">
      <span className="nav-icon">
        {props.icon}
        {Boolean(props.badge) && <i>{props.badge}</i>}
      </span>
      <span>{props.label}</span>
    </button>
  );
}

