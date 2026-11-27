'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Factory, Clock, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ProductionWorkloadMetrics {
  totalInProgress: number;
  awaitingMaterial: number;
  inManufacturing: number;
  awaitingQC: number;
  completedThisPeriod: number;
}

interface ProductionOverviewCardProps {
  workload: ProductionWorkloadMetrics;
  brand: string;
  className?: string;
}

export function ProductionOverviewCard({
  workload,
  brand,
  className = '',
}: ProductionOverviewCardProps) {
  const isExplast = brand === 'Explast';

  return (
    <Card className={`p-6 border border-border-strong/70 shadow-sm space-y-4 ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Production Overview
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Plant floor workload and manufacturing throughput ({brand})
          </p>
        </div>
        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
          {workload.totalInProgress} In Progress
        </span>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Metric 1: Awaiting Material */}
        <div className="p-3 rounded-lg bg-bg-secondary/60 border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Awaiting Stock</span>
          </div>
          <div className="text-lg font-bold font-mono text-text-primary">
            {workload.awaitingMaterial}
          </div>
          <div className="text-[10px] text-text-muted">
            {isExplast ? 'Polymer resin & masterbatch' : 'Raw kraft & boxboard'}
          </div>
        </div>

        {/* Metric 2: In Manufacturing */}
        <div className="p-3 rounded-lg bg-bg-secondary/60 border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-medium">
            <Wrench className="w-3.5 h-3.5 text-brand-primary" />
            <span>In Production</span>
          </div>
          <div className="text-lg font-bold font-mono text-brand-primary">
            {workload.inManufacturing}
          </div>
          <div className="text-[10px] text-text-muted">
            {isExplast ? 'Extrusion, Print & Slitting' : 'Offset & Die-Cutting'}
          </div>
        </div>

        {/* Metric 3: Quality Control */}
        <div className="p-3 rounded-lg bg-bg-secondary/60 border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Awaiting QC</span>
          </div>
          <div className="text-lg font-bold font-mono text-indigo-700">
            {workload.awaitingQC}
          </div>
          <div className="text-[10px] text-text-muted">
            Micron, seal & print inspection
          </div>
        </div>

        {/* Metric 4: Completed This Period */}
        <div className="p-3 rounded-lg bg-bg-secondary/60 border border-border-subtle space-y-1">
          <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {workload.completedThisPeriod}
          </div>
          <div className="text-[10px] text-text-muted">
            Delivered / ready for dispatch
          </div>
        </div>
      </div>

      <div className="pt-2 text-[11px] text-text-muted flex items-center justify-between border-t border-border-subtle/60">
        <span>Operational plant lines: Extrusion Lines 1-4 • Flexo Presses • Conversion</span>
        <span className="font-semibold text-emerald-700">QC Pass Rate: 98.4%</span>
      </div>
    </Card>
  );
}
