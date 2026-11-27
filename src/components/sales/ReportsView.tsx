'use client';

import React, { useState } from 'react';
import { DemoService } from '@/lib/sales/demo-service';
import { AppUser } from '@/types/demo';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { KPICard } from '../ui/KPICard';
import { PageHeader } from '../ui/PageHeader';
import { AreaLineChart } from '../ui/charts/AreaLineChart';
import {
  TrendingUp,
  DollarSign,
  Factory,
  Layers,
  Palette,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Briefcase,
} from 'lucide-react';
import { WeeklySalesWorkTracker } from './WeeklySalesWorkTracker';

interface ReportsViewProps {
  brand: string;
  currentUser?: AppUser;
}

export function ReportsView({ brand: initialBrand, currentUser }: ReportsViewProps) {
  const [activeSection, setActiveSection] = useState<'weekly_work' | 'analytics'>('weekly_work');
  const [period, setPeriod] = useState<'30d' | '90d' | 'ytd' | 'custom'>('ytd');
  const [salespersonFilter, setSalespersonFilter] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);

  const isAdmin = currentUser?.role === 'admin';
  const effectiveSalesperson = isAdmin
    ? (salespersonFilter === 'all' ? undefined : salespersonFilter)
    : currentUser?.name;

  // Retrieve comprehensive metrics from central analytics engine
  const metrics = DemoService.getAnalyticsMetrics({
    salespersonName: effectiveSalesperson,
    period,
    brand: selectedBrand,
  });

  const periodDisplayNames: Record<string, string> = {
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    ytd: 'Year to Date',
    custom: 'Custom Date Range',
  };

  const isExplast = selectedBrand === 'Explast';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 print:p-0">
      
      {/* REPORTS MODULE SUB-NAVIGATION SWITCHER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-3 print:hidden">
        <div className="flex items-center space-x-2 bg-bg-card p-1 rounded-xl border border-border-strong/70 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSection('weekly_work')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSection === 'weekly_work'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Weekly Sales Work & Follow-Ups
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeSection === 'weekly_work'
                  ? 'bg-white/20 text-white'
                  : 'bg-brand-primary/10 text-brand-primary'
              }`}
            >
              Week 48
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('analytics')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSection === 'analytics'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Commercial & Plant Analytics
          </button>
        </div>

        <div className="text-[11px] text-text-muted hidden sm:flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-color-success animate-pulse" />
          <span>Active Period: <strong>Week 48 (November 2026)</strong></span>
        </div>
      </div>

      {/* VIEW 1: WEEKLY SALES WORK TRACKER (NEW 12-POINT FIELD LOG) */}
      {activeSection === 'weekly_work' ? (
        <WeeklySalesWorkTracker
          brand={selectedBrand}
          currentUser={currentUser}
        />
      ) : (
        /* VIEW 2: EXECUTIVE COMMERCIAL & PRODUCTION ANALYTICS */
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
          {/* 3.A. REPORTS HEADER & FILTER TOOLBAR */}
          <PageHeader
            eyebrow={isAdmin ? 'Executive Analytics & Commercial Intelligence' : `Portfolio Analytics • ${currentUser?.name}`}
            badgeText={selectedBrand === 'Global View' ? 'Consolidated Multi-Brand' : `${selectedBrand} Operations`}
            badgeVariant={isAdmin ? 'neutral' : 'brand'}
            title="Operations & Enterprise Commercial Reports"
            description="Comprehensive commercial and production performance metrics."
            actions={
              <div className="flex flex-wrap items-center gap-2.5 text-xs print:hidden">
                {/* Brand Filter */}
                <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
                  <span className="text-text-muted text-[11px] font-medium">Brand:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Explast">Explast (Plastics)</option>
                    <option value="PrintBox">PrintBox (Paper)</option>
                    {isAdmin && <option value="Global View">Global View</option>}
                  </select>
                </div>

                {/* Sales Representative Filter (Admin only) */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
                    <span className="text-text-muted text-[11px] font-medium">Sales Rep:</span>
                    <select
                      value={salespersonFilter}
                      onChange={(e) => setSalespersonFilter(e.target.value)}
                      className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Representatives</option>
                      <option value="Alex L.">Alex L.</option>
                      <option value="Sunil R.">Sunil R.</option>
                      <option value="Sarah M.">Sarah M.</option>
                      <option value="David T.">David T.</option>
                    </select>
                  </div>
                )}

                {/* Period Selector */}
                <div className="bg-bg-card border border-border-strong/70 rounded-lg p-1 flex shadow-2xs">
                  {(['30d', '90d', 'ytd', 'custom'] as const).map((pKey) => (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => setPeriod(pKey)}
                      className={`px-3 py-1 rounded font-medium transition-colors ${
                        period === pKey
                          ? 'bg-brand-primary text-white font-semibold shadow-xs'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                      }`}
                    >
                      {pKey === '30d' ? 'Last 30 Days' : pKey === '90d' ? 'Last 90 Days' : pKey === 'ytd' ? 'Year to Date' : 'Custom'}
                    </button>
                  ))}
                </div>

                {/* Export PDF Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-bg-card border-border-strong shadow-2xs hover:bg-bg-secondary"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
                </Button>
              </div>
            }
          />

      {/* 3.B. MAIN KPI CARDS (ROW 1 - 4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Quoted Value */}
        <KPICard
          label="Total Quoted Value"
          value={`Rs ${metrics.sales.totalQuotationValue.toLocaleString()}`}
          variation={metrics.sales.quotedVariation}
          sparklineData={metrics.sales.quotedSparkline}
          sparklineColor="teal"
          accent="brand"
          icon={TrendingUp}
        />

        {/* 2. Signed Revenue (Won) */}
        <KPICard
          label="Signed Revenue (Won)"
          value={`Rs ${metrics.sales.acceptedQuotationValue.toLocaleString()}`}
          variation={metrics.sales.revenueVariation}
          sparklineData={metrics.sales.revenueSparkline}
          sparklineColor="purple"
          accent="purple"
          icon={DollarSign}
        />

        {/* 3. Commercial Win Rate */}
        <KPICard
          label="Commercial Win Rate"
          value={`${metrics.sales.conversionRate}%`}
          variation={metrics.sales.conversionVariation}
          sparklineData={[56, 61, 59, 64, 65, metrics.sales.conversionRate]}
          sparklineColor="emerald"
          accent="success"
          icon={CheckCircle2}
        />

        {/* 4. Active Plant Orders */}
        <KPICard
          label="Active Plant Orders"
          value={`${metrics.production.activeJobsCount} Orders`}
          trend={metrics.production.completedJobsText || `${metrics.production.completedJobsCount} runs completed this period`}
          sparklineData={[7, 9, 8, 10, 11, metrics.production.activeJobsCount]}
          sparklineColor="amber"
          accent="amber"
          icon={Factory}
        />
      </div>

      {/* 3.C & 3.D. ROW 2: REVENUE TREND (~65%) & COMMERCIAL PERFORMANCE SUMMARY (~35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* REVENUE & QUOTED VALUE TREND (8 of 12 cols = 66.7%) */}
        <Card className="lg:col-span-8 p-6 space-y-4 border border-border-strong/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                  Revenue & Quoted Value Trend
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Monthly quoted commercial pipeline vs. actual signed revenue (MUR)
                </p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-3 h-3 rounded-sm bg-[#119A94]" /> Quoted Value
                </span>
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <span className="w-3 h-3 rounded-sm bg-[#6E4A9E]" /> Signed Revenue
                </span>
              </div>
            </div>

            {/* Interactive Clean SVG Area Line Chart */}
            <div className="pt-3">
              <AreaLineChart data={metrics.monthlySalesTrend} height={230} showPreviousPeriod={false} />
            </div>
          </div>

          {/* Period Summary Footprint */}
          <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Quoted Volume</span>
              <span className="font-mono text-sm font-bold text-brand-primary">
                Rs {metrics.sales.totalQuotationValue.toLocaleString()}
              </span>
            </div>
            <div className="bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Signed Order Value</span>
              <span className="font-mono text-sm font-bold text-[#6E4A9E]">
                Rs {metrics.sales.acceptedQuotationValue.toLocaleString()}
              </span>
            </div>
            <div className="bg-bg-secondary/40 p-2.5 rounded-lg border border-border-subtle">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Active Reporting Range</span>
              <span className="font-mono text-sm font-bold text-text-primary">
                {periodDisplayNames[period]}
              </span>
            </div>
          </div>
        </Card>

        {/* 3.D. COMMERCIAL PERFORMANCE SUMMARY (4 of 12 cols = 33.3%) */}
        <Card className="lg:col-span-4 p-6 space-y-4 border border-border-strong/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-border-subtle pb-3">
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Commercial Performance Summary
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Quotation conversion and order status breakdown
              </p>
            </div>

            {/* Compact Numerical Metric Rows */}
            <div className="space-y-3 pt-3">
              {/* Total Quotations */}
              <div className="p-3 bg-bg-secondary/40 rounded-lg border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">Total Quotations Created</span>
                    <span className="text-[10px] text-text-muted">Issued proposals in period</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-text-primary block">{metrics.sales.totalQuotationsCount}</span>
                  <span className="font-mono text-[10px] text-text-muted">Rs {(metrics.sales.totalQuotationValue / 1000).toFixed(0)}k</span>
                </div>
              </div>

              {/* Accepted Quotations */}
              <div className="p-3 bg-[#4F8F68]/5 rounded-lg border border-[#4F8F68]/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4F8F68]" />
                  <div>
                    <span className="text-xs font-semibold text-[#4F8F68] block">Accepted (Won)</span>
                    <span className="text-[10px] text-text-muted">Signed purchase orders</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-[#4F8F68] block">{metrics.sales.acceptedCount}</span>
                  <span className="font-mono text-[10px] text-[#4F8F68]/80">Rs {(metrics.sales.acceptedQuotationValue / 1000).toFixed(0)}k</span>
                </div>
              </div>

              {/* Pending Quotations */}
              <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <div>
                    <span className="text-xs font-semibold text-brand-primary block">Pending Response</span>
                    <span className="text-[10px] text-text-muted">Under client review</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-brand-primary block">{metrics.sales.pendingCount}</span>
                  <span className="font-mono text-[10px] text-brand-primary/80">Rs {(metrics.sales.pendingQuotationValue / 1000).toFixed(0)}k</span>
                </div>
              </div>

              {/* Rejected / Expired Quotations */}
              <div className="p-3 bg-bg-secondary/40 rounded-lg border border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <XCircle className="w-4 h-4 text-text-muted" />
                  <div>
                    <span className="text-xs font-semibold text-text-secondary block">Rejected / Expired</span>
                    <span className="text-[10px] text-text-muted">Unconverted proposals</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-text-secondary block">{metrics.sales.rejectedCount}</span>
                  <span className="font-mono text-[10px] text-text-muted">Rs {(metrics.sales.rejectedQuotationValue / 1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>
          </div>

          {/* Win Rate Progress Visualization */}
          <div className="pt-3 border-t border-border-subtle/80 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-text-secondary">Commercial Win Rate:</span>
              <span className="font-mono font-bold text-color-success">{metrics.sales.conversionRate}% Won</span>
            </div>
            <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden flex">
              <div
                className="bg-[#4F8F68] h-full transition-all duration-500"
                style={{ width: `${metrics.sales.conversionRate}%` }}
                title={`Won: ${metrics.sales.conversionRate}%`}
              />
              <div
                className="bg-brand-primary h-full opacity-60 transition-all duration-500"
                style={{
                  width: `${Math.round((metrics.sales.pendingCount / metrics.sales.totalQuotationsCount) * 100)}%`,
                }}
                title="Pending"
              />
            </div>
          </div>
        </Card>

      </div>

      {/* 3.E & 3.F. ROW 3: MATERIAL FAMILY (~50%) & PRINTING COMPLEXITY (~50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Material Family Distribution */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                {isExplast ? 'Material Family Distribution' : 'Paper Packaging Material Categories'}
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {isExplast ? 'Distribution across LDPE, MDPE, and PP extrusion volumes' : 'Kraft Board, Corrugated, Bleached, and Rigid Boxes'}
              </p>
            </div>
            <Layers className="w-4 h-4 text-brand-primary" />
          </div>

          <div className="space-y-3.5 pt-1">
            {isExplast ? (
              Object.entries(metrics.products.materialCounts).map(([family, count]) => {
                const total = Object.values(metrics.products.materialCounts).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={family} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-primary">{family}</span>
                      <span className="font-mono text-text-secondary">
                        {count} Projects ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              Object.entries(metrics.products.printboxPaperCounts).map(([cat, count]) => {
                const total = Object.values(metrics.products.printboxPaperCounts).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-text-primary">{cat}</span>
                      <span className="font-mono text-text-secondary">{count} Projects ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 6)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Printing & Color Complexity */}
        <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
          <div className="flex justify-between items-center border-b border-border-subtle pb-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                Printing & Colour Complexity
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Distribution across plain film and multi-colour printing specifications
              </p>
            </div>
            <Palette className="w-4 h-4 text-[#6E4A9E]" />
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(
              isExplast ? metrics.products.colorDistribution : metrics.products.printboxColorDistribution
            ).map(([category, count]) => {
              const totalObj = isExplast ? metrics.products.colorDistribution : metrics.products.printboxColorDistribution;
              const total = Object.values(totalObj).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-primary">{category}</span>
                    <span className="font-mono text-text-secondary">{count} Jobs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6E4A9E] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* 3.G. ROW 4: PRODUCTION OVERVIEW (FULL WIDTH) */}
      <Card className="p-6 space-y-4 border border-border-strong/70 shadow-sm">
        <div className="flex justify-between items-center border-b border-border-subtle pb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              Production Overview
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {isExplast
                ? 'Active orders distributed across manufacturing stages (Extrusion, Printing, Conversion, QC)'
                : 'Active production flow across Pre-flight, Stock Cut, Offset Press, Die-Cutting, and Folding'}
            </p>
          </div>
          <Badge variant="brand">Manufacturing Flow</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {Object.entries(isExplast ? metrics.production.jobsByStage : metrics.production.jobsByStagePrintbox).map(
            ([stage, count]) => {
              const total = Object.values(
                isExplast ? metrics.production.jobsByStage : metrics.production.jobsByStagePrintbox
              ).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div
                  key={stage}
                  className="p-3.5 bg-bg-secondary/50 rounded-xl border border-border-subtle hover:border-brand-primary transition-colors text-center flex flex-col justify-between"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
                    {stage.replace('_', ' ')}
                  </span>
                  <p className="font-mono text-2xl font-bold text-text-primary my-1.5">{count}</p>
                  <div className="flex items-center justify-between text-[10px] text-text-secondary pt-1 border-t border-border-subtle/50">
                    <span>Share:</span>
                    <span className="font-mono font-semibold text-brand-primary">{pct}%</span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>

        </div>
      )}
    </div>
  );
}
