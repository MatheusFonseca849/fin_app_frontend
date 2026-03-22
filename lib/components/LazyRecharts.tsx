'use client';

import dynamic from 'next/dynamic';
import type {
  PieChart as PieChartType,
  BarChart as BarChartType,
  ComposedChart as ComposedChartType,
  AreaChart as AreaChartType,
} from 'recharts';

// Chart containers — lazy-loaded with ssr:false (Recharts uses browser APIs)
export const LazyPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
) as typeof PieChartType;

export const LazyBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
) as typeof BarChartType;

export const LazyComposedChart = dynamic(
  () => import('recharts').then((mod) => mod.ComposedChart),
  { ssr: false }
) as typeof ComposedChartType;

export const LazyAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
) as typeof AreaChartType;

// Re-export lightweight sub-components that are always needed alongside charts
export {
  Pie,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
