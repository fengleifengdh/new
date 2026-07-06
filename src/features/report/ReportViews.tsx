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

      <section className="report-section-card">
        <div className="report-section-title">
          <h2>基础信息</h2>
          <button type="button">折叠</button>
        </div>
        <InfoGrid />
      </section>

      <section className="report-section-card">
        <div className="report-section-title">
          <h2>准入结果</h2>
          <button type="button">折叠</button>
        </div>
        {editing ? <EditForm onDate={() => setDateOpen(true)} onDealer={() => setDealerOpen(true)} /> : <ReadonlyResult />}
      </section>

      {editing && (
        <>
          <section className="report-section-card compact-form-card">
            <div className="report-section-title">
              <h2>过程信息</h2>
              <button type="button">折叠</button>
            </div>
            <FormRow label="销售最新提单状态" value="请选择" />
            <FormRow label="销售最新提单类型" value="请选择" />
          </section>
          <section className="report-section-card compact-form-card">
            <div className="report-section-title">
              <h2>经销商及人员信息</h2>
              <button type="button">折叠</button>
            </div>
            <FormRow label="XXXXXXX" value="请选择" />
            <FormRow label="XXXXXXX" value="请选择" />
          </section>
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
      {infoOpen && <InfoDialog onClose={() => setInfoOpen(false)} tab={editing ? 'result' : 'base'} />}
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
      <label>医院编码 SE Code</label>
      <strong>1870</strong>
      <label>省份</label>
      <strong>安徽省</strong>
      <label>医院级别</label>
      <strong>三级</strong>
    </div>
  );
}

function ReadonlyResult() {
  return (
    <div className="readonly-result">
      <label>实际准入形式</label>
      <strong>批量临采</strong>
      <label>实际准入时间（年/月/日）</label>
      <strong><CalendarDays size={14} /> 2025/09/12</strong>
      <label>实际准入经销商（一级商）</label>
      <strong>安徽省广济大药房连锁有限公司</strong>
      <label>配送经销商（一级商分子公司）</label>
      <strong>滁州华巨百姓缘大药房连锁股份有限公司</strong>
      <label>实际准入商务一线</label>
      <strong><span className="person-dot">费</span> 费敏</strong>
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

function InfoDialog({ onClose, tab }: { onClose: () => void; tab: 'base' | 'result' }) {
  return (
    <div className="dialog-overlay">
      <button className="dialog-scrim" onClick={onClose} type="button" aria-label="关闭查看信息" />
      <section className="info-dialog">
        <button className="dialog-close" onClick={onClose} type="button"><X size={18} /></button>
        <h2>准入详情</h2>
        <div className="info-dialog-tabs">
          <button className={tab === 'base' ? 'active' : ''} type="button">基础信息</button>
          <button className={tab === 'result' ? 'active' : ''} type="button">认定准入结果</button>
          <button type="button">历史准入结果</button>
        </div>
        {tab === 'base' ? <InfoGrid /> : <ReadonlyResult />}
      </section>
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
  const groups = [
    ['A-Z', 'Z-A'],
    ['更新时间', '关注等级', '准入状态'],
    ['重点关注', '需要关注', '无需关注'],
    ['出类拔萃', '嫚尚V家', '请选择项目', '非凡项目二期', '非凡项目一期', '优量绽放-优思悦', '优量绽放-曼月乐'],
    ['CVRM', 'EP', 'GM', 'OHC', 'OPH', 'SM', 'WHC'],
    ['未锁定', '已锁定未认定', '未锁定已认定', '已锁定已认定'],
  ];
  const titles = ['经销省份排序', '准入排序', '关注等级', '项目名称', 'BU', '锁定与认定'];
  return (
    <div className="report-filter-panel">
      <button className="filter-scrim" onClick={onClose} type="button" aria-label="关闭筛选" />
      <aside className="report-filter-drawer">
        <h2>筛选与排序</h2>
        {groups.map((group, groupIndex) => (
          <section key={titles[groupIndex]}>
            <h3>{titles[groupIndex]}</h3>
            <div>
              {group.map((item, index) => <button className={index === 1 || item === '请选择项目' ? 'active' : ''} key={item} type="button">{item}</button>)}
            </div>
          </section>
        ))}
        <label className="switch-row">显示跨省条目 <input defaultChecked type="checkbox" /></label>
        <div className="filter-actions report-actions">
          <button className="reset" type="button">重置</button>
          <button className="confirm" onClick={onClose} type="button">确认</button>
        </div>
      </aside>
    </div>
  );
}
