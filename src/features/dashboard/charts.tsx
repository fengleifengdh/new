import { useEffect, useMemo, useState } from 'react';
import { EChart } from '../../components/EChart';
import type { DealerRank, DetailBar, DetailGauge, TrendModeData } from '../../api/dashboard';

export interface TrendPointSelection {
  change: number | null;
  label: string;
  value: number;
}

export function TrendEChart({
  compact,
  data,
  onPointSelect,
}: {
  compact?: boolean;
  data: TrendModeData;
  onPointSelect?: (point: TrendPointSelection) => void;
}) {
  const dataKey = `${data.id}-${data.rate.join(',')}-${data.baseline.join(',')}`;
  const animated = useEntranceAnimation(dataKey);

  const rateData = useMemo(() => (animated ? data.rate : data.rate.map(() => 0)), [animated, data.rate]);
  const baselineData = useMemo(() => (animated ? data.baseline : data.baseline.map(() => 0)), [animated, data.baseline]);

  return (
    <EChart
      className={compact ? 'echart trend-echart compact' : 'echart trend-echart'}
      onChartClick={(params) => {
        if (!onPointSelect || !isSeriesPointClick(params)) {
          return;
        }

        const index = params.dataIndex;
        const value = data.rate[index];
        const previousValue = data.rate[index - 1];

        if (typeof value !== 'number') {
          return;
        }

        onPointSelect({
          change: typeof previousValue === 'number' ? value - previousValue : null,
          label: data.months[index] || data.marker.label,
          value,
        });
      }}
      option={{
        animationDuration: 850,
        animationDurationUpdate: 850,
        animationEasing: 'cubicOut',
        animationEasingUpdate: 'cubicOut',
        backgroundColor: 'transparent',
        grid: { left: 30, right: 14, top: 18, bottom: 30 },
        tooltip: { show: false },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: data.months,
          axisLine: { lineStyle: { color: 'rgba(180,180,180,0.2)' } },
          axisTick: { show: false },
          axisLabel: { color: '#979797', fontSize: 9 },
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: 'rgba(180,180,180,0.12)' } },
          axisLabel: { show: false },
        },
        series: [
          {
            name: '总准入率',
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            data: rateData,
            animationDelayUpdate: (index: number) => index * 42,
            lineStyle: { width: 3, color: '#8AD32A' },
            itemStyle: { color: '#8AD32A', borderColor: '#0D1515', borderWidth: 2 },
            areaStyle: { color: 'rgba(138,211,42,0.16)' },
          },
          {
            name: '基线',
            type: 'line',
            smooth: true,
            symbol: 'none',
            data: baselineData,
            animationDelayUpdate: (index: number) => index * 42,
            lineStyle: { width: 1.4, color: 'rgba(180,180,180,0.34)', type: 'dashed' },
          },
        ],
      }}
    />
  );
}

function isSeriesPointClick(value: unknown): value is { componentType: string; dataIndex: number; seriesName: string } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const params = value as { componentType?: unknown; dataIndex?: unknown; seriesName?: unknown };

  return params.componentType === 'series' && params.seriesName === '总准入率' && typeof params.dataIndex === 'number';
}

