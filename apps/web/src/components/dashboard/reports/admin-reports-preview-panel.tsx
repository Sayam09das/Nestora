'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

import {
  ATTENDANCE_CHART_DATA,
  COMPLAINTS_CHART_DATA,
  FEE_CHART_DATA,
  OCCUPANCY_CHART_DATA,
  formatInr,
  formatReportWhen,
  type ReportTemplate,
} from '@/components/dashboard/reports/admin-reports-data';
import type { ReportDeskPreview } from '@/lib/api/reports';
import { gsap, useGSAP } from '@/components/marketing/hero/hero-gsap';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--nestora-sage)_35%,transparent)]';

const BAR_COLORS = ['#8ba391', '#6d9773', '#4d7a5c', '#2d5c45', '#164c3c', '#ffba00'] as const;

type Props = { report: ReportTemplate | null; preview?: ReportDeskPreview | null; loadingPreview?: boolean };

type PreviewChartSlice = {
  data: Array<Record<string, string | number>>;
  dataKey: string;
  xKey: string;
  config: ChartConfig;
  tooltipFormat?: (v: number) => string;
};

const emptyChart: PreviewChartSlice = {
  data: [],
  dataKey: 'collected',
  xKey: 'month',
  config: { collected: { label: 'Sample', color: 'var(--nestora-forest)' } },
};

function resolvePreviewChart(report: ReportTemplate): PreviewChartSlice {
  switch (report.id) {
    case 'rpt-fees':
      return {
        data: FEE_CHART_DATA,
        dataKey: 'collected',
        xKey: 'month',
        config: { collected: { label: 'Collected', color: 'var(--nestora-forest)' } },
        tooltipFormat: (v) => formatInr(v),
      };
    case 'rpt-occupancy':
      return {
        data: OCCUPANCY_CHART_DATA,
        dataKey: 'occupied',
        xKey: 'hostel',
        config: { occupied: { label: 'Occupied %', color: 'var(--nestora-forest)' } },
        tooltipFormat: (v) => `${v}%`,
      };
    case 'rpt-attendance':
      return {
        data: ATTENDANCE_CHART_DATA,
        dataKey: 'rate',
        xKey: 'week',
        config: { rate: { label: 'Attendance %', color: 'var(--nestora-sage)' } },
        tooltipFormat: (v) => `${v}%`,
      };
    case 'rpt-complaints':
      return {
        data: COMPLAINTS_CHART_DATA,
        dataKey: 'open',
        xKey: 'category',
        config: { open: { label: 'Open tickets', color: '#d97706' } },
        tooltipFormat: (v) => String(v),
      };
    default:
      return {
        data: FEE_CHART_DATA,
        dataKey: 'collected',
        xKey: 'month',
        config: { collected: { label: 'Sample', color: 'var(--nestora-forest)' } },
        tooltipFormat: (v) => formatInr(v),
      };
  }
}

export function AdminReportsPreviewPanel({ report, preview }: Props) {
  const reduceMotion = useReducedMotion();
  const chartRef = useRef<HTMLDivElement>(null);

  const { data, dataKey, xKey, config, tooltipFormat } = useMemo(() => {
    if (!report) return emptyChart;
    if (preview?.chart?.data?.length) {
      const base = resolvePreviewChart(report);
      return {
        ...base,
        data: preview.chart.data as Array<Record<string, string | number>>,
        dataKey: preview.chart.dataKey,
        xKey: preview.chart.xKey,
      };
    }
    if (preview) {
      const base = resolvePreviewChart(report);
      return { ...base, data: [] };
    }
    return emptyChart;
  }, [preview, report]);

  useGSAP(
    () => {
      if (reduceMotion || !chartRef.current || !report) return;
      const bars = chartRef.current.querySelectorAll('.recharts-bar-rectangle');
      if (!bars.length) return;
      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: '50% 100%',
        duration: 0.5,
        stagger: 0.06,
        ease: 'back.out(1.2)',
        clearProps: 'transform',
      });
    },
    { scope: chartRef, dependencies: [report?.id, reduceMotion], revertOnUpdate: true },
  );

  if (!report) {
    return (
      <section className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
        Select a report template to preview live output.
      </section>
    );
  }

  return (
    <motion.section
      data-rpt-reveal
      layout
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--nestora-sage)]">Live preview</p>
          <h2 className="text-lg font-semibold text-[var(--nestora-forest)]">{report.title}</h2>
          <p className="text-xs text-muted-foreground">
            Last run {formatReportWhen(report.lastRun)} · {report.format}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={cn('rounded-xl', focusRing)}
            onClick={() => toast.success(`${report.code} refresh queued — pulling live aggregates.`)}
          >
            <Play className="size-4" aria-hidden />
            Run now
          </Button>
          <Button nativeButton={false} size="sm" className={cn('rounded-xl', focusRing)} render={<Link href={`/admin/reports/${report.id}`} />} >
            Full view
          </Button>
        </div>
      </header>
      <div ref={chartRef} className="bg-[color-mix(in_oklch,var(--nestora-cream)_20%,var(--card))] p-4">
        <ChartContainer config={config} className="aspect-[2/1] min-h-[200px] w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 6" />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} width={40} tick={{ fontSize: 11 }} />
            <ChartTooltip
              content={
                <ChartTooltipContent formatter={(value) => (tooltipFormat ? tooltipFormat(Number(value)) : value)} />
              }
            />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={`${xKey}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </motion.section>
  );
}
