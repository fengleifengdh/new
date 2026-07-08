import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Filter,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import type { DashboardData, DealerRank, DetailBar, DetailGauge, RankingItem, TrendMode, TrendModeData } from '../../api/dashboard';
import type { TrendPointSelection } from './charts';
import { DealerRankingEChart, DetailBarsEChart, GaugeEChart, TrendEChart } from './charts';

type AdmissionType = 'total' | 'formal';

interface AdmissionSummaryView {
  admissionRate: number;
  admissionRateDelta: number;
  admissionCount: number;
  admissionCountDelta: number;
}

const admissionTabs = [
  { id: 'total', label: '总准入' },
  { id: 'formal', label: '正式准入' },
] as const;

const BAYER_CARD_ID = 'bayer';
const detailPeriodTabs = [
  { id: 'phase-3', label: '三期' },
  { id: 'phase-2', label: '二期' },
  { id: 'phase-1', label: '一期' },
  { id: 'overall-1', label: '总体' },
  { id: 'overall-2', label: '总体' },
] as const;

export function OverviewView({ data, onOpenDetails }: { data: DashboardData; onOpenDetails: () => void }) {
  return (
    <>
      <section className="hero-row">
        <div>
          <span className="eyebrow">首页</span>
          <h1>项目准入统计排行</h1>
        </div>
        <time>{data.period}</time>
      </section>
      <DashboardContent data={data} onOpenDetails={onOpenDetails} />
    </>
  );
}