export function GaugeEChart({ gauge }: { gauge: DetailGauge }) {
  const color = gauge.tone === 'blue' ? '#3084C5' : '#8AD32A';
  const shadowColor = gauge.tone === 'blue' ? '#2E82C2' : '#89D22A';
  const animated = useEntranceAnimation(`${gauge.title}-${gauge.totalRate}`);
  const progress = animated ? Math.min(Math.max(gauge.formalRate * 0.46, 0), 40) : 0;
  const cx = 76;
  const cy = 77;
  const outerArc = describeSemiArc(cx, cy, 69, 180, 0);
  const whiteArc = describeSemiArc(cx, cy, 58, 105, 75);
  const railArc = describeSemiArc(cx, cy, 44, 180, 0);
  const progressArc = describeSemiArc(cx, cy, 44, 180, 180 - progress * 1.8);
  const pointerEnd = polarToCartesian(cx, cy, 48, 93);
  const majorTicks = Array.from({ length: 11 }, (_, index) => index * 10);
  const minorTicks = Array.from({ length: 61 }, (_, index) => index * (100 / 60));

  return (
    <svg className="gauge-svg" viewBox="0 0 152 96" role="img" aria-label={`${gauge.title} ${gauge.totalRate.toFixed(1)}%`}>
      <defs>
        <linearGradient id={`gaugeProgress-${gauge.tone}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id={`gaugeWhite-${gauge.tone}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F8FBFB" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#DDE5E5" stopOpacity="1" />
        </linearGradient>
        <filter id={`gaugeGlow-${gauge.tone}`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor={shadowColor} floodOpacity="0.68" />
        </filter>
      </defs>

      <path className="gauge-outline" d={outerArc} stroke={color} />
      <path className="gauge-rail" d={railArc} />
      <path className="gauge-progress" d={progressArc} stroke={`url(#gaugeProgress-${gauge.tone})`} />
      <path className="gauge-white-arc" d={whiteArc} stroke={`url(#gaugeWhite-${gauge.tone})`} />

      {minorTicks.map((tick) => {
        const angle = valueToGaugeAngle(tick);
        const isMajor = Math.round(tick) % 10 === 0;
        const inner = polarToCartesian(cx, cy, isMajor ? 45 : 48, angle);
        const outer = polarToCartesian(cx, cy, 56, angle);
        return (
          <line
            key={`tick-${tick}`}
            className={isMajor ? 'gauge-tick major' : 'gauge-tick'}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
          />
        );
      })}

      {majorTicks.map((tick) => {
        const angle = valueToGaugeAngle(tick);
        const textPoint = polarToCartesian(cx, cy, 73, angle);
        return (
          <text key={`label-${tick}`} className="gauge-number" x={textPoint.x} y={textPoint.y + 3} textAnchor="middle">
            {tick}
          </text>
        );
      })}

      <line className="gauge-pointer" x1={cx} y1={cy} x2={pointerEnd.x} y2={pointerEnd.y} filter={`url(#gaugeGlow-${gauge.tone})`} />
      <circle className="gauge-anchor-ring" cx={cx} cy={cy} r="4.3" filter={`url(#gaugeGlow-${gauge.tone})`} />
      <circle className="gauge-anchor" cx={cx} cy={cy} r="2.3" />
    </svg>
  );
}

function valueToGaugeAngle(value: number) {
  return 180 - (value / 100) * 180;
}

function describeSemiArc(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY - radius * Math.sin(angleInRadians),
  };
}

export function DetailBarsEChart({ bars }: { bars: DetailBar[] }) {
  const dataKey = bars.map((bar) => `${bar.label}:${bar.value}`).join('|');
  const animated = useEntranceAnimation(dataKey);

  return (
    <EChart
      className="echart detail-bars-echart"
      option={{
        animationDuration: 850,
        animationDurationUpdate: 850,
        animationEasing: 'cubicOut',
        animationEasingUpdate: 'cubicOut',
        grid: { left: 20, right: 12, top: 18, bottom: 30 },
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(28,35,35,0.92)', textStyle: { color: '#DCE4E4', fontSize: 10 } },
        xAxis: {
          type: 'category',
          data: bars.map((bar) => bar.label),
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: { color: '#979797', fontSize: 8, interval: 0 },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.07)' } },
          axisLabel: { color: '#979797', fontSize: 8 },
        },
        series: [
          {
            type: 'bar',
            barWidth: 20,
            data: bars.map((bar) => ({
              value: animated ? bar.value : 0,
              itemStyle: {
                borderRadius: [6, 6, 0, 0],
                color: bar.tone === 'blue' ? '#3084C5' : '#8AD32A',
              },
            })),
            animationDelayUpdate: (index: number) => index * 55,
            label: { show: true, position: 'top', color: '#DCE4E4', fontSize: 9 },
          },
        ],
      }}
    />
  );
}

export function DealerRankingEChart({
  dealers,
  onSelectDealer,
}: {
  dealers: DealerRank[];
  onSelectDealer?: (dealer: DealerRank) => void;
}) {
  const dataKey = dealers.map((dealer) => `${dealer.id}:${dealer.value}`).join('|');
  const animated = useEntranceAnimation(dataKey);

  return (
    <EChart
      className="echart dealer-ranking-echart"
      onChartClick={(params: unknown) => {
        if (!onSelectDealer) {
          return;
        }
        const candidate = params as { dataIndex?: unknown };
        const index = typeof candidate.dataIndex === 'number' ? candidate.dataIndex : -1;
        const dealer = dealers[index];
        if (dealer) {
          onSelectDealer(dealer);
        }
      }}
      option={{
        animationDuration: 850,
        animationDurationUpdate: 850,
        animationEasing: 'cubicOut',
        animationEasingUpdate: 'cubicOut',
        grid: { left: 58, right: 28, top: 8, bottom: 6 },
        xAxis: { type: 'value', max: 100, show: false },
        yAxis: {
          type: 'category',
          inverse: true,
          data: dealers.map((dealer, index) => `#${index + 1} ${dealer.name}`),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#979797', fontSize: 10 },
        },
        series: [
          {
            type: 'bar',
            barWidth: 12,
            data: dealers.map((dealer, index) => ({
              value: animated ? dealer.value : 0,
              itemStyle: { borderRadius: 99, color: index === dealers.length - 1 ? '#8AD32A' : '#3084C5' },
            })),
            animationDelayUpdate: (index: number) => index * 55,
            showBackground: true,
            backgroundStyle: { color: 'rgba(255,255,255,0.08)', borderRadius: 99 },
            label: { show: true, position: 'right', formatter: '{c}%', color: '#DCE4E4', fontSize: 9 },
            cursor: 'pointer',
          },
        ],
      }}
    />
  );
}

function useEntranceAnimation(key: string) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const frame = requestAnimationFrame(() => setAnimated(true));

    return () => cancelAnimationFrame(frame);
  }, [key]);

  return animated;
}
