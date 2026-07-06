import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, GaugeChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';

echarts.use([BarChart, GaugeChart, GridComponent, LineChart, TooltipComponent, CanvasRenderer]);

export function EChart(props: { className?: string; onChartClick?: (params: unknown) => void; option: EChartsCoreOption }) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const chart = echarts.init(elementRef.current, undefined, { renderer: 'canvas' });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(props.option, false);
  }, [props.option]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !props.onChartClick) {
      return;
    }

    chart.on('click', props.onChartClick);

    return () => {
      chart.off('click', props.onChartClick);
    };
  }, [props.onChartClick]);

  return <div className={props.className} ref={elementRef} />;
}
