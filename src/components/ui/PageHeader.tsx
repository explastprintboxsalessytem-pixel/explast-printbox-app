import React from 'react';
import { Badge } from './Badge';

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  badgeText?: string;
  badgeVariant?: 'brand' | 'neutral' | 'success' | 'warning' | 'info';
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badgeText,
  badgeVariant = 'neutral',
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {eyebrow}
          </h2>
          {badgeText && (
            <Badge variant={badgeVariant}>
              {badgeText}
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-text-secondary mt-1 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
