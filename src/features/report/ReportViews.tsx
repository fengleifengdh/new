import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  Filter,
  Pencil,
  Search,
  X,
} from 'lucide-react';
import { dealerOptions, reportItems } from './reportData';

export function ReportListView({ onEdit, onOpenDetail }: { onEdit: () => void; onOpenDetail: () => void }) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <section className="report-page">
      <div className="report-list-head">
        <h1>准入列表</h1>
        <span>共57个条目</span>
      </div>
      <div className="report-search-row">
        <label>
          <Search size={14} />
          <input placeholder="搜索" />
        </label>
        <button className="report-filter-button" onClick={() => setFilterOpen(true)} type="button" aria-label="筛选与排序">
          <Filter size={18} />
        </button>
      </div>
      <div className="report-list">
        {reportItems.map((item) => (
          <article className="report-item" key={item.id} onClick={onOpenDetail}>
            <ProjectBadge name={item.project} />
            <div className="report-item-main">
              <strong>{item.name}</strong>
              <div>
                <span className={item.status === '正式准入' ? 'tag blue' : 'tag amber'}>{item.status}</span>
                <span className="tag">{item.spec}</span>
                <span className="tag">{item.city}</span>
              </div>
              <small>5天前更新</small>
            </div>
            <button
              className="edit-icon"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              type="button"
              aria-label="编辑准入信息"
            >
              <Pencil size={16} />
            </button>
          </article>
        ))}
      </div>
      {filterOpen && <ReportFilterPanel onClose={() => setFilterOpen(false)} />}
    </section>
  );
}

export function ReportDetailView({ mode, onBack, onEdit }: { mode: 'readonly' | 'edit'; onBack: () => void; onEdit: () => void }) {
  const [dateOpen, setDateOpen] = useState(false);
  const [dealerOpen, setDealerOpen] = useState(false);
  const [concernOpen, setConcernOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const editing = mode === 'edit';

  return (
    <section className="report-detail-page">
      <div className="report-detail-top">
        <button onClick={onBack} type="button" aria-label="返回准入列表">
          <ArrowLeft size={20} />
        </button>
        <h1>准入详情</h1>
      </div>
      <WarningBanner />
      <HospitalSummary onInfo={() => setInfoOpen(true)} />

      {editing && (
        <button className="attention-row" onClick={() => setConcernOpen(true)} type="button">
          <span>关注等级</span>
          <strong>需要关注</strong>
          <ChevronRight size={16} />
        </button>
      )}

      <CollapsibleSection title="基础信息">
        <InfoGrid />
      </CollapsibleSection>

      <CollapsibleSection title="准入结果">
        {editing ? <EditForm onDate={() => setDateOpen(true)} onDealer={() => setDealerOpen(true)} /> : <ReadonlyResult />}
      </CollapsibleSection>

      {editing && (
        <>
          <CollapsibleSection title="过程信息" className="compact-form-card">
            <FormRow label="销售最新提单状态" value="请选择" />
            <FormRow label="销售最新提单类型" value="请选择" />
            <FormRow label="销售已提单/计划提单时间（年/月）" value="请选择" />
            <FormRow label="商务确认提单有效性" value="请选择" />
            <FormRow label="预估药事会时间" value="请选择" />
            <FormRow label="预估准入形式" value="请选择" />
            <FormRow label="预估准入时间（年/月）" value="请选择" />
            <FormRow label="倒车填报原因" value="请选择" />
          </CollapsibleSection>
          <CollapsibleSection title="经销商及人员信息" className="compact-form-card">
            <FormRow label="项目支持经销商" value="上药控股安徽有限公司" onClick={() => setDealerOpen(true)} />
            <FormRow label="项目支持经销商所属集团" value="上药集团" />
            <FormRow label="商务区域" value="东二区" />
            <FormRow label="商务一线" value="安静" />
            <FormRow label="销售区域对接人" value="苏贵霞" />
            <FormRow label="销售 Cluster" value="OPH" />
            <FormRow label="销售大区" value="OPH-沪皖大区" />
            <FormRow label="销售 RM Name" value="方珠" />
          </CollapsibleSection>
          <div className="report-submit-bar">
            <button className="cancel" onClick={onBack} type="button">取消</button>
            <button className="submit" type="button">提交</button>
          </div>
        </>
      )}

      {!editing && (
        <button className="report-edit-button" onClick={onEdit} type="button">
          编辑
        </button>
      )}

      {dateOpen && <DatePickerSheet onClose={() => setDateOpen(false)} />}
      {dealerOpen && <DealerPickerSheet onClose={() => setDealerOpen(false)} />}
      {concernOpen && <ConcernSheet onClose={() => setConcernOpen(false)} />}
      {infoOpen && <InfoDialog onClose={() => setInfoOpen(false)} tab={editing ? 'result' : 'result'} />}
    </section>
  );
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const classes = ['report-section-card'];
  if (className) classes.push(className);
  if (!open) classes.push('collapsed');
  return (
    <section className={classes.join(' ')}>
      <div className="report-section-title">
        <h2>{title}</h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? `折叠${title}` : `展开${title}`}
        >
          {open ? '折叠' : '展开'}
        </button>
      </div>
      {open && children}
    </section>
  );
}