export function DetailView({ data, onBack }: { data: DashboardData; onBack: () => void }) {
  const [activePeriod, setActivePeriod] = useState(detailPeriodTabs.find((tab) => tab.label === data.activeTab)?.id || detailPeriodTabs[0].id);
  const [admissionType, setAdmissionType] = useState<'total' | 'formal'>('total');
  const [selectedProjectId, setSelectedProjectId] = useState('bayer');
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [trendExpanded, setTrendExpanded] = useState(false);
  const [trendMode, setTrendMode] = useState<TrendMode>(data.trend.defaultMode);
  const projects = useMemo(
    () => [{ id: 'bayer', name: 'Bayer' }, ...data.ranking.map((r) => ({ id: r.id, name: r.name }))],
    [data.ranking],
  );
  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeTrend = data.trend.modes.find((mode) => mode.id === trendMode) || data.trend.modes[0];
  const activePeriodSnapshot = getProjectSnapshot(selectedProjectId, activePeriod, data);
  const admissionTabs = [
    { id: 'total', label: '总准入' },
    { id: 'formal', label: '正式准入' },
  ] as const;

  return (
    <>
      <section className="detail-title-row">
        <button className="back-button" onClick={onBack} type="button">
          <ArrowLeft size={15} />
          返回至总览
        </button>
      </section>

      <div className="content-stack details-stack">
        <section className="glass-panel summary-panel detail-summary">
          <div className="segment-row detail-segment-row">
            <BayerMark />
            <div className="segments multi count-5" role="tablist" aria-label="周期切换">
              {detailPeriodTabs.map((tab) => (
                <button
                  className={tab.id === activePeriod ? 'selected' : ''}
                  key={tab.id}
                  onClick={() => setActivePeriod(tab.id)}
                  role="tab"
                  aria-selected={tab.id === activePeriod}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="section-toolbar">
            <div className="project-switcher-wrap">
              <button
                className="project-switcher-btn"
                onClick={() => setProjectDropdownOpen((open) => !open)}
                type="button"
                aria-expanded={projectDropdownOpen}
              >
                {activeProject.name}
                <ChevronDown size={13} className={projectDropdownOpen ? 'rotated' : ''} />
              </button>
              {projectDropdownOpen && (
                <>
                  <button
                    className="project-dropdown-scrim"
                    onClick={() => setProjectDropdownOpen(false)}
                    type="button"
                    aria-label="关闭项目选择"
                  />
                  <div className="project-dropdown">
                    {projects.map((p) => (
                      <button
                        className={p.id === selectedProjectId ? 'selected' : ''}
                        key={p.id}
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setProjectDropdownOpen(false);
                        }}
                        type="button"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div role="tablist" aria-label="准入类型">
              {admissionTabs.map((tab) => (
                <button
                  className={tab.id === admissionType ? 'selected' : ''}
                  key={tab.id}
                  onClick={() => setAdmissionType(tab.id)}
                  role="tab"
                  aria-selected={tab.id === admissionType}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="kpi-grid">
            <KpiCard
              label="总准入率"
              value={`${activePeriodSnapshot.summary.admissionRate.toFixed(1)}%`}
              delta={activePeriodSnapshot.summary.admissionRateDelta}
              strong
            />
            <KpiCard
              label="总准入家数"
              value={activePeriodSnapshot.summary.admissionCount.toLocaleString('zh-CN')}
              delta={activePeriodSnapshot.summary.admissionCountDelta}
            />
          </div>

          {trendExpanded && (
            <>
              <div className="section-toolbar chart-toolbar">
                <span>总准入率趋势</span>
                <div role="tablist" aria-label="详情趋势统计口径">
                  {data.trend.modes.map((mode) => (
                    <button
                      className={mode.id === trendMode ? 'selected' : ''}
                      key={mode.id}
                      onClick={() => setTrendMode(mode.id)}
                      role="tab"
                      aria-selected={mode.id === trendMode}
                      type="button"
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart data={activeTrend} compact />
            </>
          )}

          <button
            className={trendExpanded ? 'summary-chevron expanded' : 'summary-chevron'}
            onClick={() => setTrendExpanded((expanded) => !expanded)}
            type="button"
            aria-expanded={trendExpanded}
            aria-label={trendExpanded ? '收起总准入率趋势' : '展开总准入率趋势'}
          >
            <ChevronDown size={15} />
          </button>
        </section>

        <DetailMetricsPanel gauges={activePeriodSnapshot.gauges} bars={activePeriodSnapshot.bars} />
        <DealerRankingPanel dealers={activePeriodSnapshot.dealerRanking} />
      </div>
    </>
  );
}

function getProjectSnapshot(projectId: string, periodId: string, data: DashboardData) {
  const periodFactors: Record<string, number> = {
    'phase-3': 1,
    'phase-2': 0.94,
    'phase-1': 0.88,
    'overall-1': 0.97,
    'overall-2': 0.92,
  };
  const periodFactor = periodFactors[periodId] || 1;

  const projectFactors: Record<string, number> = {
    bayer: 1,
    'v-club': 0.96,
    ad: 0.91,
    deer: 0.85,
  };
  const projectFactor = projectFactors[projectId] ?? 1;
  const factor = periodFactor * projectFactor;

  return {
    bars: data.details.bars.map((bar) => ({
      ...bar,
      value: Math.round(bar.value * factor),
    })),
    gauges: data.details.gauges.map((gauge) => ({
      ...gauge,
      totalRate: clampPercent(gauge.totalRate * factor),
      formalRate: clampPercent(gauge.formalRate * factor),
    })),
    dealerRanking: data.details.dealerRanking.map((dealer) => ({
      ...dealer,
      value: clampPercent(dealer.value * factor),
    })),
    summary: {
      admissionCount: Math.round(data.summary.admissionCount * factor),
      admissionCountDelta: Number((data.summary.admissionCountDelta * factor).toFixed(1)),
      admissionRate: clampPercent(data.summary.admissionRate * factor),
      admissionRateDelta: Number((data.summary.admissionRateDelta * factor).toFixed(1)),
    },
  };
}

function clampPercent(value: number) {
  return Number(Math.min(99.9, Math.max(0, value)).toFixed(1));
}

const dealerTreeItems = Array.from({ length: 32 }, (_, index) => {
  const status = index < 4 ? 'formal' : index < 8 ? 'informal' : 'pending';
  const day = ((index * 7) % 28) + 1;

  return {
    id: index + 1,
    name: '安徽省第二人民医院',
    status,
    date: `2026-06-${String(day).padStart(2, '0')}`,
  };
});

function DealerTreeOverlay({ onClose }: { onClose: () => void }) {
  const [area, setArea] = useState('北京市');
  const [typeOpen, setTypeOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  return (
    <div className="project-tree-overlay" role="dialog" aria-modal="true" aria-label="大区下钻">
      <button className="project-tree-scrim" onClick={onClose} type="button" aria-label="关闭大区下钻" />
      <aside className="project-tree-panel">
        <header>
          <h2>
            总条目 <strong>32</strong> 家
          </h2>
          <button onClick={onClose} type="button" aria-label="关闭大区下钻">
            <X size={19} />
          </button>
        </header>

        <div className="project-tree-chip">
          {area}
          <button onClick={() => setArea('')} type="button" aria-label={`移除${area}`}>
            <X size={12} />
          </button>
        </div>

        <div className="project-tree-filters">
          <button type="button" onClick={() => { setTypeOpen((o) => !o); setTimeOpen(false); }}>
            准入形式
            <ChevronDown size={13} className={typeOpen ? 'rotated' : ''} />
          </button>
          <button type="button" onClick={() => { setTimeOpen((o) => !o); setTypeOpen(false); }}>
            准入时间
            <ChevronDown size={13} className={timeOpen ? 'rotated' : ''} />
          </button>
        </div>

        <ol className="project-tree-list">
          {dealerTreeItems.slice(0, 11).map((item) => (
            <li key={item.id}>
              <span>{item.id}</span>
              <div>
                <strong>{item.name}</strong>
                <p>
                  <em className={item.status}>
                    {item.status === 'formal' ? '正式准入' : item.status === 'informal' ? '非正式准入' : '未准入'}
                  </em>
                  <small>准入时间： {item.date}</small>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}

function DashboardContent({ data, onOpenDetails }: { data: DashboardData; onOpenDetails: () => void }) {
  const [activePeriod, setActivePeriod] = useState(data.activeTab);
  const [admissionType, setAdmissionType] = useState<AdmissionType>('total');
  const [trendMode, setTrendMode] = useState<TrendMode>(data.trend.defaultMode);
  const [expandedCardId, setExpandedCardId] = useState(BAYER_CARD_ID);
  const activeTrend = data.trend.modes.find((mode) => mode.id === trendMode) || data.trend.modes[0];

  return (
    <div className="content-stack">
      <section className="glass-panel ranking-panel">
        <div className="ranking-list">
          <BayerRankingRow
            activeAdmissionType={admissionType}
            activePeriod={activePeriod}
            activeTrend={activeTrend}
            expanded={expandedCardId === BAYER_CARD_ID}
            periodTabs={data.tabs}
            summary={data.summary}
            trendMode={trendMode}
            trendModes={data.trend.modes}
            onAdmissionTypeChange={setAdmissionType}
            onOpenDetails={onOpenDetails}
            onPeriodChange={setActivePeriod}
            onToggle={() => setExpandedCardId(BAYER_CARD_ID)}
            onTrendModeChange={setTrendMode}
          />
          {data.ranking.map((item) => (
            <RankingRow
              activePeriod={activePeriod}
              activeTrend={activeTrend}
              expanded={expandedCardId === item.id}
              item={item}
              key={item.id}
              periodTabs={data.tabs}
              selectedAdmissionType={admissionType}
              trendMode={trendMode}
              trendModes={data.trend.modes}
              onAdmissionTypeChange={setAdmissionType}
              onOpenDetails={onOpenDetails}
              onPeriodChange={setActivePeriod}
              onTrendModeChange={setTrendMode}
              onToggle={() => setExpandedCardId(item.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function BayerRankingRow({
  activeAdmissionType,
  activePeriod,
  activeTrend,
  expanded,
  onAdmissionTypeChange,
  onOpenDetails,
  onPeriodChange,
  onToggle,
  onTrendModeChange,
  periodTabs,
  summary,
  trendMode,
  trendModes,
}: {
  activeAdmissionType: AdmissionType;
  activePeriod: string;
  activeTrend: TrendModeData;
  expanded: boolean;
  onAdmissionTypeChange: (value: AdmissionType) => void;
  onOpenDetails: () => void;
  onPeriodChange: (value: string) => void;
  onToggle: () => void;
  onTrendModeChange: (value: TrendMode) => void;
  periodTabs: string[];
  summary: AdmissionSummaryView;
  trendMode: TrendMode;
  trendModes: TrendModeData[];
}) {
  return (
    <article className={expanded ? 'ranking-row bayer-ranking-row expanded' : 'ranking-row bayer-ranking-row'}>
      {!expanded && <BayerCollapsedRow summary={summary} onToggle={onToggle} expanded={expanded} />}
      {expanded && (
        <div className="ranking-expanded-panel">
          <AdmissionTemplate
            activeAdmissionType={activeAdmissionType}
            activePeriod={activePeriod}
            activeTrend={activeTrend}
            periodTabs={periodTabs}
            summary={summary}
            trendMode={trendMode}
            trendModes={trendModes}
            onAdmissionTypeChange={onAdmissionTypeChange}
            onOpenDetails={onOpenDetails}
            onPeriodChange={onPeriodChange}
            onTrendModeChange={onTrendModeChange}
          />
        </div>
      )}
    </article>
  );
}

function BayerCollapsedRow({ expanded, onToggle, summary }: { expanded: boolean; onToggle: () => void; summary: AdmissionSummaryView }) {
  return (
    <button className="bayer-collapsed-row" onClick={onToggle} type="button" aria-expanded={expanded}>
      <BayerMark />
      <div className="ranking-name">
        <strong>Bayer</strong>
        <span>项目准入统计排行</span>
      </div>
      <div className="ranking-metric">
        <span>总准入率</span>
        <strong>{summary.admissionRate.toFixed(1)}%</strong>
      </div>
      <div className="ranking-metric">
        <span>准入数</span>
        <strong>{summary.admissionCount.toLocaleString('zh-CN')}</strong>
      </div>
    </button>
  );
}

function BayerMark() {
  return (
    <div className="bayer-mark" aria-label="Bayer">
      <span>Bayer</span>
    </div>
  );
}

function AdmissionTemplate({
  activeAdmissionType,
  activePeriod,
  activeTrend,
  onAdmissionTypeChange,
  onOpenDetails,
  onPeriodChange,
  onTrendModeChange,
  periodTabs,
  summary,
  trendMode,
  trendModes,
}: {
  activeAdmissionType: AdmissionType;
  activePeriod?: string;
  activeTrend?: TrendModeData;
  onAdmissionTypeChange: (value: AdmissionType) => void;
  onOpenDetails?: () => void;
  onPeriodChange?: (value: string) => void;
  onTrendModeChange?: (value: TrendMode) => void;
  periodTabs?: string[];
  summary: AdmissionSummaryView;
  trendMode?: TrendMode;
  trendModes?: TrendModeData[];
}) {
  return (
    <div className="admission-template">
      {periodTabs && activePeriod && onPeriodChange && (
        <div className="segment-row">
          <BayerMark />
          <div className={`segments ${periodTabs.length > 2 ? `multi count-${periodTabs.length}` : ''}`} role="tablist" aria-label="周期切换">
            {periodTabs.map((tab, index) => (
              <button
                className={tab === activePeriod ? 'selected' : ''}
                key={`${tab}-${index}`}
                onClick={() => onPeriodChange(tab)}
                role="tab"
                aria-selected={tab === activePeriod}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      <AdmissionDataBlock
        activeAdmissionType={activeAdmissionType}
        onAdmissionTypeChange={onAdmissionTypeChange}
        summary={summary}
      />

      {activeTrend && trendModes && trendMode && onTrendModeChange && (
        <>
          <div className="section-toolbar chart-toolbar">
            <span>总准入率趋势</span>
            <div role="tablist" aria-label="趋势统计口径">
              {trendModes.map((mode) => (
                <button
                  className={mode.id === trendMode ? 'selected' : ''}
                  key={mode.id}
                  onClick={() => onTrendModeChange(mode.id)}
                  role="tab"
                  aria-selected={mode.id === trendMode}
                  type="button"
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <TrendChart data={activeTrend} onOpenDetails={onOpenDetails} />
        </>
      )}
    </div>
  );
}

function AdmissionDataBlock({
  activeAdmissionType,
  onAdmissionTypeChange,
  summary,
}: {
  activeAdmissionType: AdmissionType;
  onAdmissionTypeChange: (value: AdmissionType) => void;
  summary: AdmissionSummaryView;
}) {
  return (
    <>
      <div className="section-toolbar">
        <span>准入数据</span>
        <div role="tablist" aria-label="准入类型">
          {admissionTabs.map((tab) => (
            <button
              className={tab.id === activeAdmissionType ? 'selected' : ''}
              key={tab.id}
              onClick={() => onAdmissionTypeChange(tab.id)}
              role="tab"
              aria-selected={tab.id === activeAdmissionType}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <KpiCard label="总准入率" value={`${summary.admissionRate.toFixed(1)}%`} delta={summary.admissionRateDelta} strong />
        <KpiCard label="总准入家数" value={summary.admissionCount.toLocaleString('zh-CN')} delta={summary.admissionCountDelta} />
      </div>
    </>
  );
}

function KpiCard({ label, value, delta, strong }: { label: string; value: string; delta: number; strong?: boolean }) {
  const positive = delta >= 0;

  return (
    <article className={strong ? 'kpi-card primary' : 'kpi-card'}>
      <div className="kpi-label">
        <span>{label}</span>
        {strong && <ShieldCheck size={13} />}
      </div>
      <strong>{value}</strong>
      <span className={positive ? 'delta-pill up' : 'delta-pill down'}>
        {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(delta).toFixed(1)}%
      </span>
    </article>
  );
}

function TrendChart({ data, onOpenDetails, compact }: { data: TrendModeData; onOpenDetails?: () => void; compact?: boolean }) {
  const [selectedPoint, setSelectedPoint] = useState<TrendPointSelection | null>(null);

  useEffect(() => {
    setSelectedPoint(null);
  }, [data]);

  useEffect(() => {
    if (!selectedPoint) {
      return;
    }

    const clearSelectedPoint = () => setSelectedPoint(null);

    document.addEventListener('pointerdown', clearSelectedPoint);

    return () => {
      document.removeEventListener('pointerdown', clearSelectedPoint);
    };
  }, [selectedPoint]);

  const markerDown = selectedPoint?.change !== null && selectedPoint?.change !== undefined ? selectedPoint.change < 0 : false;

  return (
    <div className={compact ? 'chart-card compact' : 'chart-card'}>
      {selectedPoint && (
        <div className="chart-meta">
          <span>{selectedPoint.label}</span>
          <div>
            <em>当前比率</em>
            <strong>{selectedPoint.value.toFixed(1)}%</strong>
          </div>
          <div>
            <em>环比</em>
            <strong className={selectedPoint.change === null ? 'neutral' : markerDown ? 'down' : 'up'}>
              {selectedPoint.change === null ? '暂无' : `${markerDown ? '↘' : '↗'} ${Math.abs(selectedPoint.change).toFixed(1)}%`}
            </strong>
          </div>
        </div>
      )}
      <TrendEChart data={data} compact={compact} onPointSelect={setSelectedPoint} />
      {onOpenDetails && (
        <button className="details-link" onClick={onOpenDetails} type="button">
          查看更多
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function DetailMetricsPanel({ gauges, bars }: { gauges: DetailGauge[]; bars: DetailBar[] }) {
  return (
    <section className="glass-panel detail-card">
      <h2>准入详情</h2>
      <div className="detail-filters">
        <button type="button" className="filter-chip mine">
          我的
          <ChevronDown size={13} />
        </button>
        <span>对比</span>
        <button type="button" className="filter-chip nation">
          全国
          <ChevronDown size={13} />
        </button>
      </div>

      <div className="gauge-grid">
        {gauges.map((gauge) => (
          <GaugeCard gauge={gauge} key={gauge.title} />
        ))}
      </div>

      <div className="bar-chart" aria-label="准入详情柱状图">
        <DetailBarsEChart bars={bars} />
      </div>
    </section>
  );
}

function GaugeCard({ gauge }: { gauge: DetailGauge }) {
  return (
    <article className="gauge-card">
      <div className="gauge-echart">
        <GaugeEChart gauge={gauge} />
      </div>
      <div className="gauge-legend">
        <span>
          <i className="dot neutral" />
          总准入率 <em>{gauge.totalRate.toFixed(1)}%</em>
        </span>
        <span>
          <i className={`dot ${gauge.tone}`} />
          正式准入率 <em>{gauge.formalRate.toFixed(1)}%</em>
        </span>
      </div>
    </article>
  );
}

function DealerRankingPanel({ dealers }: { dealers: DealerRank[] }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [treeOpen, setTreeOpen] = useState(false);
  const [rankMode, setRankMode] = useState<'total' | 'dealer'>('total');
  const [activeFilter, setActiveFilter] = useState({
    area: '华北区',
    province: '河北省',
    business: '商务1',
    dealer: '名字1',
  });
  const filterRows = [
    { area: '华北区', province: '河北省', business: '商务1', dealer: '名字1' },
    { area: '华中区', province: '河北省', business: '商务2', dealer: '名字2' },
    { area: '华东区', province: '河北省', business: '商务3', dealer: '名字3' },
    { area: '华南区', province: '河北省', business: '商务4', dealer: '名字4' },
    { area: '华南区', province: '', business: '商务5', dealer: '名字5' },
    { area: '华南区', province: '', business: '商务6', dealer: '名字6' },
  ];

  return (
    <section className="glass-panel detail-card ranking-detail-card">
      <div className="detail-panel-heading">
        <h2>准入率排名</h2>
        <span>
          <i />
          我的排名
        </span>
      </div>
      <div className="rank-filters">
        <button type="button">
          总准入率
          <ChevronDown size={13} />
        </button>
        <button type="button" onClick={() => setFilterOpen(true)}>
          筛选
          <Filter size={13} />
        </button>
        <button
          type="button"
          className={rankMode === 'dealer' ? 'selected' : ''}
          onClick={() => setRankMode((m) => (m === 'total' ? 'dealer' : 'total'))}
        >
          按经销商排名
          <ChevronDown size={13} />
        </button>
      </div>
      <div className="dealer-list">
        <DealerRankingEChart dealers={dealers} onSelectDealer={() => setTreeOpen(true)} />
      </div>
      <button className="load-all" type="button">
        <ChevronDown size={15} />
        加载全部
      </button>
      {filterOpen && (
        <FilterDrawer
          activeFilter={activeFilter}
          rows={filterRows}
          onClose={() => setFilterOpen(false)}
          onConfirm={() => setFilterOpen(false)}
          onReset={() =>
            setActiveFilter({
              area: '华北区',
              province: '河北省',
              business: '商务1',
              dealer: '名字1',
            })
          }
          onSelect={setActiveFilter}
        />
      )}
      {treeOpen && <DealerTreeOverlay onClose={() => setTreeOpen(false)} />}
    </section>
  );
}

function FilterDrawer({
  activeFilter,
  rows,
  onClose,
  onConfirm,
  onReset,
  onSelect,
}: {
  activeFilter: { area: string; province: string; business: string; dealer: string };
  rows: Array<{ area: string; province: string; business: string; dealer: string }>;
  onClose: () => void;
  onConfirm: () => void;
  onReset: () => void;
  onSelect: (value: { area: string; province: string; business: string; dealer: string }) => void;
}) {
  return (
    <div className="filter-overlay" role="presentation">
      <button className="filter-scrim" onClick={onClose} type="button" aria-label="关闭筛选" />
      <aside className="filter-drawer" aria-label="经销商筛选">
        <div className="filter-table">
          <div className="filter-head">
            <span>大区</span>
            <span>省份</span>
            <span>商务</span>
            <span>经销商</span>
          </div>
          <div className="filter-body">
            {rows.map((row) => {
              const selected =
                activeFilter.area === row.area &&
                activeFilter.province === row.province &&
                activeFilter.business === row.business &&
                activeFilter.dealer === row.dealer;

              return (
                <button
                  className={selected ? 'filter-row selected' : 'filter-row'}
                  key={`${row.area}-${row.business}-${row.dealer}`}
                  onClick={() => onSelect(row)}
                  type="button"
                >
                  <span>{row.area}</span>
                  <span>{row.province || '-'}</span>
                  <span>{row.business}</span>
                  <span>{row.dealer}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="filter-actions">
          <button className="reset" onClick={onReset} type="button">
            重置
          </button>
          <button className="confirm" onClick={onConfirm} type="button">
            确定
          </button>
        </div>
      </aside>
    </div>
  );
}

function RankingRow({
  activePeriod,
  activeTrend,
  expanded,
  item,
  onAdmissionTypeChange,
  onOpenDetails,
  onPeriodChange,
  onToggle,
  onTrendModeChange,
  periodTabs,
  selectedAdmissionType,
  trendMode,
  trendModes,
}: {
  activePeriod: string;
  activeTrend: TrendModeData;
  expanded: boolean;
  item: RankingItem;
  onAdmissionTypeChange: (value: AdmissionType) => void;
  onOpenDetails: () => void;
  onPeriodChange: (value: string) => void;
  onToggle: () => void;
  onTrendModeChange: (value: TrendMode) => void;
  periodTabs: string[];
  selectedAdmissionType: AdmissionType;
  trendMode: TrendMode;
  trendModes: TrendModeData[];
}) {
  const positive = item.trend >= 0;
  const itemSummary = {
    admissionRate: item.admissionRate,
    admissionRateDelta: item.trend,
    admissionCount: item.admissionCount,
    admissionCountDelta: item.trend,
  };

  return (
    <article className={expanded ? 'ranking-row expanded' : 'ranking-row'}>
      {!expanded && (
        <button className="ranking-row-trigger" onClick={onToggle} type="button" aria-expanded={expanded}>
          <div className={`project-logo ${item.tone}`}>
            <span>{item.shortName}</span>
          </div>
          <div className="ranking-name">
            <strong>{item.name}</strong>
            <span>{positive ? '高于月度均值' : '低于月度目标'}</span>
          </div>
          <div className="ranking-metric">
            <span>总准入率</span>
            <strong className={positive ? '' : 'danger'}>{item.admissionRate}%</strong>
          </div>
          <div className="ranking-metric">
            <span>准入数</span>
            <strong>{item.admissionCount}</strong>
          </div>
          <ChevronDown className="ranking-expand-icon" size={14} />
        </button>
      )}
      {expanded && (
        <div className="ranking-expanded-panel">
          <AdmissionTemplate
            activeAdmissionType={selectedAdmissionType}
            activePeriod={activePeriod}
            activeTrend={activeTrend}
            periodTabs={periodTabs}
            summary={itemSummary}
            trendMode={trendMode}
            trendModes={trendModes}
            onAdmissionTypeChange={onAdmissionTypeChange}
            onOpenDetails={onOpenDetails}
            onPeriodChange={onPeriodChange}
            onTrendModeChange={onTrendModeChange}
          />
        </div>
      )}
    </article>
  );
}
