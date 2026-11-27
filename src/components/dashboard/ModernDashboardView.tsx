'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DemoService } from '@/lib/sales/demo-service';
import { AppUser, SalesTask } from '@/types/demo';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { KPICard } from '../ui/KPICard';
import { PageHeader } from '../ui/PageHeader';
import { GroupedBarChart } from '../ui/charts/GroupedBarChart';
import { TasksSection } from './TasksSection';
import { TaskManagementModal } from './TaskManagementModal';
import { ProjectPipelineCard } from './ProjectPipelineCard';
import { SalesTeamPerformanceTable } from './SalesTeamPerformanceTable';
import { ProductionOverviewCard } from './ProductionOverviewCard';
import { RecentActivityCard } from './RecentActivityCard';
import {
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Factory,
  Plus,
  Coins,
  Inbox,
  User,
  Filter,
} from 'lucide-react';

interface ModernDashboardViewProps {
  brand: string;
  projects: any[];
  currentUser: AppUser;
  onNewProject: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenClient: (customerId: string) => void;
  onOpenProject: (project: any) => void;
  onOpenQuotation?: (quotation: any) => void;
}

export function ModernDashboardView({
  brand,
  projects,
  currentUser,
  onNewProject,
  onNavigateTab,
  onOpenClient,
  onOpenProject,
  onOpenQuotation,
}: ModernDashboardViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'last_month' | '3months' | 'ytd'>('ytd');
  const [adminSelectedRep, setAdminSelectedRep] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasksState, setTasksState] = useState<SalesTask[]>([]);

  const isAdmin = currentUser.role === 'admin';
  const effectiveRep = isAdmin
    ? adminSelectedRep === 'all'
      ? undefined
      : adminSelectedRep
    : currentUser.name;

  // Sync tasks on mount or when user/rep changes
  const refreshTasks = () => {
    DemoService.initialize();
    const fetched = DemoService.getTasks({
      assignedTo: isAdmin ? (adminSelectedRep === 'all' ? undefined : adminSelectedRep) : currentUser.name,
      brand: brand,
      status: 'all',
    });
    setTasksState(fetched);
  };

  useEffect(() => {
    refreshTasks();
  }, [isAdmin, adminSelectedRep, currentUser.name, brand]);

  // Scoped project list strictly for active counting and pipeline
  const brandProjects = useMemo(() => {
    return projects
      .filter(p => !p.brand || p.brand === brand || p.business_unit === brand)
      .filter(p => {
        if (isAdmin && adminSelectedRep === 'all') return true;
        const targetRep = isAdmin ? adminSelectedRep : currentUser.name;
        const rep = p.assigned_salesperson || p.salesperson || p.client?.assigned_salesperson || p.clients?.assigned_salesperson;
        return rep === targetRep;
      });
  }, [projects, brand, isAdmin, adminSelectedRep, currentUser.name]);

  // Fetch period-scoped metrics from central analytics engine
  const metrics = useMemo(() => {
    return DemoService.getAnalyticsMetrics({
      salespersonName: effectiveRep,
      period: selectedPeriod,
      brand,
    });
  }, [effectiveRep, selectedPeriod, brand]);

  const activities = useMemo(() => {
    const all = DemoService.getActivities();
    if (!isAdmin) {
      return all.filter(a => a.actor === currentUser.name || a.actor === 'Alex L.' || !a.actor);
    }
    if (adminSelectedRep !== 'all') {
      return all.filter(a => a.actor === adminSelectedRep);
    }
    return all;
  }, [isAdmin, currentUser.name, adminSelectedRep, tasksState]);

  const periodLabels: Record<string, string> = {
    month: 'This Month',
    last_month: 'Last Month',
    '3months': 'Last 3 Months',
    ytd: 'Year to Date',
  };

  // Task interaction handlers
  const handleCompleteTask = (taskId: string) => {
    DemoService.completeTask(taskId);
    refreshTasks();
  };

  const handleRescheduleTask = (taskId: string, newDate: string) => {
    DemoService.rescheduleTask(taskId, newDate);
    refreshTasks();
  };

  const handleDeleteTask = (taskId: string) => {
    DemoService.deleteTask(taskId);
    refreshTasks();
  };

  const handleCreateTask = (taskData: Partial<SalesTask>) => {
    DemoService.createTask(taskData);
    refreshTasks();
  };

  const handleOpenTask = (task: SalesTask) => {
    if (task.related_quotation_id || task.related_quotation_number) {
      const q = DemoService.getQuotations().find(
        x => x.id === task.related_quotation_id || x.quotation_number === task.related_quotation_number
      );
      if (q && onOpenQuotation) {
        onOpenQuotation(q);
        return;
      }
      if (q && q.client_id) {
        onOpenClient(q.client_id);
        return;
      }
    }

    if (task.related_project_id) {
      const proj = projects.find(p => p.id === task.related_project_id);
      if (proj) {
        onOpenProject(proj);
        return;
      }
    }

    if (task.related_client_id) {
      onOpenClient(task.related_client_id);
      return;
    }

    onNavigateTab('Projects');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ==================================================================== */}
      {/* A. DASHBOARD HEADER (Role-Adapted)                                   */}
      {/* ==================================================================== */}
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise Oversight' : `Sales Portal • ${currentUser.name}`}
        badgeText={isAdmin ? `${brand} Executive Access` : `Portfolio: ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title={isAdmin ? 'Company Dashboard' : 'Dashboard'}
        description={
          isAdmin
            ? 'Overview of your business performance and operations.'
            : 'Your business at a glance.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {/* Admin Sales Representative Filter */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-bg-card border border-border-strong/70 rounded-lg px-2.5 py-1 shadow-2xs">
                <User className="w-3.5 h-3.5 text-text-muted" />
                <select
                  value={adminSelectedRep}
                  onChange={(e) => setAdminSelectedRep(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer pr-1"
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
              {(['month', 'last_month', '3months', 'ytd'] as const).map((pKey) => (
                <button
                  key={pKey}
                  type="button"
                  onClick={() => setSelectedPeriod(pKey)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                    selectedPeriod === pKey
                      ? 'bg-brand-primary text-white font-semibold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  }`}
                >
                  {periodLabels[pKey]}
                </button>
              ))}
            </div>

            <Button onClick={onNewProject}>
              <Plus className="w-4 h-4 mr-2" /> New Request
            </Button>
          </div>
        }
      />

      {/* ==================================================================== */}
      {/* 1. SALES REPRESENTATIVE DASHBOARD VIEW                              */}
      {/* ==================================================================== */}
      {!isAdmin && (
        <>
          {/* ROW 1: 4 MAIN SALES KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 – Total Quoted Value */}
            <KPICard
              label="Total Quoted Value"
              value={`Rs ${metrics.sales.totalQuotationValue.toLocaleString()}`}
              variation={metrics.sales.quotedVariation}
              sparklineData={metrics.sales.quotedSparkline}
              sparklineColor="teal"
              accent="brand"
              icon={TrendingUp}
            />

            {/* Card 2 – My Active Projects */}
            <KPICard
              label="My Active Projects"
              value={`${metrics.sales.activeProjectsCount} Active Projects`}
              variation={metrics.sales.activeProjectsVariation}
              sparklineData={[
                Math.max(1, metrics.sales.activeProjectsCount - 3),
                Math.max(2, metrics.sales.activeProjectsCount - 1),
                metrics.sales.activeProjectsCount,
              ]}
              sparklineColor="teal"
              accent="purple"
              icon={FolderKanban}
            />

            {/* Card 3 – Commercial Win Rate */}
            <KPICard
              label="Commercial Win Rate"
              value={`${metrics.sales.conversionRate}% Win Rate`}
              variation={metrics.sales.conversionVariation}
              sparklineData={[58, 62, 60, 65, 64, metrics.sales.conversionRate]}
              sparklineColor="emerald"
              accent="success"
              icon={CheckCircle2}
            />

            {/* Card 4 – Plant Orders */}
            <KPICard
              label="Plant Orders"
              value={`${metrics.production.activeJobsCount} Plant Orders`}
              trend={metrics.production.completedJobsText}
              sparklineData={[3, 5, 4, 6, metrics.production.activeJobsCount]}
              sparklineColor="amber"
              accent="amber"
              icon={Factory}
            />
          </div>

          {/* ROW 2: MY TASKS & FOLLOW-UPS (Prominent placement immediately below KPIs!) */}
          <TasksSection
            tasks={tasksState}
            isAdmin={false}
            title="My Tasks & Follow-ups"
            subtitle="Tasks that need your attention today."
            onCompleteTask={handleCompleteTask}
            onRescheduleTask={handleRescheduleTask}
            onOpenTask={handleOpenTask}
            onViewAll={() => setIsTaskModalOpen(true)}
            onAddTask={() => setIsTaskModalOpen(true)}
          />

          {/* ROW 3: SALES PERFORMANCE (~65%) & PROJECT PIPELINE (~35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* C. SALES PERFORMANCE GROUPED BAR CHART (8 of 12 cols = 66.7%) */}
            <Card className="lg:col-span-8 p-6 space-y-4 border border-border-strong/70 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                    Sales Performance
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Monthly quoted value versus signed revenue (MUR)
                  </p>
                </div>

                {/* Legends */}
                <div className="flex items-center gap-4 text-xs shrink-0">
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    <span className="w-3 h-3 rounded-xs bg-[#119A94]" /> Quoted Value
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    <span className="w-3 h-3 rounded-xs bg-[#6E4A9E]" /> Signed Revenue
                  </span>
                </div>
              </div>

              {/* Grouped Bar Chart */}
              <div className="pt-2">
                <GroupedBarChart data={metrics.monthlySalesTrend} height={230} />
              </div>
            </Card>

            {/* D. PROJECT PIPELINE (4 of 12 cols = 33.3%) */}
            <ProjectPipelineCard
              title="Project Pipeline"
              subtitle="My portfolio workflow distribution"
              stages={metrics.pipelineStages}
              totalActiveProjects={metrics.sales.activeProjectsCount}
              onNavigateToProjects={() => onNavigateTab('Projects')}
              className="lg:col-span-4"
            />
          </div>

          {/* ROW 4: RECENT ACTIVITY */}
          <RecentActivityCard
            activities={activities}
            isAdmin={false}
            title="Recent Activity"
            subtitle="Your recent sales requests, quotation updates, and completed actions"
          />
        </>
      )}

      {/* ==================================================================== */}
      {/* 2. ADMINISTRATOR DASHBOARD VIEW                                     */}
      {/* ==================================================================== */}
      {isAdmin && (
        <>
          {/* ROW 1: SIX MAIN BUSINESS KPI CARDS (Responsive Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Card 1: Total Quoted Value */}
            <KPICard
              label="Total Quoted Value"
              value={`Rs ${metrics.sales.totalQuotationValue.toLocaleString()}`}
              variation={metrics.sales.quotedVariation}
              sparklineData={metrics.sales.quotedSparkline}
              sparklineColor="teal"
              accent="brand"
              icon={TrendingUp}
            />

            {/* Card 2: Signed Revenue */}
            <KPICard
              label="Signed Revenue"
              value={`Rs ${metrics.sales.acceptedQuotationValue.toLocaleString()}`}
              variation={metrics.sales.revenueVariation}
              sparklineData={metrics.sales.revenueSparkline}
              sparklineColor="purple"
              accent="purple"
              icon={Coins}
            />

            {/* Card 3: Active Sales Requests */}
            <KPICard
              label="Active Requests"
              value={`${metrics.sales.totalRequests} Requests`}
              variation={{ percent: 10, isPositive: true, comparisonText: 'across brand' }}
              sparklineData={[14, 18, 16, 20, 22, metrics.sales.totalRequests]}
              sparklineColor="teal"
              accent="brand"
              icon={Inbox}
            />

            {/* Card 4: Commercial Win Rate */}
            <KPICard
              label="Commercial Win Rate"
              value={`${metrics.sales.conversionRate}% Win Rate`}
              variation={metrics.sales.conversionVariation}
              sparklineData={[58, 62, 60, 65, 64, metrics.sales.conversionRate]}
              sparklineColor="emerald"
              accent="success"
              icon={CheckCircle2}
            />

            {/* Card 5: Active Projects */}
            <KPICard
              label="Active Projects"
              value={`${metrics.sales.activeProjectsCount} In Pipeline`}
              variation={metrics.sales.activeProjectsVariation}
              sparklineData={[20, 22, 24, 25, metrics.sales.activeProjectsCount]}
              sparklineColor="teal"
              accent="purple"
              icon={FolderKanban}
            />

            {/* Card 6: Plant Orders in Progress */}
            <KPICard
              label="Plant Orders"
              value={`${metrics.production.activeJobsCount} In Production`}
              trend={metrics.production.completedJobsText}
              sparklineData={[6, 8, 7, 9, 10, metrics.production.activeJobsCount]}
              sparklineColor="amber"
              accent="amber"
              icon={Factory}
            />
          </div>

          {/* ROW 2: COMPANY SALES PERFORMANCE (~65%) & COMPANY PROJECT PIPELINE (~35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 p-6 space-y-4 border border-border-strong/70 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary tracking-tight">
                      Company Sales Performance
                    </h3>
                    {adminSelectedRep !== 'all' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary">
                        Filtered: {adminSelectedRep}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Monthly commercial pipeline vs. signed purchase orders (MUR)
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    <span className="w-3 h-3 rounded-xs bg-[#119A94]" /> Quoted Value
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    <span className="w-3 h-3 rounded-xs bg-[#6E4A9E]" /> Signed Revenue
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <GroupedBarChart data={metrics.monthlySalesTrend} height={240} />
              </div>
            </Card>

            <ProjectPipelineCard
              title="Company Project Pipeline"
              subtitle={`Global workflow distribution (${brand})`}
              stages={metrics.pipelineStages}
              totalActiveProjects={metrics.sales.activeProjectsCount}
              onNavigateToProjects={() => onNavigateTab('Projects')}
              className="lg:col-span-4"
            />
          </div>

          {/* ROW 3: SALES TEAM PERFORMANCE (~60%) & BUSINESS ATTENTION (~40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <SalesTeamPerformanceTable
              reps={metrics.salesRepsList}
              selectedRep={adminSelectedRep}
              onSelectRep={(rep) => setAdminSelectedRep(rep)}
              className="lg:col-span-7"
            />

            <div className="lg:col-span-5">
              <TasksSection
                tasks={tasksState}
                isAdmin={true}
                title="Business Attention"
                subtitle="Items requiring attention across the company."
                onCompleteTask={handleCompleteTask}
                onRescheduleTask={handleRescheduleTask}
                onOpenTask={handleOpenTask}
                onViewAll={() => setIsTaskModalOpen(true)}
                onAddTask={() => setIsTaskModalOpen(true)}
              />
            </div>
          </div>

          {/* ROW 4: PRODUCTION OVERVIEW (~50%) & RECENT COMPANY ACTIVITY (~50%) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductionOverviewCard
              workload={metrics.production.workload}
              brand={brand}
            />

            <RecentActivityCard
              activities={activities}
              isAdmin={true}
              title="Recent Company Activity"
              subtitle="Latest sales requests, issued quotes, production jobs, and completed actions"
            />
          </div>
        </>
      )}

      {/* ==================================================================== */}
      {/* 3. TASK MANAGEMENT MODAL                                             */}
      {/* ==================================================================== */}
      <TaskManagementModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        tasks={tasksState}
        isAdmin={isAdmin}
        currentUserName={currentUser.name}
        onCompleteTask={handleCompleteTask}
        onRescheduleTask={handleRescheduleTask}
        onDeleteTask={handleDeleteTask}
        onCreateTask={handleCreateTask}
        onOpenTask={handleOpenTask}
      />
    </div>
  );
}