function ProjectBadge({ name }: { name: string }) {
  return (
    <div className={`project-badge ${name.includes('1AD') ? 'blue' : name.includes('灵鹿') ? 'orange' : name.includes('铁') ? 'rose' : 'green'}`}>
      {name.includes('妙') ? '妙手会' : name.includes('灵') ? '灵鹿' : name.includes('1AD') ? '1AD' : '铁V会'}
    </div>
  );
}

function WarningBanner() {
  return (
    <div className="warning-banner">
      <AlertTriangle size={15} />
      如准入经销商信息与已认定信息不符
    </div>
  );
}

function HospitalSummary({ onInfo }: { onInfo: () => void }) {
  return (
    <section className="hospital-summary">
      <ProjectBadge name="妙手会" />
      <div>
        <strong>安徽省第二人民医院</strong>
        <p>
          <span className="tag blue">Elyea 8mg</span>
          <span className="tag green">26KA</span>
          <span className="tag green">25KA</span>
        </p>
      </div>
      <button onClick={onInfo} type="button" aria-label="查看准入详情">
        <Eye size={17} />
      </button>
    </section>
  );
}

function InfoGrid() {
  return (
    <div className="info-grid">
      <div className="info-cell">
        <label>医院编码 SE Code</label>
        <strong>1870</strong>
      </div>
      <div className="info-cell">
        <label>省份</label>
        <strong>安徽省</strong>
      </div>
      <div className="info-cell">
        <label>医院级别</label>
        <strong>三级</strong>
      </div>
    </div>
  );
}

function ReadonlyResult() {
  return (
    <div className="readonly-result">
      <div className="info-cell">
        <label>实际准入形式</label>
        <strong>批量临采</strong>
      </div>
      <div className="info-cell">
        <label>实际准入时间（年/月/日）</label>
        <strong><CalendarDays size={14} /> 2025/09/12</strong>
      </div>
      <div className="info-cell">
        <label>实际准入经销商（一级商）</label>
        <strong>安徽省广济大药房连锁有限公司</strong>
      </div>
      <div className="info-cell">
        <label>配送经销商（一级商分子公司）</label>
        <strong>滁州华巨百姓缘大药房连锁股份有限公司</strong>
      </div>
      <div className="info-cell">
        <label>实际准入商务一线</label>
        <strong><span className="person-dot">费</span> 费敏</strong>
      </div>
      <div className="info-cell">
        <label>实际准入月份</label>
        <strong>2025/09</strong>
      </div>
    </div>
  );
}

