'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { ChevronRight, FolderKanban } from 'lucide-react';

export interface PipelineStageItem {
  label: string;
  count: number;
  color: string;
  stageKey?: string;
}

interface ProjectPipelineCardProps {
  title?: string;
  subtitle?: string;
  stages: PipelineStageItem[];
  totalActiveProjects: number;
  onNavigateToProjects: () => void;
  className?: string;
}

export function ProjectPipelineCard({
  title = 'Project Pipeline',
  subtitle = 'Distribution across workflow stages',
  stages,
  totalActiveProjects,
  onNavigateToProjects,
  className = '',
}: ProjectPipelineCardProps) {
  // Active stages (excluding completed from the progress bar, but showing in breakdown)
  const activeStages = stages.filter(s => s.stageKey !== 'Completed');
  const completedStage = stages.find(s => s.stageKey === 'Completed');

  const activeSum = activeStages.reduce((acc, s) => acc + s.count, 0) || totalActiveProjects || 1;

  return (
    <Card className={`p-6 border border-border-strong/70 shadow-sm flex flex-col justify-between space-y-4 ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {subtitle}
          </p>
        </div>
        <button
          onClick={onNavigateToProjects}
          className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
        >
          View Projects <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* HORIZONTAL SEGMENTED BAR */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary font-medium">Active Workflow Distribution:</span>
          <span className="font-mono font-bold text-text-primary">
            {totalActiveProjects} Active Projects
          </span>
        </div>

        {/* Stacked Segment Bar */}
        <div className="w-full h-3.5 bg-bg-secondary rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-border-subtle">
          {activeStages.map((stage, idx) => {
            const pct = Math.max(stage.count > 0 ? 5 : 0, Math.round((stage.count / activeSum) * 100));
            if (stage.count === 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${pct}%`, backgroundColor: stage.color }}
                className="h-full rounded-full transition-all duration-300 relative group cursor-pointer"
                title={`${stage.label}: ${stage.count} (${pct}%)`}
              />
            );
          })}
        </div>
      </div>

      {/* STAGE BREAKDOWN LIST */}
      <div className="space-y-2.5 pt-1 flex-1">
        {stages.map((stage, idx) => {
          const isCompleted = stage.stageKey === 'Completed';
          const pct = isCompleted
            ? undefined
            : Math.round((stage.count / activeSum) * 100);

          return (
            <div
              key={idx}
              onClick={onNavigateToProjects}
              className="flex items-center justify-between text-xs p-1.5 rounded-md hover:bg-bg-secondary/60 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="font-medium text-text-primary truncate">
                  {stage.label}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isCompleted && pct !== undefined && (
                  <span className="text-[11px] text-text-muted font-mono">
                    {pct}%
                  </span>
                )}
                <span className="font-mono font-bold text-text-primary px-2 py-0.5 rounded bg-bg-secondary text-[11px]">
                  {stage.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <FolderKanban className="w-3.5 h-3.5 text-brand-primary" /> Active Pipeline
        </span>
        <span className="font-mono font-semibold text-brand-primary">
          {totalActiveProjects} In Progress
        </span>
      </div>
    </Card>
  );
}
