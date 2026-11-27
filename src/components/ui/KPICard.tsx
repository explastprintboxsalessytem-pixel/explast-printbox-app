import React from 'react';
import { Card } from './Card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Sparkline } from './charts/Sparkline';

export interface KPICardProps {
  label: string;
  value: string | number;
  trend?: string;
  variation?: {
    percent: number;
    isPositive?: boolean;
    comparisonText?: string;
  };
  sparklineData?: number[];
  sparklineColor?: 'teal' | 'purple' | 'emerald' | 'amber';
  accent?: 'brand' | 'purple' | 'amber' | 'success' | 'info' | 'neutral';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function KPICard({
  label,
  value,
  trend,
  variation,
  sparklineData,
  sparklineColor = 'teal',
  accent = 'brand',
  icon: Icon,
  onClick,
  className = '',
}: KPICardProps) {
  const accentBorders = {
    brand: 'border-l-brand-primary',
    purple: 'border-l-[#6E4A9E]',
    amber: 'border-l-color-warning',
    success: 'border-l-color-success',
    info: 'border-l-color-info',
    neutral: 'border-l-border-strong',
  };

  const accentValueColors = {
    brand: 'text-text-primary',
    purple: 'text-[#6E4A9E]',
    amber: 'text-color-warning',
    success: 'text-color-success',
    info: 'text-color-info',
    neutral: 'text-text-primary',
  };

  // Strip redundant leading percentage from comparisonText if present (e.g. "+12% compared with...")
  const cleanComparisonText = variation?.comparisonText
    ? variation.comparisonText.replace(/^[+-]?\d+%\s*/, '')
    : trend;

  return (
    <Card
      onClick={onClick}
      className={`p-4 border-l-4 ${accentBorders[accent]} shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-brand-primary' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted truncate">
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {sparklineData && sparklineData.length > 1 && (
            <Sparkline
              data={sparklineData}
              color={sparklineColor}
              width={56}
              height={18}
            />
          )}
          {Icon && <Icon className="w-4 h-4 text-text-muted shrink-0" />}
        </div>
      </div>

      {/* LARGE VALUE */}
      <div className="mt-2">
        <p className={`font-mono text-2xl font-bold tracking-tight ${accentValueColors[accent]}`}>
          {value}
        </p>
      </div>

      {/* CLEAN INLINE FOOTER: TREND / VARIATION & COMPARISON TEXT */}
      {(variation || cleanComparisonText) && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border-subtle/50 text-[11px] leading-tight">
          {variation && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold shrink-0 ${
                variation.percent >= 0 ? 'text-[#086B68]' : 'text-rose-600'
              }`}
            >
              {variation.percent >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {variation.percent >= 0 ? `+${variation.percent}%` : `${variation.percent}%`}
              </span>
            </span>
          )}
          {cleanComparisonText && (
            <span className="text-text-secondary truncate">
              {cleanComparisonText}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
