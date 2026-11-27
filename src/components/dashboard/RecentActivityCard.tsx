'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DemoActivityEvent } from '@/types/demo';
import { User, Activity } from 'lucide-react';

interface RecentActivityCardProps {
  activities: DemoActivityEvent[];
  isAdmin: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function RecentActivityCard({
  activities,
  isAdmin,
  title,
  subtitle,
  className = '',
}: RecentActivityCardProps) {
  const displayTitle = title || (isAdmin ? 'Recent Company Activity' : 'Recent Activity');
  const displaySubtitle =
    subtitle ||
    (isAdmin
      ? 'Latest commercial requests, quotations, production updates, and completed tasks'
      : 'Your latest sales requests, quotation updates, and completed actions');

  const displayList = activities.slice(0, 5);

  return (
    <Card className={`p-6 border border-border-strong/70 shadow-sm space-y-4 ${className}`}>
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            {displayTitle}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">{displaySubtitle}</p>
        </div>
        <Badge variant={isAdmin ? 'neutral' : 'brand'}>Real-Time Feed</Badge>
      </div>

      {/* LIST */}
      <div className="space-y-3 pt-1">
        {displayList.map((act, idx) => (
          <div
            key={act.id || idx}
            className="flex items-start justify-between text-xs pb-3 border-b border-border-subtle/50 last:border-b-0 last:pb-0"
          >
            <div className="space-y-0.5 min-w-0 pr-3">
              <p className="font-semibold text-text-primary truncate">{act.title}</p>
              <p className="text-text-secondary text-[11px] line-clamp-1">
                {act.description}
              </p>
              {act.actor && (
                <span className="inline-flex items-center gap-1 text-[10px] text-text-muted mt-0.5">
                  <User className="w-3 h-3" /> By {act.actor}
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-text-muted shrink-0 whitespace-nowrap bg-bg-secondary px-2 py-0.5 rounded">
              {act.timestamp}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
