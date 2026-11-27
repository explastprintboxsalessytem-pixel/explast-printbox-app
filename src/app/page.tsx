'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { KPICard } from '../components/ui/KPICard';
import { EntityCard } from '../components/ui/EntityCard';
import { PageHeader } from '../components/ui/PageHeader';
import { BrandToggle } from '../components/ui/BrandToggle';
import { FilterToolbar, FilterOption } from '../components/ui/FilterToolbar';
import { AdaptiveSalesFormModal } from '../components/sales/AdaptiveSalesFormModal';
import { ExplastSalesFormModal } from '../components/sales/ExplastSalesFormModal';
import { QuotationsView } from '../components/sales/QuotationsView';
import { DesignView } from '../components/sales/DesignView';
import { ReportsView } from '../components/sales/ReportsView';
import { ModernDashboardView } from '../components/dashboard/ModernDashboardView';
import { ClientDetailModal } from '../components/sales/ClientDetailModal';
import { NewClientModal } from '../components/sales/NewClientModal';
import { ProjectDetailModal } from '../components/sales/ProjectDetailModal';
import { QuotationDetailModal } from '../components/sales/QuotationDetailModal';
import { AppUser, APP_USERS } from '../types/demo';
import { SalesDataService } from '../lib/sales/data-service';
import { ExplastSalesService } from '../lib/sales/explast-service';
import { DemoService } from '../lib/sales/demo-service';
import { Client } from '../types/sales';

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Palette,
  BarChart,
  Settings,
  Bell,
  Search,
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Building2,
  Shield,
  UserCheck,
  LayoutGrid,
  Kanban,
} from 'lucide-react';

