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
  const animated = useEntranceAnimation(`${gauge.title}-${gauge.totalRate}`);

  return (
    <EChart
      className="echart gauge-echart"
      option={{
        animationDuration: 900,
        animationDurationUpdate: 900,
        animationEasing: 'cubicOut',
        animationEasingUpdate: 'cubicOut',
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            radius: '100%',
            center: ['50%', '78%'],
            splitNumber: 5,
            progress: { show: true, width: 10, itemStyle: { color } },
            axisLine: { lineStyle: { width: 10, color: [[1, '#2C3131']] } },
            axisTick: { distance: -15, length: 4, lineStyle: { color: 'rgba(180,180,180,0.4)', width: 1 } },
            splitLine: { distance: -18, length: 8, lineStyle: { color: 'rgba(180,180,180,0.45)', width: 1 } },
            axisLabel: { distance: -10, color: '#979797', fontSize: 7 },
            pointer: { length: '58%', width: 3, itemStyle: { color: '#DCE4E4' } },
            anchor: { show: true, size: 6, itemStyle: { color: '#DCE4E4' } },
            detail: { show: false },
            data: [{ value: animated ? gauge.totalRate : 0 }],
          },
        ],
      }}
    />
  );
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

export function DealerRankingEChart({ dealers }: { dealers: DealerRank[] }) {
  const dataKey = dealers.map((dealer) => `${dealer.id}:${dealer.value}`).join('|');
  const animated = useEntranceAnimation(dataKey);

  return (
    <EChart
      className="echart dealer-ranking-echart"
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
