'use client';

import React, { useState, useMemo } from 'react';
import { AppUser, WeeklySalesFollowUp, WeeklyFollowUpStatus, APP_USERS } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { KPICard } from '../ui/KPICard';
import { PageHeader } from '../ui/PageHeader';
import {
  Calendar,
  Users,
  User,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  TrendingUp,
  Briefcase,
  X,
  Send,
  Eye,
  Check,
} from 'lucide-react';

interface WeeklySalesWorkTrackerProps {
  brand: string;
  currentUser?: AppUser;
  onOpenCustomer?: (customerId: string) => void;
  onOpenQuotation?: (quotationId: string) => void;
}

export function WeeklySalesWorkTracker({
  brand: initialBrand,
  currentUser,
}: WeeklySalesWorkTrackerProps) {
  const [followUps, setFollowUps] = useState<WeeklySalesFollowUp[]>(() =>
    DemoService.getWeeklyFollowUps()
  );
  const [selectedWeek, setSelectedWeek] = useState<number>(48);
  const [selectedRep, setSelectedRep] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [detailModalItem, setDetailModalItem] = useState<WeeklySalesFollowUp | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>('WFU-2026-001'); // Expand Grillicious by default

  const isAdmin = currentUser?.role === 'admin';

  // Available sales reps
  const salesReps = useMemo(() => {
    return APP_USERS.filter(u => u.role === 'sales');
  }, []);

  // Filtered follow-up list
  const filteredItems = useMemo(() => {
    return followUps.filter(item => {
      // Week filter
      if (selectedWeek !== 0 && item.week_number !== selectedWeek) return false;

      // Sales rep filter
      if (!isAdmin) {
        // Sales reps see their own records by default
        if (item.salesperson !== currentUser?.name) return false;
      } else if (selectedRep !== 'all' && item.salesperson !== selectedRep) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'Global View' && selectedBrand !== 'all') {
        if (item.brand !== selectedBrand) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.business_and_visit.toLowerCase().includes(q) ||
          item.contact_and_authority.toLowerCase().includes(q) ||
          item.packaging_required.toLowerCase().includes(q) ||
          item.salesperson.toLowerCase().includes(q) ||
          item.your_proposal.toLowerCase().includes(q) ||
          item.next_action_and_commitment.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [followUps, selectedWeek, selectedRep, selectedBrand, statusFilter, searchQuery, isAdmin, currentUser]);

  // Aggregate metrics
  const summaryMetrics = useMemo(() => {
    const totalVisits = filteredItems.length;
    const samplesDelivered = filteredItems.filter(f => f.status === 'sample_given').length;
    const hotLeads = filteredItems.filter(f => f.status === 'hot_lead').length;
    const quotesIssued = filteredItems.filter(f => f.status === 'quoted').length;
    const converted = filteredItems.filter(f => f.status === 'converted').length;
    const totalPotentialMur = filteredItems.reduce((acc, f) => acc + (f.potential_sales_mur || 0), 0);

    return {
      totalVisits,
      samplesDelivered,
      hotLeads,
      quotesIssued,
      converted,
      totalPotentialMur,
    };
  }, [filteredItems]);

  // Rep scoreboard metrics (for Week 48 or selected week)
  const repScores = useMemo(() => {
    return salesReps.map(rep => {
      const repVisits = followUps.filter(
        f => f.salesperson === rep.name && (selectedWeek === 0 || f.week_number === selectedWeek)
      );
      const totalPotential = repVisits.reduce((acc, f) => acc + (f.potential_sales_mur || 0), 0);
      const samplesCount = repVisits.filter(f => f.status === 'sample_given').length;
      const hotCount = repVisits.filter(f => f.status === 'hot_lead' || f.status === 'converted').length;
      const latestVisit = repVisits[0]?.business_and_visit || 'None yet';

      return {
        rep,
        visitsCount: repVisits.length,
        totalPotential,
        samplesCount,
        hotCount,
        latestVisit,
        hasSubmitted: repVisits.length > 0,
      };
    });
  }, [salesReps, followUps, selectedWeek]);

  // Status badge config
  const statusConfig: Record<
    WeeklyFollowUpStatus,
    { label: string; variant: 'brand' | 'success' | 'warning' | 'error' | 'neutral'; color: string }
  > = {
    hot_lead: { label: 'Hot Lead (Priority)', variant: 'brand', color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30' },
    sample_given: { label: 'Sample Delivered', variant: 'warning', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
    quoted: { label: 'Quotation Issued', variant: 'brand', color: 'bg-[#6E4A9E]/10 text-[#6E4A9E] border-[#6E4A9E]/30' },
    in_negotiation: { label: 'In Negotiation', variant: 'warning', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
    converted: { label: 'Order Converted', variant: 'success', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
    cold: { label: 'Cold / Unqualified', variant: 'neutral', color: 'bg-zinc-500/10 text-zinc-600 border-zinc-500/30' },
  };

  function handleStatusChange(id: string, newStatus: WeeklyFollowUpStatus) {
    DemoService.updateWeeklyFollowUpStatus(id, newStatus);
    setFollowUps(DemoService.getWeeklyFollowUps());
  }

  function handleSaveNewFollowUp(newRecord: Omit<WeeklySalesFollowUp, 'id' | 'created_at'>) {
    DemoService.addWeeklyFollowUp(newRecord);
    setFollowUps(DemoService.getWeeklyFollowUps());
    setIsLogModalOpen(false);
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 print:p-0">
      
      {/* 1. TOP HEADER & FILTER TOOLBAR */}
      <PageHeader
        eyebrow="Sales Force Oversight & Weekly Field Tracking"
        badgeText={selectedBrand === 'Global View' ? 'Consolidated Brands' : `${selectedBrand} Weekly Log`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title="Weekly Sales Work & Customer Follow-Up Log"
        description="Standardized 12-point customer visit tracking replacing manual weekly Word files. Monitor visits, customer requests, sample tests, and pipeline commitments."
        actions={
          <div className="flex flex-wrap items-center gap-2.5 text-xs print:hidden">
            {/* Week Selector */}
            <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-text-muted text-[11px] font-medium">Week:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
              >
                <option value={48}>Week 48 (23-29 Nov 2026) • Current</option>
                <option value={47}>Week 47 (16-22 Nov 2026)</option>
                <option value={0}>All Recorded Weeks</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <span className="text-text-muted text-[11px] font-medium">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Global View">All Brands (Consolidated)</option>
                <option value="Explast">Explast (Plastics)</option>
                <option value="PrintBox">PrintBox (Paper)</option>
              </select>
            </div>

            {/* Sales Rep Filter (Admin only) */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1.5 shadow-2xs">
                <User className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-text-muted text-[11px] font-medium">Rep:</span>
                <select
                  value={selectedRep}
                  onChange={(e) => setSelectedRep(e.target.value)}
                  className="bg-transparent text-xs text-text-primary font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">All 4 Representatives</option>
                  {salesReps.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Print / Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="bg-bg-card border-border-strong shadow-2xs hover:bg-bg-secondary"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Export
            </Button>

            {/* + Log Customer Follow-up Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsLogModalOpen(true)}
              className="shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> + Log Customer Follow-Up
            </Button>
          </div>
        }
      />

      {/* 2. REPUTATION / METHODOLOGY BANNER (Word Template Migration Context) */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0 border border-brand-primary/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary">
                Official 12-Point Customer Follow-up Framework
              </span>
              <Badge variant="brand" className="text-[10px]">Active Digitized Standard</Badge>
            </div>
            <p className="text-text-secondary mt-0.5">
              Replaces loose Word attachments with structured ERP logging: <em>Business & Visit, Buying Authority, Packaging Required, Competitor Benchmarks, Evidence, Next Commitment.</em>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <span className="text-text-muted text-[11px]">
            Showing <strong className="text-text-primary">{filteredItems.length}</strong> customer follow-ups
          </span>
        </div>
      </div>

      {/* 3. WEEKLY SUMMARY KPIS (ROW 1 - 4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          label="Weekly Client Visits"
          value={`${summaryMetrics.totalVisits} Visits`}
          variation={{ percent: 14, isPositive: true, comparisonText: '+14% vs last week' }}
          sparklineData={[5, 7, 6, 8, 9, summaryMetrics.totalVisits]}
          sparklineColor="teal"
          accent="brand"
          icon={Users}
        />

        <KPICard
          label="Samples Delivered"
          value={`${summaryMetrics.samplesDelivered} Prospects`}
          variation={{ percent: 20, isPositive: true, comparisonText: 'Physical print samples delivered' }}
          sparklineData={[2, 3, 2, 4, 3, summaryMetrics.samplesDelivered]}
          sparklineColor="purple"
          accent="purple"
          icon={Package}
        />

        <KPICard
          label="High-Priority Opportunities"
          value={`${summaryMetrics.hotLeads + summaryMetrics.converted} Deals`}
          trend={`${summaryMetrics.converted} already converted this week`}
          sparklineData={[1, 2, 3, 2, 4, summaryMetrics.hotLeads]}
          sparklineColor="emerald"
          accent="success"
          icon={CheckCircle2}
        />

        <KPICard
          label="Identified Pipeline Value"
          value={`Rs ${(summaryMetrics.totalPotentialMur / 1000).toFixed(0)}k`}
          variation={{ percent: 18, isPositive: true, comparisonText: '+18% weekly potential' }}
          sparklineData={[420, 680, 750, 890, 950, Math.round(summaryMetrics.totalPotentialMur / 1000)]}
          sparklineColor="amber"
          accent="amber"
          icon={TrendingUp}
        />
      </div>

      {/* 4. SALES TEAM WEEKLY BENCHMARK SCOREBOARD (ADMIN VIEW) */}
      {isAdmin && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-primary" />
              Sales Representatives Weekly Performance ({selectedWeek ? `Week ${selectedWeek}` : 'All Weeks'})
            </h3>
            <span className="text-[11px] text-text-muted">
              4 Representatives Monitored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {repScores.map((score) => {
              const isSelected = selectedRep === score.rep.name;
              return (
                <div
                  key={score.rep.id}
                  onClick={() => setSelectedRep(isSelected ? 'all' : score.rep.name)}
                  className={`bg-bg-card p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs ${
                    isSelected
                      ? 'border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/5'
                      : 'border-border-subtle hover:border-brand-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-bg-secondary text-text-primary font-bold text-xs flex items-center justify-center border border-border-strong">
                        {score.rep.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-primary">{score.rep.name}</h4>
                        <p className="text-[10px] text-text-muted truncate max-w-[130px]">{score.rep.title}</p>
                      </div>
                    </div>
                    {score.hasSubmitted ? (
                      <span className="flex items-center gap-1 text-[10px] text-color-success font-semibold bg-color-success/10 px-2 py-0.5 rounded-full border border-color-success/20">
                        <Check className="w-3 h-3" /> Submitted
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-muted bg-bg-secondary px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-subtle text-xs">
                    <div>
                      <span className="text-[10px] text-text-muted block">Client Visits</span>
                      <span className="font-mono font-bold text-text-primary">{score.visitsCount} visits</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted block">Samples & Hot</span>
                      <span className="font-mono font-bold text-brand-primary">{score.samplesCount + score.hotCount} active</span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-border-subtle/50 flex justify-between items-center text-[11px]">
                      <span className="text-text-muted">Pipeline Value:</span>
                      <span className="font-mono font-bold text-text-primary">
                        Rs {(score.totalPotential / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-border-subtle/40 flex items-center justify-between text-[10px]">
                    <span className="text-text-muted truncate max-w-[120px]">
                      Latest: <strong className="text-text-primary">{score.latestVisit.split(' - ')[0]}</strong>
                    </span>
                    <span className="text-brand-primary font-semibold hover:underline">
                      {isSelected ? 'View All Reps' : 'Filter by Rep →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. SEARCH & STATUS FILTER TOOLBAR */}
      <Card className="p-3.5 border border-border-strong/70 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, packaging requirement, pitch, or next commitment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-secondary/70 border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-brand-primary text-white shadow-2xs'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              All ({followUps.length})
            </button>
            <button
              onClick={() => setStatusFilter('sample_given')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'sample_given'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Samples ({followUps.filter(f => f.status === 'sample_given').length})
            </button>
            <button
              onClick={() => setStatusFilter('hot_lead')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'hot_lead'
                  ? 'bg-brand-primary text-white shadow-2xs'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Hot Leads ({followUps.filter(f => f.status === 'hot_lead').length})
            </button>
            <button
              onClick={() => setStatusFilter('quoted')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'quoted'
                  ? 'bg-[#6E4A9E] text-white shadow-2xs'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Quoted ({followUps.filter(f => f.status === 'quoted').length})
            </button>
            <button
              onClick={() => setStatusFilter('converted')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                statusFilter === 'converted'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              Won / Converted ({followUps.filter(f => f.status === 'converted').length})
            </button>
          </div>
        </div>
      </Card>

      {/* 6. WEEKLY CUSTOMER VISIT DOSSIER LIST (12-POINT CARDS) */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          const statusMeta = statusConfig[item.status];
          const isPrintbox = item.brand === 'PrintBox';

          return (
            <Card
              key={item.id}
              className={`border transition-all overflow-hidden shadow-2xs ${
                item.status === 'hot_lead'
                  ? 'border-brand-primary/50 ring-1 ring-brand-primary/20'
                  : item.status === 'converted'
                  ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                  : 'border-border-strong/70'
              }`}
            >
              {/* CARD HEADER ROW */}
              <div className="p-4 sm:p-5 border-b border-border-subtle bg-bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isPrintbox
                        ? 'bg-[#169691]/10 text-[#169691] border border-[#169691]/30'
                        : 'bg-[#119A94] text-white'
                    }`}
                  >
                    {isPrintbox ? 'PB' : 'EXP'}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-text-primary tracking-tight">
                        {item.business_and_visit}
                      </h3>
                      <Badge variant={isPrintbox ? 'neutral' : 'brand'}>
                        {item.brand}
                      </Badge>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mt-1">
                      <span className="flex items-center gap-1 text-text-primary font-medium">
                        <User className="w-3.5 h-3.5 text-text-muted" /> {item.salesperson}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-text-muted" /> {item.visit_date}
                      </span>
                      <span>•</span>
                      <span className="text-text-muted">{item.week_label}</span>
                    </div>
                  </div>
                </div>

                {/* Right Header: Value & Expand Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Potential Value</span>
                    <span className="font-mono text-sm font-bold text-text-primary">
                      {item.potential_sales_mur
                        ? `Rs ${item.potential_sales_mur.toLocaleString()}`
                        : 'To be determined'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailModalItem(item)}
                      className="text-xs h-8 px-2.5"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Dossier
                    </Button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-secondary text-text-secondary transition-colors"
                      title={isExpanded ? 'Collapse 12-point details' : 'Expand 12-point details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* HIGHLIGHT SUMMARY (ALWAYS VISIBLE) */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Packaging Required */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                    <Package className="w-3 h-3 text-brand-primary" /> 3. Packaging Required
                  </span>
                  <p className="font-semibold text-text-primary leading-snug">
                    {item.packaging_required}
                  </p>
                  {item.quantity_and_buying_date && (
                    <p className="text-[11px] text-text-secondary font-mono">
                      Qty: {item.quantity_and_buying_date}
                    </p>
                  )}
                </div>

                {/* 2. Current Supplier & Need */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" /> 6. Need & Reason to Change
                  </span>
                  <p className="text-text-primary leading-snug font-medium">
                    {item.need_and_reason_to_change}
                  </p>
                  {item.current_supplier_and_price && (
                    <p className="text-[11px] text-text-muted">
                      Current: {item.current_supplier_and_price}
                    </p>
                  )}
                </div>

                {/* 3. Next Action & Commitment */}
                <div className="space-y-1 bg-brand-primary/5 p-2.5 rounded-lg border border-brand-primary/20">
                  <span className="text-[10px] uppercase font-bold text-brand-primary flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> 11. Next Action & Commitment
                  </span>
                  <p className="font-semibold text-text-primary leading-snug">
                    {item.next_action_and_commitment}
                  </p>
                  {item.support_and_documents && (
                    <p className="text-[10px] text-text-muted">
                      Support: {item.support_and_documents}
                    </p>
                  )}
                </div>
              </div>

              {/* COMPLETE 12-POINT ACCORDION VIEW (EXPANDABLE) */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-border-subtle bg-bg-secondary/20 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                      Full 12-Point Customer Visit Audit Log
                    </span>
                    <span className="text-[10px] text-text-muted">
                      Logged on {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* LEFT COLUMN: CUSTOMER & MARKET INTELLIGENCE */}
                    <div className="space-y-3 bg-bg-card p-3.5 rounded-xl border border-border-subtle">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-brand-primary border-b border-border-subtle pb-1.5">
                        Client Profile & Commercial Needs
                      </h4>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">1. Business & Visit</span>
                        <p className="font-semibold text-text-primary">{item.business_and_visit}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">2. Contact & Buying Authority</span>
                        <p className="text-text-primary font-medium flex items-center gap-1">
                          <Phone className="w-3 h-3 text-text-muted" /> {item.contact_and_authority}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">3. Packaging Required</span>
                        <p className="text-text-primary font-medium">{item.packaging_required}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">4. Quantity & Buying Date</span>
                        <p className="text-text-primary font-mono">{item.quantity_and_buying_date || 'Not specified'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">5. Current Supplier & Price</span>
                        <p className="text-text-primary">{item.current_supplier_and_price || 'N/A'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">6. Need & Reason to Change</span>
                        <p className="text-text-primary">{item.need_and_reason_to_change}</p>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: PITCH, EVIDENCE & COMMITMENTS */}
                    <div className="space-y-3 bg-bg-card p-3.5 rounded-xl border border-border-subtle">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-[#6E4A9E] border-b border-border-subtle pb-1.5">
                        Our Proposal, Field Evidence & Action
                      </h4>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">7. Your Proposal</span>
                        <p className="text-text-primary font-medium">{item.your_proposal}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">8. Customer Response</span>
                        <p className="text-text-primary">{item.customer_response || 'Pending follow-up feedback'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">9. Current Stage & Evidence</span>
                        <p className="text-text-primary font-medium">{item.current_stage_and_evidence}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">10. Potential Sales (Optional)</span>
                        <p className="text-text-primary font-mono font-bold">
                          {item.potential_sales_mur ? `Rs ${item.potential_sales_mur.toLocaleString()}` : 'Unspecified'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">11. Next Action & Commitment</span>
                        <p className="text-text-primary font-semibold">{item.next_action_and_commitment}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-text-muted block">12. Support & Documents</span>
                        <p className="text-text-primary">{item.support_and_documents || 'No additional documents required'}</p>
                      </div>
                    </div>
                  </div>

                  {/* QUICK STATUS UPDATE FOOTER BAR */}
                  <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-text-muted text-[11px] font-medium">Update Status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as WeeklyFollowUpStatus)}
                        className="bg-bg-card border border-border-subtle rounded-md px-2 py-1 text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-primary cursor-pointer"
                      >
                        <option value="sample_given">Sample Delivered</option>
                        <option value="hot_lead">Hot Lead (Priority)</option>
                        <option value="quoted">Quotation Issued</option>
                        <option value="in_negotiation">In Negotiation</option>
                        <option value="converted">Order Converted</option>
                        <option value="cold">Cold / Unqualified</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDetailModalItem(item)}
                        className="text-xs"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Print Visit Dossier
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {filteredItems.length === 0 && (
          <Card className="p-12 text-center border-dashed border-border-strong">
            <Briefcase className="w-10 h-10 mx-auto text-text-muted mb-2" />
            <h4 className="text-sm font-semibold text-text-primary">No weekly follow-ups matched filters</h4>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              No customer visits found for the selected week, representative, or search term. Try switching filters or log a new follow-up.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedWeek(0);
                setSelectedRep('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </Card>
        )}
      </div>

      {/* 7. MODAL: LOG NEW CUSTOMER FOLLOW-UP (12 FIELDS) */}
      {isLogModalOpen && (
        <LogFollowUpModal
          isOpen={isLogModalOpen}
          initialBrand={selectedBrand === 'Global View' ? 'PrintBox' : (selectedBrand as 'Explast' | 'PrintBox')}
          currentUser={currentUser}
          salesReps={salesReps}
          onClose={() => setIsLogModalOpen(false)}
          onSave={handleSaveNewFollowUp}
        />
      )}

      {/* 8. MODAL: 12-POINT DOSSIER DETAIL & PRINT VIEW */}
      {detailModalItem && (
        <FollowUpDetailModal
          item={detailModalItem}
          isOpen={!!detailModalItem}
          onClose={() => setDetailModalItem(null)}
          onStatusChange={handleStatusChange}
        />
      )}

    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: LOG NEW CUSTOMER FOLLOW-UP MODAL (12-POINT FORM)
// ============================================================================
interface LogFollowUpModalProps {
  isOpen: boolean;
  initialBrand: 'Explast' | 'PrintBox';
  currentUser?: AppUser;
  salesReps: AppUser[];
  onClose: () => void;
  onSave: (record: Omit<WeeklySalesFollowUp, 'id' | 'created_at'>) => void;
}

function LogFollowUpModal({
  isOpen,
  initialBrand,
  currentUser,
  salesReps,
  onClose,
  onSave,
}: LogFollowUpModalProps) {
  const [salesperson, setSalesperson] = useState(currentUser?.name || 'Alex L.');
  const [brand, setBrand] = useState<'Explast' | 'PrintBox'>(initialBrand);
  const [weekNumber, setWeekNumber] = useState<number>(48);
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // 12 Structured Fields from the company template
  const [businessAndVisit, setBusinessAndVisit] = useState('');
  const [contactAndAuthority, setContactAndAuthority] = useState('');
  const [packagingRequired, setPackagingRequired] = useState('');
  const [quantityAndBuyingDate, setQuantityAndBuyingDate] = useState('');
  const [currentSupplierAndPrice, setCurrentSupplierAndPrice] = useState('N/A');
  const [needAndReasonToChange, setNeedAndReasonToChange] = useState('');
  const [yourProposal, setYourProposal] = useState('Best price, better service');
  const [customerResponse, setCustomerResponse] = useState('');
  const [currentStageAndEvidence, setCurrentStageAndEvidence] = useState('Is using plain packaging');
  const [potentialSalesMur, setPotentialSalesMur] = useState<string>('');
  const [nextActionAndCommitment, setNextActionAndCommitment] = useState('');
  const [supportAndDocuments, setSupportAndDocuments] = useState('');
  const [status, setStatus] = useState<WeeklyFollowUpStatus>('sample_given');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessAndVisit.trim() || !contactAndAuthority.trim() || !packagingRequired.trim()) {
      alert('Please fill in the required fields (Business, Contact, Packaging Required).');
      return;
    }

    onSave({
      salesperson,
      week_number: weekNumber,
      week_label: `Week ${weekNumber} (${visitDate})`,
      visit_date: visitDate,
      business_and_visit: businessAndVisit,
      contact_and_authority: contactAndAuthority,
      packaging_required: packagingRequired,
      quantity_and_buying_date: quantityAndBuyingDate || undefined,
      current_supplier_and_price: currentSupplierAndPrice || undefined,
      need_and_reason_to_change: needAndReasonToChange || 'Will depend on proposed price',
      your_proposal: yourProposal || 'Best price, better service',
      customer_response: customerResponse || undefined,
      current_stage_and_evidence: currentStageAndEvidence,
      potential_sales_mur: potentialSalesMur ? Number(potentialSalesMur) : undefined,
      next_action_and_commitment: nextActionAndCommitment || 'Follow up with customer next week',
      support_and_documents: supportAndDocuments || undefined,
      brand,
      status,
      priority,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Log Customer Follow-Up (12-Point Template)
              </h3>
              <p className="text-xs text-text-secondary">
                Submit this week's field visit directly to management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Section 1: Session & Assignment */}
          <div className="bg-bg-secondary/40 p-4 rounded-xl border border-border-subtle space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Metadata & Ownership
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">Sales Rep</label>
                <select
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  className="w-full bg-bg-card border border-border-subtle rounded-md px-2.5 py-1.5 font-medium text-text-primary"
                >
                  {salesReps.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">Brand Division</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value as 'Explast' | 'PrintBox')}
                  className="w-full bg-bg-card border border-border-subtle rounded-md px-2.5 py-1.5 font-medium text-text-primary"
                >
                  <option value="PrintBox">PrintBox (Paper)</option>
                  <option value="Explast">Explast (Plastics)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">Week Number</label>
                <input
                  type="number"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                  className="w-full bg-bg-card border border-border-subtle rounded-md px-2.5 py-1.5 font-mono text-text-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">Visit Date</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-bg-card border border-border-subtle rounded-md px-2.5 py-1.5 font-mono text-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 12 Template Fields */}
          <div className="space-y-4 text-xs">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-primary">
              Standardized 12 Customer Visit Fields
            </h4>

            {/* Field 1 & 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary flex items-center gap-1">
                  1. Business & visit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grillicious, Le Fournil de l'Ile..."
                  value={businessAndVisit}
                  onChange={(e) => setBusinessAndVisit(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary flex items-center gap-1">
                  2. Contact & buying authority <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sweety / Purchasing Lead (Tel – 54613220)"
                  value={contactAndAuthority}
                  onChange={(e) => setContactAndAuthority(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Field 3 & 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary flex items-center gap-1">
                  3. Packaging required <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Food packaging items (printed takeaway boxes)"
                  value={packagingRequired}
                  onChange={(e) => setPackagingRequired(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  4. Quantity & buying date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2,500 pcs initial run, regular monthly repeat"
                  value={quantityAndBuyingDate}
                  onChange={(e) => setQuantityAndBuyingDate(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Field 5 & 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  5. Current supplier & price
                </label>
                <input
                  type="text"
                  placeholder="e.g. N/A or Local competitor @ Rs 9.20"
                  value={currentSupplierAndPrice}
                  onChange={(e) => setCurrentSupplierAndPrice(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  6. Need & reason to change
                </label>
                <input
                  type="text"
                  placeholder="e.g. Will depend on proposed price and custom print quality"
                  value={needAndReasonToChange}
                  onChange={(e) => setNeedAndReasonToChange(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Field 7 & 8 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  7. Your proposal.
                </label>
                <input
                  type="text"
                  placeholder="e.g. Best price, better service. Proposed Rs 8.25/pc"
                  value={yourProposal}
                  onChange={(e) => setYourProposal(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  8. Customer response
                </label>
                <input
                  type="text"
                  placeholder="e.g. Impressed by print samples; wants quote for sign-off"
                  value={customerResponse}
                  onChange={(e) => setCustomerResponse(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Field 9 & 10 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  9. Current stage & evidence
                </label>
                <input
                  type="text"
                  placeholder="e.g. Is using plain packaging. Took photo on site."
                  value={currentStageAndEvidence}
                  onChange={(e) => setCurrentStageAndEvidence(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  10. Potential sales (optional MUR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 23718"
                  value={potentialSalesMur}
                  onChange={(e) => setPotentialSalesMur(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 font-mono text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Field 11 & 12 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  11. Next action & commitment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gave our printed samples – will check for response soon."
                  value={nextActionAndCommitment}
                  onChange={(e) => setNextActionAndCommitment(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary">
                  12. Support & documents
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sample pack delivered. Quotation QUO-PB-2026-0010 issued."
                  value={supportAndDocuments}
                  onChange={(e) => setSupportAndDocuments(e.target.value)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Deal Status & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Current Stage Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as WeeklyFollowUpStatus)}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                >
                  <option value="sample_given">Sample Delivered</option>
                  <option value="hot_lead">Hot Lead (Priority)</option>
                  <option value="quoted">Quotation Issued</option>
                  <option value="in_negotiation">In Negotiation</option>
                  <option value="converted">Order Converted</option>
                  <option value="cold">Cold / Unqualified</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-text-primary">Follow-up Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                  className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-text-primary focus:border-brand-primary focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="shadow-xs">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Save Weekly Follow-Up
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENT: 12-POINT DOSSIER DETAIL & PRINT MODAL
// ============================================================================
interface FollowUpDetailModalProps {
  item: WeeklySalesFollowUp;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: WeeklyFollowUpStatus) => void;
}

function FollowUpDetailModal({
  item,
  isOpen,
  onClose,
  onStatusChange,
}: FollowUpDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static print:z-0">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* MODAL HEADER (HIDDEN ON PRINT) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Customer Follow-up Dossier • {item.business_and_visit}
              </h3>
              <p className="text-xs text-text-secondary">
                Submitted by {item.salesperson} ({item.week_label})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Dossier
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOSSIER SHEET */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1 print:p-0">
          
          {/* Header Block */}
          <div className="border-b border-zinc-200 pb-4 flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {item.brand} • Weekly Sales Follow-Up Log
              </span>
              <h2 className="text-xl font-bold text-zinc-900 mt-0.5">
                {item.business_and_visit}
              </h2>
              <p className="text-xs text-zinc-600 mt-1">
                Representative: <strong>{item.salesperson}</strong> | Date: {item.visit_date} | {item.week_label}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full border border-zinc-300 bg-zinc-100 text-zinc-800">
                {item.status.replace('_', ' ').toUpperCase()}
              </span>
              {item.potential_sales_mur && (
                <p className="text-xs font-mono font-bold text-zinc-900 mt-1.5">
                  Rs {item.potential_sales_mur.toLocaleString()} MUR
                </p>
              )}
            </div>
          </div>

          {/* 12-POINT STRUCTURED TABLE MATCHING WORD TEMPLATE */}
          <table className="w-full border-collapse border border-zinc-300 text-xs text-zinc-900">
            <tbody>
              <tr className="border-b border-zinc-300">
                <td className="w-1/3 p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  1 Business & visit
                </td>
                <td className="p-3 font-semibold">{item.business_and_visit}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  2 Contact & buying authority
                </td>
                <td className="p-3">{item.contact_and_authority}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  3 Packaging required
                </td>
                <td className="p-3 font-medium">{item.packaging_required}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  4 Quantity & buying date
                </td>
                <td className="p-3 font-mono">{item.quantity_and_buying_date || 'N/A'}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  5 Current supplier & price
                </td>
                <td className="p-3">{item.current_supplier_and_price || 'N/A'}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  6 Need & reason to change
                </td>
                <td className="p-3">{item.need_and_reason_to_change}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  7 Your proposal.
                </td>
                <td className="p-3 font-medium">{item.your_proposal}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  8 Customer response
                </td>
                <td className="p-3">{item.customer_response || 'Pending follow-up'}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  9 Current stage & evidence
                </td>
                <td className="p-3 font-medium">{item.current_stage_and_evidence}</td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  10 Potential sales (optional)
                </td>
                <td className="p-3 font-mono font-bold">
                  {item.potential_sales_mur ? `Rs ${item.potential_sales_mur.toLocaleString()}` : 'N/A'}
                </td>
              </tr>
              <tr className="border-b border-zinc-300">
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  11 Next action & commitment
                </td>
                <td className="p-3 font-semibold text-brand-primary">{item.next_action_and_commitment}</td>
              </tr>
              <tr>
                <td className="p-3 bg-zinc-100 font-bold border-r border-zinc-300">
                  12 Support & documents
                </td>
                <td className="p-3">{item.support_and_documents || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          {/* Signoff Footer */}
          <div className="pt-6 border-t border-zinc-200 grid grid-cols-2 gap-8 text-xs text-zinc-600 print:mt-12">
            <div>
              <span className="block font-bold text-zinc-800">Submitted by Sales Representative:</span>
              <p className="mt-4 border-b border-zinc-400 pb-1 font-medium">{item.salesperson}</p>
            </div>
            <div>
              <span className="block font-bold text-zinc-800">Reviewed by Management / Admin:</span>
              <p className="mt-4 border-b border-zinc-400 pb-1 text-zinc-400">Date & Signature</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