function EditForm({ onDate, onDealer }: { onDate: () => void; onDealer: () => void }) {
  return (
    <div className="edit-form">
      <FormRow label="实际准入形式" value="请输入" />
      <FormRow label="实际准入时间（年/月/日）" value="请选择" onClick={onDate} />
      <FormRow label="实际准入经销商（一级商）" value="请输入" onClick={onDealer} />
      <FormRow label="配送经销商（一级商分子公司）" value="请输入" />
      <FormRow label="实际准入商务一线" value="请输入" />
      <FormRow label="实际准入月份" value="请选择" onClick={onDate} />
    </div>
  );
}

function FormRow({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button className="form-row" onClick={onClick} type="button">
      <span>{label}</span>
      <em>{value}</em>
      <ChevronRight size={15} />
    </button>
  );
}

function DatePickerSheet({ onClose }: { onClose: () => void }) {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return (
    <ModalSheet title="日期选择" onClose={onClose}>
      <div className="calendar-sheet">
        <strong>2019年5月</strong>
        <div className="week-row">{['日', '一', '二', '三', '四', '五', '六'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="day-grid">
          {days.map((day) => <button className={day === 21 ? 'selected' : ''} key={day} type="button">{day}</button>)}
        </div>
        <button className="sheet-confirm" onClick={onClose} type="button">确定</button>
      </div>
    </ModalSheet>
  );
}

function DealerPickerSheet({ onClose }: { onClose: () => void }) {
  return (
    <ModalSheet title="实际准入经销商（一级商）" onClose={onClose}>
      <div className="dealer-picker">
        <div className="dealer-picker-tabs"><button type="button">当前省份</button><button className="active" type="button">全国</button></div>
        <label><Search size={14} /><input placeholder="搜索" /></label>
        {dealerOptions.map((dealer, index) => (
          <button className={index === 2 ? 'selected' : ''} key={dealer} type="button">
            {dealer}
            {index === 2 && <Check size={15} />}
          </button>
        ))}
        <button className="sheet-confirm" onClick={onClose} type="button">确定</button>
      </div>
    </ModalSheet>
  );
}

function ConcernSheet({ onClose }: { onClose: () => void }) {
  return (
    <ModalSheet title="关注等级" onClose={onClose} bottom>
      <div className="concern-sheet">
        {['高度关注', '需要关注', '无需关注'].map((item) => (
          <button className={item === '需要关注' ? 'selected' : ''} key={item} type="button">
            {item}
            {item === '需要关注' && <Check size={15} />}
          </button>
        ))}
        <button className="sheet-confirm" onClick={onClose} type="button">确定</button>
      </div>
    </ModalSheet>
  );
}

function InfoDialog({ onClose, tab: initialTab }: { onClose: () => void; tab: 'base' | 'result' | 'history' }) {
  const [tab, setTab] = useState(initialTab);
  return (
    <div className="dialog-overlay">
      <button className="dialog-scrim" onClick={onClose} type="button" aria-label="关闭查看信息" />
      <section className="info-dialog">
        <button className="dialog-close" onClick={onClose} type="button"><X size={18} /></button>
        <h2>准入详情</h2>
        <div className="info-dialog-tabs">
          <button
            className={tab === 'base' ? 'active' : ''}
            onClick={() => setTab('base')}
            type="button"
            aria-pressed={tab === 'base'}
          >
            基础信息
          </button>
          <button
            className={tab === 'result' ? 'active' : ''}
            onClick={() => setTab('result')}
            type="button"
            aria-pressed={tab === 'result'}
          >
            认定准入结果
          </button>
          <button
            className={tab === 'history' ? 'active' : ''}
            onClick={() => setTab('history')}
            type="button"
            aria-pressed={tab === 'history'}
          >
            历史准入结果
          </button>
        </div>
        {tab === 'base' && <InfoGrid />}
        {tab === 'result' && <ReadonlyResult />}
        {tab === 'history' && <HistoryResult />}
      </section>
    </div>
  );
}

function HistoryResult() {
  return (
    <div className="readonly-result">
      <div className="info-cell">
        <label>实际准入形式</label>
        <strong>单品准入</strong>
      </div>
      <div className="info-cell">
        <label>实际准入时间（年/月/日）</label>
        <strong><CalendarDays size={14} /> 2024/03/18</strong>
      </div>
      <div className="info-cell">
        <label>实际准入经销商（一级商）</label>
        <strong>安徽省医药工业有限公司</strong>
      </div>
      <div className="info-cell">
        <label>配送经销商（一级商分子公司）</label>
        <strong>合肥泰康医药连锁股份有限公司</strong>
      </div>
      <div className="info-cell">
        <label>实际准入商务一线</label>
        <strong><span className="person-dot">张</span> 张磊</strong>
      </div>
      <div className="info-cell">
        <label>实际准入月份</label>
        <strong>2024/03</strong>
      </div>
    </div>
  );
}

function ModalSheet({ title, children, onClose, bottom }: { title: string; children: ReactNode; onClose: () => void; bottom?: boolean }) {
  return (
    <div className="dialog-overlay">
      <button className="dialog-scrim" onClick={onClose} type="button" aria-label={`关闭${title}`} />
      <section className={bottom ? 'modal-sheet bottom' : 'modal-sheet'}>
        <button className="dialog-close" onClick={onClose} type="button"><X size={18} /></button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

function ReportFilterPanel({ onClose }: { onClose: () => void }) {
  const groups: { title: string; options: string[]; multiple: boolean; defaultSelected?: string[] }[] = [
    { title: '经销省份排序', options: ['A-Z', 'Z-A'], multiple: false, defaultSelected: ['Z-A'] },
    { title: '准入排序', options: ['更新时间', '关注等级', '准入状态'], multiple: false, defaultSelected: ['关注等级'] },
    { title: '关注等级', options: ['重点关注', '需要关注', '无需关注'], multiple: true, defaultSelected: ['需要关注'] },
    { title: '项目名称', options: ['出类拔萃', '嫚尚V家', '请选择项目', '非凡项目二期', '非凡项目一期', '优量绽放-优思悦', '优量绽放-曼月乐'], multiple: true, defaultSelected: ['嫚尚V家', '请选择项目'] },
    { title: 'BU', options: ['CVRM', 'EP', 'GM', 'OHC', 'OPH', 'SM', 'WHC'], multiple: true, defaultSelected: ['EP'] },
    { title: '锁定与认定', options: ['未锁定', '已锁定未认定', '未锁定已认定', '已锁定已认定'], multiple: true, defaultSelected: ['已锁定未认定'] },
  ];
  const [selected, setSelected] = useState<Record<string, string[]>>(
    () => Object.fromEntries(groups.map((g) => [g.title, g.defaultSelected ?? []])),
  );
  const [showCrossProvince, setShowCrossProvince] = useState(true);

  const toggle = (title: string, option: string, multiple: boolean) => {
    setSelected((prev) => {
      const current = prev[title] ?? [];
      let next: string[];
      if (multiple) {
        next = current.includes(option) ? current.filter((item) => item !== option) : [...current, option];
      } else {
        next = current[0] === option ? [] : [option];
      }
      return { ...prev, [title]: next };
    });
  };

  const handleReset = () => {
    setSelected(Object.fromEntries(groups.map((g) => [g.title, []])));
    setShowCrossProvince(false);
  };

  return (
    <div className="report-filter-panel">
      <button className="filter-scrim" onClick={onClose} type="button" aria-label="关闭筛选" />
      <aside className="report-filter-drawer">
        <h2>筛选与排序</h2>
        {groups.map((group) => (
          <section key={group.title}>
            <h3>{group.title}</h3>
            <div>
              {group.options.map((option) => {
                const active = (selected[group.title] ?? []).includes(option);
                return (
                  <button
                    className={active ? 'active' : ''}
                    key={option}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggle(group.title, option, group.multiple)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <label className="switch-row">
          显示跨省条目
          <input type="checkbox" checked={showCrossProvince} onChange={(event) => setShowCrossProvince(event.target.checked)} />
        </label>
        <div className="filter-actions report-actions">
          <button className="reset" onClick={handleReset} type="button">重置</button>
          <button className="confirm" onClick={onClose} type="button">确认</button>
        </div>
      </aside>
    </div>
  );
}