export default function App() {
  const [brand, setBrand] = useState<'Explast' | 'PrintBox'>('Explast');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentUser, setCurrentUser] = useState<AppUser>(APP_USERS[0]); // Alex L. by default
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resumeDraftId, setResumeDraftId] = useState<string | undefined>();
  const [projects, setProjects] = useState<any[]>(() => {
    DemoService.initialize();
    return DemoService.getProjects();
  });
  const [clients, setClients] = useState<Client[]>(() => {
    DemoService.initialize();
    return DemoService.getCustomers() as unknown as Client[];
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<any | null>(null);
  const [selectedQuotationForModal, setSelectedQuotationForModal] = useState<any | null>(null);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Refresh projects and clients across both systems and demo dataset
  async function refreshData() {
    try {
      DemoService.initialize();
      const demoClients = DemoService.getCustomers();
      const demoProjects = DemoService.getProjects();

      const projectMap = new Map<string, any>();
      // Layer in demo projects first so the view is never empty
      demoProjects.forEach(p => projectMap.set(p.id, p));

      const clientMap = new Map<string, any>();
      // Layer in demo clients first
      demoClients.forEach(c => clientMap.set(c.id, c));

      // Attempt remote or local fetch safely without blocking
      try {
        const [allPrintboxProjects, allExplastProjects, allClients] = await Promise.all([
          SalesDataService.getAllProjects(),
          ExplastSalesService.getAllExplastProjects(),
          SalesDataService.getClients(),
        ]);

        if (Array.isArray(allPrintboxProjects)) {
          allPrintboxProjects.forEach(p => projectMap.set(p.id, p));
        }
        if (Array.isArray(allExplastProjects)) {
          allExplastProjects.forEach(p => projectMap.set(p.id, p));
        }
        if (Array.isArray(allClients)) {
          allClients.forEach(c => clientMap.set(c.id, c));
        }
      } catch (err) {
        console.warn('Remote sync skipped or failed, using rich demo dataset:', err);
      }

      setProjects(Array.from(projectMap.values()));
      setClients(Array.from(clientMap.values()));
    } catch (e) {
      console.error('Error refreshing app data:', e);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Clients', icon: Users },
    { name: 'Projects', icon: FolderKanban },
    { name: 'Quotations', icon: FileText },
    { name: 'Design', icon: Palette },
    { name: 'Reports', icon: BarChart },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div data-brand={brand.toLowerCase()} className="min-h-screen bg-bg-page text-text-primary font-sans flex">
      {/* SIDEBAR */}
      <aside className="w-[180px] flex-shrink-0 bg-bg-card border-r border-border-subtle flex flex-col h-screen sticky top-0">
        <div className="p-6 h-16 flex items-center border-b border-border-subtle">
          <span className="text-[13px] font-bold tracking-widest uppercase text-text-primary">
            {brand}
          </span>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === item.name
                  ? 'bg-brand-primary-light text-brand-primary-dark border-l-2 border-brand-primary font-medium'
                  : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-brand-primary' : 'text-text-muted'}`} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
              {currentUser.avatar}
            </div>
            <div className="text-sm min-w-0">
              <p className="font-medium text-text-primary truncate">{currentUser.name}</p>
              <p className="text-xs text-text-muted capitalize">
                {currentUser.role === 'admin' ? 'Global Admin' : 'Sales Rep'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="h-16 bg-bg-card border-b border-border-subtle flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-sm font-medium text-text-primary">
              {brand} <span className="text-text-muted mx-2">/</span> {brand === 'Explast' ? 'Extrusion, Printing & Converting Operations' : 'Paper Packaging Studio'}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              <Sparkles className="w-3 h-3" /> Live Demo Mode
            </span>
          </div>
          
          <div className="flex items-center space-x-5">
            {/* ROLE & PERMISSION SWITCHER */}
            <div className="flex items-center gap-2 bg-bg-secondary px-3 py-1.5 rounded-lg border border-border-subtle shadow-sm">
              <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-bold">
                {currentUser.avatar}
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = APP_USERS.find(x => x.id === e.target.value);
                    if (u) setCurrentUser(u);
                  }}
                  className="bg-transparent text-xs font-semibold text-text-primary focus:outline-none cursor-pointer pr-1"
                >
                  {APP_USERS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'admin' ? 'Admin / Full View' : 'Sales Rep'})
                    </option>
                  ))}
                </select>
                <Badge variant={currentUser.role === 'admin' ? 'neutral' : 'brand'} className="text-[9px] px-1.5 py-0">
                  {currentUser.role === 'admin' ? 'Admin' : 'Sales'}
                </Badge>
              </div>
            </div>

            <BrandToggle brand={brand} onChange={setBrand} />
            <div className="flex items-center space-x-4 text-text-muted">
              <button className="hover:text-text-primary transition-colors"><Search className="w-5 h-5" /></button>
              <button className="hover:text-text-primary transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-brand-accent rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8 lg:p-10 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'Dashboard' && (
            <ModernDashboardView 
              brand={brand} 
              projects={projects}
              currentUser={currentUser}
              onNewProject={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenClient={(cId) => setSelectedCustomerId(cId)}
              onOpenProject={(proj) => setSelectedProjectForModal(proj)}
            />
          )}

          {activeTab === 'Projects' && (
            <PipelineView 
              brand={brand} 
              projects={projects}
              currentUser={currentUser}
              onNewProject={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }} 
              onOpenProject={(proj) => setSelectedProjectForModal(proj)}
            />
          )}

          {activeTab === 'Clients' && (
            <ClientsView 
              brand={brand} 
              clients={clients}
              currentUser={currentUser}
              onAddNewClient={() => setIsNewClientModalOpen(true)}
              onAddClientRequest={() => {
                setResumeDraftId(undefined);
                setIsFormOpen(true);
              }}
              onSelectClient={(client) => setSelectedCustomerId(client.id)}
            />
          )}

          {activeTab === 'Quotations' && (
            <QuotationsView
              brand={brand}
              currentUser={currentUser}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
            />
          )}

          {activeTab === 'Design' && (
            <DesignView
              brand={brand}
              currentUser={currentUser}
              onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
            />
          )}

          {activeTab === 'Reports' && (
            <ReportsView brand={brand} currentUser={currentUser} />
          )}

          {activeTab === 'Settings' && (
            <SettingsView
              currentUser={currentUser}
              onResetDemo={() => {
                DemoService.resetDemoData();
                refreshData();
              }}
            />
          )}
        </div>
      </main>

      {/* DEDICATED INDEPENDENT WORKFLOW MODALS */}
      {brand === 'Explast' ? (
        <ExplastSalesFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          resumeDraftId={resumeDraftId}
          onSuccess={async (projectId) => {
            await refreshData();
            setActiveTab('Projects');
          }}
        />
      ) : (
        <AdaptiveSalesFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          initialBrand="PrintBox"
          resumeDraftId={resumeDraftId}
          onSuccess={async (projectId) => {
            await refreshData();
            setActiveTab('Projects');
          }}
        />
      )}

      {/* 360° CLIENT PROFILE MODAL */}
      <ClientDetailModal
        customerId={selectedCustomerId}
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        onNewRequest={() => {
          setResumeDraftId(undefined);
          setIsFormOpen(true);
        }}
        onOpenQuotation={(qId) => {
          const q = DemoService.getQuotations().find(x => x.id === qId);
          if (q) setSelectedQuotationForModal(q);
        }}
      />

      {/* NEW CLIENT REGISTRATION MODAL */}
      <NewClientModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSuccess={async (newClient) => {
          await refreshData();
          setSelectedCustomerId(newClient.id);
        }}
        currentUser={currentUser}
      />

      {/* COMPREHENSIVE PROJECT CARD MODAL */}
      <ProjectDetailModal
        project={selectedProjectForModal}
        isOpen={!!selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onOpenClient={(clientId: string) => setSelectedCustomerId(clientId)}
        onOpenQuotation={(qId) => {
          const q = DemoService.getQuotations().find(x => x.id === qId);
          if (q) setSelectedQuotationForModal(q);
        }}
        currentUser={currentUser}
      />

      {/* OFFICIAL COMPANY QUOTATION DETAIL & PRINT MODAL */}
      <QuotationDetailModal
        quotation={selectedQuotationForModal}
        isOpen={!!selectedQuotationForModal}
        currentUser={currentUser}
        onClose={() => setSelectedQuotationForModal(null)}
        onStatusChange={(id, status, actor, notes) => {
          DemoService.updateQuotationStatus(id, status, actor || currentUser?.name || 'Alex L.', notes);
          refreshData();
          const updated = DemoService.getQuotations().find(x => x.id === id);
          if (updated) setSelectedQuotationForModal(updated);
        }}
        onNavigateToCustomer={(cId) => setSelectedCustomerId(cId)}
      />
    </div>
  );
}

function PipelineView({
  brand,
  projects,
  currentUser,
  onNewProject,
  onOpenProject,
}: {
  brand: string;
  projects: any[];
  currentUser: AppUser;
  onNewProject: () => void;
  onOpenProject: (project: any) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');

  const isAdmin = currentUser.role === 'admin';
  const brandProjects = projects
    .filter(p => !p.brand || p.brand === brand || p.business_unit === brand)
    .filter(p => {
      if (isAdmin) return true;
      const rep = p.assigned_salesperson || p.salesperson || p.client?.assigned_salesperson || p.clients?.assigned_salesperson;
      return rep === currentUser.name;
    });

  // Compute stage counts for filter pills
  const discoveryCount = brandProjects.filter(p => p.kanban_stage === 'Discovery' || !p.kanban_stage).length;
  const quotingCount = brandProjects.filter(p => p.kanban_stage === 'Quoting' || p.kanban_stage === 'Negotiation').length;
  const prodCount = brandProjects.filter(p => p.kanban_stage === 'Production Order' || p.kanban_stage === 'In Production').length;
  const completedCount = brandProjects.filter(p => p.kanban_stage === 'Completed' || p.kanban_stage === 'Closed').length;

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Projects', count: brandProjects.length },
    { id: 'Discovery', label: 'Discovery', count: discoveryCount },
    { id: 'Quoting', label: 'Quoting', count: quotingCount },
    { id: 'Production Order', label: 'Production Order', count: prodCount },
    { id: 'Completed', label: 'Completed', count: completedCount },
  ];

  const filteredProjects = brandProjects.filter(p => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || (
      p.project_name?.toLowerCase().includes(q) ||
      p.client_name?.toLowerCase().includes(q) ||
      p.client?.company_name?.toLowerCase().includes(q) ||
      p.clients?.company_name?.toLowerCase().includes(q) ||
      p.material_family?.toLowerCase().includes(q) ||
      p.formulation?.toLowerCase().includes(q) ||
      p.final_product_type?.toLowerCase().includes(q) ||
      p.assigned_salesperson?.toLowerCase().includes(q) ||
      p.salesperson?.toLowerCase().includes(q) ||
      p.request_type?.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    if (stageFilter === 'all') return true;
    if (stageFilter === 'Discovery') return p.kanban_stage === 'Discovery' || !p.kanban_stage;
    if (stageFilter === 'Quoting') return p.kanban_stage === 'Quoting' || p.kanban_stage === 'Negotiation';
    if (stageFilter === 'Production Order') return p.kanban_stage === 'Production Order' || p.kanban_stage === 'In Production';
    if (stageFilter === 'Completed') return p.kanban_stage === 'Completed' || p.kanban_stage === 'Closed';
    return true;
  });

  const getStageVariant = (stage?: string): 'neutral' | 'warning' | 'brand' | 'success' => {
    if (stage === 'Completed' || stage === 'Closed') return 'success';
    if (stage === 'Production Order' || stage === 'In Production') return 'brand';
    if (stage === 'Quoting' || stage === 'Negotiation') return 'warning';
    return 'neutral';
  };

  const stages = [
    { name: 'Discovery', label: '1. Discovery & Enquiry' },
    { name: 'Quoting', label: '2. Commercial Quoting' },
    { name: 'Production Order', label: '3. Production Released' },
    { name: 'Completed', label: '4. Closed & Completed' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise Pipeline Kanban & Portfolio' : 'Assigned Pipeline Portfolio'}
        badgeText={isAdmin ? `${filteredProjects.length} of ${brandProjects.length} Projects` : `${filteredProjects.length} Assigned to ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title={isAdmin ? `Active ${brand} Projects (Company-wide)` : `My Active ${brand} Projects`}
        actions={
          <Button onClick={onNewProject}><Plus className="w-4 h-4 mr-2" /> New Request</Button>
        }
      />

      {/* FILTER & SEARCH TOOLBAR WITH VIEW TOGGLE */}
      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search projects by project name, customer, formulation, or sales rep..."
        filterOptions={filterOptions}
        activeFilter={stageFilter}
        onFilterChange={setStageFilter}
        rightContent={
          <div className="flex items-center gap-1 bg-bg-secondary p-0.5 rounded-lg border border-border-subtle shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-bg-card text-brand-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Card Grid View (Client style)"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-bg-card text-brand-primary shadow-xs font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
        }
      />

      {/* VIEW MODE 1: CLIENT-STYLE 3-COLUMN CARD GRID (DEFAULT) */}
      {viewMode === 'grid' && (
        <>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj) => (
                <EntityCard
                  key={proj.id}
                  category={proj.final_product_type || proj.request_type || 'Packaging'}
                  title={proj.project_name}
                  subtitle={proj.client?.company_name || proj.clients?.company_name || proj.client_name || 'Client Record'}
                  specPrimary={
                    proj.formulation ? (
                      <>
                        <strong className="text-text-primary font-medium">{proj.material_family}</strong> • {proj.formulation}
                      </>
                    ) : 'Standard Packaging'
                  }
                  specSecondary={
                    proj.print_type === 'printed' ? `${proj.printing_spec?.num_colors || 1} Colors Flexo` : 'Plain Film'
                  }
                  salespersonName={proj.assigned_salesperson || proj.salesperson || 'Alex L.'}
                  statusLabel={proj.kanban_stage || proj.technical_assessment?.status || proj.request_status || 'Active'}
                  statusVariant={getStageVariant(proj.kanban_stage)}
                  hoverActionText="Open Details →"
                  onClick={() => onOpenProject(proj)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-border-strong">
              <p className="text-sm font-semibold text-text-primary mb-1">No matching projects found</p>
              <p className="text-xs text-text-secondary mb-4">
                No projects matched &ldquo;{searchTerm}&rdquo;. Try another search term or reset filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStageFilter('all');
                }}
              >
                Clear Search
              </Button>
            </Card>
          )}
        </>
      )}

      {/* VIEW MODE 2: COMPACT KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {stages.map((stage) => {
            const stageProjects = filteredProjects.filter(p => {
              if (stage.name === 'Discovery') return p.kanban_stage === 'Discovery' || !p.kanban_stage;
              if (stage.name === 'Quoting') return p.kanban_stage === 'Quoting' || p.kanban_stage === 'Negotiation';
              if (stage.name === 'Production Order') return p.kanban_stage === 'Production Order' || p.kanban_stage === 'In Production';
              if (stage.name === 'Completed') return p.kanban_stage === 'Completed' || p.kanban_stage === 'Closed';
              return false;
            });

            return (
              <div key={stage.name} className="bg-bg-secondary/70 p-3 rounded-xl border border-border-strong/70 shadow-xs flex flex-col min-w-0 max-h-[750px]">
                <div className="flex justify-between items-center mb-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary truncate pr-1">
                    {stage.label}
                  </h3>
                  <Badge variant="neutral">{stageProjects.length}</Badge>
                </div>

                <div className="space-y-2 min-w-0 overflow-y-auto pr-0.5">
                  {stageProjects.map((proj) => (
                    <EntityCard
                      key={proj.id}
                      compact
                      category={proj.final_product_type || proj.request_type || 'Packaging'}
                      title={proj.project_name}
                      subtitle={proj.client?.company_name || proj.clients?.company_name || proj.client_name || 'Client Record'}
                      specPrimary={
                        proj.formulation ? (
                          <>
                            <strong className="text-text-primary font-medium">{proj.material_family}</strong> • {proj.formulation}
                          </>
                        ) : 'Standard Packaging'
                      }
                      specSecondary={
                        proj.print_type === 'printed' ? `${proj.printing_spec?.num_colors || 1} Colors` : 'Plain'
                      }
                      salespersonName={proj.assigned_salesperson || proj.salesperson || 'Alex L.'}
                      statusLabel={proj.technical_assessment?.status || proj.request_status || proj.kanban_stage || 'Active'}
                      statusVariant={getStageVariant(proj.kanban_stage)}
                      hoverActionText="Open Details →"
                      onClick={() => onOpenProject(proj)}
                    />
                  ))}

                  {stageProjects.length === 0 && (
                    <div className="border border-dashed border-border-subtle rounded-lg p-4 text-center text-xs text-text-muted">
                      No projects in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClientsView({
  brand,
  clients,
  currentUser,
  onAddNewClient,
  onAddClientRequest,
  onSelectClient,
}: {
  brand: string;
  clients: Client[];
  currentUser: AppUser;
  onAddNewClient: () => void;
  onAddClientRequest: () => void;
  onSelectClient: (client: Client) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const isAdmin = currentUser.role === 'admin';
  const visibleClients = clients.filter(c =>
    isAdmin || (c as any).assigned_salesperson === currentUser.name || (c as any).salesperson === currentUser.name
  );

  const filteredClients = visibleClients.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || (
      c.company_name?.toLowerCase().includes(q) ||
      c.contact_name?.toLowerCase().includes(q) ||
      c.contact_email?.toLowerCase().includes(q) ||
      c.contact_phone?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.location_type?.toLowerCase().includes(q) ||
      (c as any).assigned_salesperson?.toLowerCase().includes(q) ||
      (c as any).notes?.toLowerCase().includes(q)
    );

    if (!matchesSearch) return false;

    if (activeFilter === 'key') {
      return (c as any).account_tier === 'Key Account' || (c as any).account_tier === 'VIP';
    }
    if (activeFilter === 'regular') {
      return (c as any).account_tier === 'Regular' || !(c as any).account_tier;
    }
    return true;
  });

  const keyCount = visibleClients.filter(c => (c as any).account_tier === 'Key Account' || (c as any).account_tier === 'VIP').length;
  const regularCount = visibleClients.filter(c => (c as any).account_tier === 'Regular' || !(c as any).account_tier).length;

  const filterOptions: FilterOption[] = [
    { id: 'all', label: 'All Accounts', count: visibleClients.length },
    { id: 'key', label: 'Key Accounts / VIP', count: keyCount },
    { id: 'regular', label: 'Standard Accounts', count: regularCount },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        eyebrow={isAdmin ? 'Enterprise CRM & Accounts Directory' : 'Assigned Customer Portfolio'}
        badgeText={isAdmin ? `${filteredClients.length} of ${visibleClients.length} Accounts` : `${filteredClients.length} Assigned to ${currentUser.name}`}
        badgeVariant={isAdmin ? 'neutral' : 'brand'}
        title="Client Directory & Accounts"
        actions={
          <>
            <Button variant="outline" onClick={onAddNewClient}>
              <Building2 className="w-4 h-4 mr-2" /> Add New Client
            </Button>
            <Button onClick={onAddClientRequest}>
              <Plus className="w-4 h-4 mr-2" /> Add Client Request
            </Button>
          </>
        }
      />

      {/* SEARCH AND FILTER TOOLBAR */}
      <FilterToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search clients by company name, contact person, phone, email, or sector..."
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(c => (
            <EntityCard
              key={c.id}
              category={c.industry || 'Packaging'}
              title={c.company_name}
              subtitle={c.contact_name ? `${c.contact_name} • ${c.contact_phone || c.contact_email || 'Contact'}` : (c.contact_phone || c.contact_email || 'Direct Account')}
              specPrimary={
                <>
                  <strong className="text-text-primary font-medium">{c.location_type || 'Local (Mauritius)'}</strong> • {c.account_tier || 'Client'}
                </>
              }
              specSecondary={`${(c as any).active_projects_count ?? 1} Projects`}
              salespersonName={(c as any).assigned_salesperson || (c as any).salesperson || 'Alex L.'}
              statusLabel={c.account_tier || 'Active Account'}
              statusVariant={c.account_tier === 'Key Account' || c.account_tier === 'VIP' ? 'brand' : 'neutral'}
              hoverActionText="View 360° Profile →"
              onClick={() => onSelectClient(c)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center border-dashed border-border-strong">
          <p className="text-sm font-semibold text-text-primary mb-1">No matching clients found</p>
          <p className="text-xs text-text-secondary mb-4">
            No customer accounts matched &ldquo;{searchTerm}&rdquo;. Try another search term or clear filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
            }}
          >
            Clear Search
          </Button>
        </Card>
      )}
    </div>
  );
}

function SettingsView({ currentUser, onResetDemo }: { currentUser: AppUser; onResetDemo: () => void }) {
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-3xl">
      <PageHeader
        eyebrow="Configuration & ERP Control"
        title="System Settings"
      />

      {/* DEMO DATASET CONTROL CARD */}
      <Card className="p-6 space-y-4 border-l-4 border-l-brand-primary">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Client Presentation & Demonstration Dataset</h3>
            <p className="text-xs text-text-secondary mt-1">
              Active demo data includes 12 customers, 18 manufacturing projects, 12 quotations, 10 prepress designs, and 10 production jobs.
            </p>
          </div>
          <Badge variant="brand">Active Demo Dataset</Badge>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs border-t border-border-subtle">
          <span className="text-text-muted">Reset all demonstration records to pristine factory baseline state:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onResetDemo();
              setResetDone(true);
              setTimeout(() => setResetDone(false), 3000);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            {resetDone ? 'Demo Reset Complete!' : 'Reset Demo Records'}
          </Button>
        </div>
      </Card>

      <Card className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Active User Profile</h3>
          <p className="text-xs text-text-secondary mb-4">Current session identity and assigned security tier.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Full Name</label>
            <input
              type="text"
              readOnly
              value={currentUser.name}
              className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Role & Permission</label>
            <input
              type="text"
              readOnly
              value={currentUser.role === 'admin' ? 'Administrator (Full Enterprise Access)' : 'Sales Representative (Assigned Accounts Only)'}
              className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary font-medium"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
            <input
              type="email"
              readOnly
              value={currentUser.email}
              className="w-full bg-bg-secondary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
