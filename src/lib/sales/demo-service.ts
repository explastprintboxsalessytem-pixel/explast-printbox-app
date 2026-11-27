import {
  DemoCustomerProfile,
  DemoQuotation,
  DemoDesignProject,
  DemoProductionJob,
  DemoActivityEvent,
  DemoQuotationStatus,
  DemoDesignStatus,
  DemoProductionStage,
  WeeklySalesFollowUp,
  WeeklyFollowUpStatus,
} from '@/types/demo';
import {
  DEMO_CUSTOMERS,
  DEMO_PROJECTS,
  DEMO_QUOTATIONS,
  DEMO_DESIGN_PROJECTS,
  DEMO_PRODUCTION_JOBS,
  DEMO_ACTIVITIES,
  DEMO_WEEKLY_FOLLOWUPS,
} from './demo-data';

const STORAGE_KEYS = {
  CUSTOMERS: 'explast_demo_customers_v1',
  PROJECTS: 'explast_demo_projects_v1',
  QUOTATIONS: 'explast_demo_quotations_v1',
  DESIGNS: 'explast_demo_designs_v1',
  PRODUCTION: 'explast_demo_production_v1',
  ACTIVITIES: 'explast_demo_activities_v1',
  FOLLOWUPS: 'explast_demo_followups_v1',
  INITIALIZED: 'explast_demo_initialized_v1',
};

const memoryStore: Record<string, any> = {};

function getStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (memoryStore[key] !== undefined ? memoryStore[key] : fallback);
  } catch {
    return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
  }
}

function setStore<T>(key: string, value: T): void {
  memoryStore[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error in demo-service:', e);
  }
}

export const DemoService = {
  initialize(force = false): void {
    const isInitialized = getStore<boolean>(STORAGE_KEYS.INITIALIZED, false);
    const existingCustomers = getStore<any[]>(STORAGE_KEYS.CUSTOMERS, []);
    const existingFollowups = getStore<any[]>(STORAGE_KEYS.FOLLOWUPS, []);
    const isStale =
      !existingCustomers ||
      existingCustomers.length < DEMO_CUSTOMERS.length ||
      !existingFollowups ||
      existingFollowups.length < DEMO_WEEKLY_FOLLOWUPS.length;
    if (!isInitialized || force || isStale) {
      setStore(STORAGE_KEYS.CUSTOMERS, DEMO_CUSTOMERS);
      setStore(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
      setStore(STORAGE_KEYS.QUOTATIONS, DEMO_QUOTATIONS);
      setStore(STORAGE_KEYS.DESIGNS, DEMO_DESIGN_PROJECTS);
      setStore(STORAGE_KEYS.PRODUCTION, DEMO_PRODUCTION_JOBS);
      setStore(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITIES);
      setStore(STORAGE_KEYS.FOLLOWUPS, DEMO_WEEKLY_FOLLOWUPS);
      setStore(STORAGE_KEYS.INITIALIZED, true);
    }
  },

  resetDemoData(): void {
    this.initialize(true);
  },

  // Customers
  getCustomers(): DemoCustomerProfile[] {
    this.initialize();
    return getStore<DemoCustomerProfile[]>(STORAGE_KEYS.CUSTOMERS, DEMO_CUSTOMERS);
  },

  getCustomerById(id: string): DemoCustomerProfile | undefined {
    return this.getCustomers().find(c => c.id === id);
  },

  addCustomer(customerData: Partial<DemoCustomerProfile>): DemoCustomerProfile {
    this.initialize();
    const existing = this.getCustomers();
    const newId = `DEMO-CLI-${String(existing.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString().substring(0, 10);
    const newCustomer: DemoCustomerProfile = {
      id: newId,
      company_name: customerData.company_name || 'New Customer',
      industry: customerData.industry || 'Industrial',
      location_type: (customerData.location_type as any) || 'Local (Mauritius)',
      contact_name: customerData.contact_name || '',
      contact_email: customerData.contact_email || '',
      contact_phone: customerData.contact_phone || '',
      delivery_address: customerData.delivery_address || '',
      brn_number: customerData.brn_number || 'C2026' + Math.floor(1000 + Math.random() * 9000),
      vat_number: customerData.vat_number || 'VAT' + Math.floor(10000000 + Math.random() * 90000000),
      status: customerData.status || 'Client',
      account_tier: customerData.account_tier || 'Regular',
      assigned_salesperson: customerData.assigned_salesperson || 'Alex L.',
      credit_terms: customerData.credit_terms || '30 Days End of Month',
      total_revenue_mur: 0,
      active_projects_count: 0,
      customer_since: now,
      notes: customerData.notes || '',
      is_demo: true,
      relationship_timeline: [
        {
          date: now,
          milestone: 'Direct Client Registration',
          details: `Directly registered into accounts directory by ${customerData.assigned_salesperson || 'Sales Representative'}.`,
        },
      ],
    };

    const updated = [newCustomer, ...existing];
    setStore(STORAGE_KEYS.CUSTOMERS, updated);

    // Add activity event
    const activities = this.getActivities();
    const newAct: DemoActivityEvent = {
      id: `DEMO-ACT-${Date.now()}`,
      timestamp: 'Just now',
      event_type: 'customer',
      title: `Client Account Created: ${newCustomer.company_name}`,
      description: `Added to CRM directory by ${newCustomer.assigned_salesperson}.`,
      actor: newCustomer.assigned_salesperson,
      entity_id: newId,
      severity: 'success',
    };
    setStore(STORAGE_KEYS.ACTIVITIES, [newAct, ...activities]);

    return newCustomer;
  },

  // Projects
  getProjects(): any[] {
    this.initialize();
    const rawProjects = getStore<any[]>(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
    const customers = this.getCustomers();
    const custMap = new Map(customers.map(c => [c.id, c]));

    return rawProjects.map(p => {
      const cust = custMap.get(p.client_id);
      const companyName = cust?.company_name || p.client_name || p.client?.company_name || 'Client Record';
      const assignedRep = cust?.assigned_salesperson || p.assigned_salesperson || p.salesperson || 'Alex L.';
      return {
        ...p,
        client_name: companyName,
        assigned_salesperson: assignedRep,
        salesperson: assignedRep,
        client: cust ? { ...cust, company_name: companyName } : (p.client || { company_name: companyName }),
        clients: { company_name: companyName },
      };
    });
  },

  getProjectById(id: string): any | undefined {
    return this.getProjects().find(p => p.id === id);
  },

  // Quotations
  getQuotations(): DemoQuotation[] {
    this.initialize();
    return getStore<DemoQuotation[]>(STORAGE_KEYS.QUOTATIONS, DEMO_QUOTATIONS);
  },

  getQuotationById(id: string): DemoQuotation | undefined {
    return this.getQuotations().find(q => q.id === id);
  },

  updateQuotationStatus(
    id: string,
    newStatus: DemoQuotationStatus,
    actor = 'Alex L.',
    notes = ''
  ): void {
    const quotes = this.getQuotations();
    let targetQuote: DemoQuotation | undefined;

    const updated = quotes.map(q => {
      if (q.id === id) {
        targetQuote = q;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const actionLabel =
          newStatus === 'admin_approved'
            ? 'Pricing & Margins Approved by Management'
            : newStatus === 'pending_approval'
            ? 'Submitted for Internal Admin Approval'
            : newStatus === 'sent'
            ? 'Official Quotation Sent to Client'
            : newStatus === 'accepted'
            ? 'Quotation Accepted by Client (Order Confirmed)'
            : newStatus === 'revised'
            ? 'Pricing Revision Requested'
            : `Status Changed to ${newStatus.replace('_', ' ').toUpperCase()}`;

        const updatedQuote: DemoQuotation = {
          ...q,
          status: newStatus,
          admin_approval:
            newStatus === 'admin_approved'
              ? {
                  approved_by: actor,
                  approved_at: now,
                  notes: notes || 'Pricing structure and target profit margins verified.',
                }
              : q.admin_approval,
          history: [
            {
              date: now,
              action: actionLabel,
              actor: actor,
              notes: notes || (newStatus === 'accepted' ? 'Order confirmed by client. Automated production release triggered.' : undefined),
            },
            ...q.history,
          ],
        };
        return updatedQuote;
      }
      return q;
    });

    setStore(STORAGE_KEYS.QUOTATIONS, updated);

    // Automated Production Release on Client Acceptance (Requirement 2 & 6)
    if (newStatus === 'accepted' && targetQuote) {
      const q = targetQuote;
      const existingJobs = this.getProductionJobs();
      const alreadyReleased = existingJobs.some(
        j => j.quotation_id === q.id || (j.project_id === q.project_id && j.is_demo)
      );

      if (!alreadyReleased) {
        const firstItem = q.items[0];
        const newJob: DemoProductionJob = {
          id: `DEMO-PROD-${Date.now()}`,
          job_reference: `JOB-EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
          project_id: q.project_id,
          project_name: q.project_name,
          quotation_id: q.id,
          client_id: q.client_id,
          client_name: q.client_name,
          product_type: firstItem?.final_product_type || 'Side Sealing Bag',
          material_family: firstItem?.material_family || 'LDPE',
          material_grade: firstItem?.material_grade,
          formulation: firstItem?.formulation || 'Grade 2 + Linear',
          dimensions_summary: firstItem?.dimensions_summary || 'Standard Dimensions',
          thickness_micron: firstItem?.thickness_micron || 40,
          is_printed: firstItem?.print_type === 'printed',
          num_colors: firstItem?.num_colors || 0,
          required_quantity: firstItem?.quantity || 50000,
          quantity_unit: firstItem?.quantity_unit || 'units',
          produced_quantity: 0,
          assigned_team: 'Extrusion Line 1 (Sunil / Team A)',
          extrusion_line: 'Extruder #1 (Windmöller & Hölscher)',
          printing_press: firstItem?.print_type === 'printed' ? 'Flexo 8-Color Stack Press' : undefined,
          conversion_line: 'Automatic Side Sealer Line 1',
          planned_start_date: new Date().toISOString().substring(0, 10),
          target_completion_date: new Date(Date.now() + 14 * 86400000).toISOString().substring(0, 10),
          current_stage: 'scheduled',
          progress_percent: 5,
          priority: 'normal',
          qc_status: 'pending',
          is_demo: true,
          stages_completed: ['scheduled'],
          internal_notes: `Auto-dispatched immediately upon client acceptance of Quotation ${q.quotation_number}.`,
        };

        setStore(STORAGE_KEYS.PRODUCTION, [newJob, ...existingJobs]);
      }

      // Update linked project's kanban stage to 'Production Order'
      const rawProjects = getStore<any[]>(STORAGE_KEYS.PROJECTS, DEMO_PROJECTS);
      const updatedProjects = rawProjects.map(proj => {
        if (proj.id === q.project_id) {
          return {
            ...proj,
            kanban_stage: 'Production Order',
            request_status: 'approved',
          };
        }
        return proj;
      });
      setStore(STORAGE_KEYS.PROJECTS, updatedProjects);

      // Add timeline activity
      const activities = this.getActivities();
      const orderAct: DemoActivityEvent = {
        id: `DEMO-ACT-${Date.now()}`,
        timestamp: 'Just now',
        event_type: 'production',
        title: `Auto Production Dispatch: ${q.project_name}`,
        description: `Quotation ${q.quotation_number} accepted by client. Production order auto-scheduled on plant floor.`,
        actor: actor,
        entity_id: q.id,
        severity: 'success',
      };
      setStore(STORAGE_KEYS.ACTIVITIES, [orderAct, ...activities]);
    }
  },

  // Design Projects
  getDesignProjects(): DemoDesignProject[] {
    this.initialize();
    return getStore<DemoDesignProject[]>(STORAGE_KEYS.DESIGNS, DEMO_DESIGN_PROJECTS);
  },

  getDesignById(id: string): DemoDesignProject | undefined {
    return this.getDesignProjects().find(d => d.id === id);
  },

  updateDesignStatus(id: string, newStatus: DemoDesignStatus): void {
    const designs = this.getDesignProjects();
    const updated = designs.map(d => {
      if (d.id === id) {
        const now = new Date().toISOString().substring(0, 10);
        return {
          ...d,
          status: newStatus,
          revisions: [
            {
              version: d.version + 1,
              date: now,
              author: 'Alex L.',
              comment: `Workflow stage updated to ${newStatus.replace('_', ' ')} during presentation.`,
              status: newStatus.replace('_', ' ').toUpperCase(),
            },
            ...d.revisions,
          ],
        };
      }
      return d;
    });
    setStore(STORAGE_KEYS.DESIGNS, updated);
  },

  // Production Jobs
  getProductionJobs(): DemoProductionJob[] {
    this.initialize();
    return getStore<DemoProductionJob[]>(STORAGE_KEYS.PRODUCTION, DEMO_PRODUCTION_JOBS);
  },

  getProductionJobById(id: string): DemoProductionJob | undefined {
    return this.getProductionJobs().find(p => p.id === id);
  },

  updateProductionStage(id: string, newStage: DemoProductionStage): void {
    const jobs = this.getProductionJobs();
    const updated = jobs.map(j => {
      if (j.id === id) {
        const isComplete = newStage === 'completed';
        return {
          ...j,
          current_stage: newStage,
          progress_percent: isComplete ? 100 : Math.min(j.progress_percent + 20, 95),
          stages_completed: Array.from(new Set([...j.stages_completed, newStage])),
        };
      }
      return j;
    });
    setStore(STORAGE_KEYS.PRODUCTION, updated);
  },

  // Activities
  getActivities(): DemoActivityEvent[] {
    this.initialize();
    return getStore<DemoActivityEvent[]>(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITIES);
  },

  // Customer 360 Ecosystem
  getCustomerRelationship(customerId: string) {
    const customer = this.getCustomerById(customerId);
    const projects = this.getProjects().filter(p => p.client_id === customerId);
    const quotations = this.getQuotations().filter(q => q.client_id === customerId);
    const designs = this.getDesignProjects().filter(d => d.client_id === customerId);
    const productionJobs = this.getProductionJobs().filter(p => p.client_id === customerId);

    return {
      customer,
      projects,
      quotations,
      designs,
      productionJobs,
    };
  },

  // Comprehensive Analytics Engine with Role, Salesperson, Brand & Period Scoping
  getAnalyticsMetrics(
    salespersonOrOptions?: string | { salespersonName?: string; period?: string; brand?: string },
    periodOption?: string,
    brandFilter?: string
  ) {
    let salespersonName: string | undefined;
    let period: string = 'ytd';
    let brand: string = 'Explast';

    if (typeof salespersonOrOptions === 'object' && salespersonOrOptions !== null) {
      salespersonName = salespersonOrOptions.salespersonName;
      period = salespersonOrOptions.period || 'ytd';
      brand = salespersonOrOptions.brand || 'Explast';
    } else {
      salespersonName = salespersonOrOptions;
      period = periodOption || 'ytd';
      brand = brandFilter || 'Explast';
    }

    const isScoped = Boolean(salespersonName && salespersonName !== 'all');
    let projects = this.getProjects();
    let quotations = this.getQuotations();
    let customers = this.getCustomers();
    let productionJobs = this.getProductionJobs();

    // Brand filter (if not global)
    if (brand && brand !== 'Global View') {
      projects = projects.filter(p => !p.brand || p.brand === brand || p.business_unit === brand);
    }

    if (isScoped && salespersonName) {
      customers = customers.filter(c => c.assigned_salesperson === salespersonName);
      projects = projects.filter(
        p => p.assigned_salesperson === salespersonName || p.salesperson === salespersonName
      );
      quotations = quotations.filter(q => q.salesperson === salespersonName);
      productionJobs = productionJobs.filter(
        j =>
          projects.some(p => p.id === j.project_id) ||
          quotations.some(q => q.id === j.quotation_id)
      );
    }

    // Period multiplier adjustments for realistic period filtering
    const periodMultipliers: Record<string, number> = {
      'month': 0.35,
      '30d': 0.35,
      'last_month': 0.30,
      '3months': 0.70,
      '90d': 0.70,
      'ytd': 1.0,
      'custom': 1.0,
    };
    const mult = periodMultipliers[period] || 1.0;

    const comparisonSuffix = period === 'month'
      ? 'compared with last month'
      : period === 'last_month'
      ? 'compared with prior month'
      : period === '3months' || period === '90d'
      ? 'compared with previous 3 months'
      : 'compared with previous period';

    // 1. Sales Performance
    const totalRequests = Math.max(1, Math.round(projects.length * (period === 'month' ? 0.45 : period === '3months' ? 0.75 : 1.0)));
    const totalQuotationsCount = Math.max(1, Math.round(quotations.length * mult));
    const baseQuotationValue = quotations.reduce((acc, q) => acc + q.total_mur, 0);
    const totalQuotationValue = Math.round(baseQuotationValue * mult);
    const acceptedQuotations = quotations.filter(q => q.status === 'accepted');
    const acceptedCount = Math.max(1, Math.round(acceptedQuotations.length * mult));
    const acceptedQuotationValue = Math.round(acceptedQuotations.reduce((acc, q) => acc + q.total_mur, 0) * mult);
    const conversionRate = totalQuotationsCount > 0 ? Math.round((acceptedCount / totalQuotationsCount) * 100) : 67;
    const pendingQuotations = quotations.filter(
      q => q.status === 'sent' || q.status === 'awaiting_response' || q.status === 'pending_approval' || q.status === 'admin_approved'
    );
    const pendingCount = Math.max(1, Math.round(pendingQuotations.length * mult));
    const pendingQuotationValue = Math.round(pendingQuotations.reduce((acc, q) => acc + q.total_mur, 0) * mult);

    const rejectedQuotations = quotations.filter(q => q.status === 'rejected' || q.status === 'expired');
    const rejectedCount = Math.max(1, Math.round(rejectedQuotations.length * mult));
    const rejectedQuotationValue = Math.round(rejectedQuotations.reduce((acc, q) => acc + q.total_mur, 0) * mult) || Math.round(totalQuotationValue * 0.12);

    // 2. Customer Breakdown
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.active_projects_count > 0 || c.total_revenue_mur > 0).length;
    const industryCounts: Record<string, number> = {};
    customers.forEach(c => {
      const ind = c.industry || 'Other';
      industryCounts[ind] = (industryCounts[ind] || 0) + 1;
    });

    // Top 5 Clients by Value
    const sortedCustomers = [...customers].sort(
      (a, b) => (b.total_revenue_mur || 0) - (a.total_revenue_mur || 0)
    );
    const topRevenueSum = sortedCustomers.slice(0, 5).reduce((acc, c) => acc + (c.total_revenue_mur || 0), 0) || 1;
    const topClients = sortedCustomers.slice(0, 5).map(c => ({
      id: c.id,
      name: c.company_name,
      industry: c.industry || 'Packaging',
      valueMur: Math.round(c.total_revenue_mur * mult) || 350000,
      percentage: Math.min(100, Math.round((c.total_revenue_mur / topRevenueSum) * 100)),
      activeProjects: c.active_projects_count || 1,
    }));

    // 3. Materials Breakdown (Explast vs PrintBox)
    const materialCounts: Record<string, number> = { LDPE: 0, MDPE: 0, PP: 0 };
    const printCounts: Record<string, number> = { plain: 0, printed: 0 };
    const productTypeCounts: Record<string, number> = {
      'Side Sealing Bag': 0,
      'Bottom Sealing Bag': 0,
      'Bag with Sealing Tape': 0,
      'Roll': 0,
    };
    const colorDistribution: Record<string, number> = {
      'Plain (0 cols)': 0,
      '1 - 2 Colours': 0,
      '3 - 4 Colours': 0,
      '5+ Colours (High Definition)': 0,
    };

    projects.forEach(p => {
      if (p.material_family && materialCounts[p.material_family] !== undefined) {
        materialCounts[p.material_family]++;
      }
      if (p.print_type === 'printed') {
        printCounts.printed++;
        const cols = p.printing_spec?.num_colors || 1;
        if (cols <= 2) colorDistribution['1 - 2 Colours']++;
        else if (cols <= 4) colorDistribution['3 - 4 Colours']++;
        else colorDistribution['5+ Colours (High Definition)']++;
      } else {
        printCounts.plain++;
        colorDistribution['Plain (0 cols)']++;
      }
      if (p.final_product_type && productTypeCounts[p.final_product_type] !== undefined) {
        productTypeCounts[p.final_product_type]++;
      }
    });

    // PrintBox Paper Categories & Colors
    const printboxPaperCounts: Record<string, number> = {
      'Kraft Board (Recycled)': Math.round(projects.length * 0.42),
      'Corrugated Fluting (E/B Flute)': Math.round(projects.length * 0.28),
      'Bleached Food-Grade Board': Math.round(projects.length * 0.18),
      'Rigid Luxury Boxboard': Math.max(1, Math.round(projects.length * 0.12)),
    };
    const printboxColorDistribution: Record<string, number> = {
      '1 Colour (Monochrome)': Math.round(projects.length * 0.22),
      '2 - 3 Spot Pantone': Math.round(projects.length * 0.38),
      '4 Colour Process (CMYK)': Math.round(projects.length * 0.30),
      '5+ Colours & Foil / Varnish': Math.round(projects.length * 0.10),
    };

    // 4. Production Throughput
    const totalJobs = productionJobs.length;
    const activeJobs = productionJobs.filter(j => j.current_stage !== 'completed');
    const completedJobs = productionJobs.filter(j => j.current_stage === 'completed');
    const jobsByStage: Record<string, number> = {
      scheduled: 0,
      awaiting_material: 0,
      extrusion: 0,
      printing: 0,
      conversion: 0,
      quality_control: 0,
    };
    productionJobs.forEach(j => {
      if (jobsByStage[j.current_stage] !== undefined) {
        jobsByStage[j.current_stage]++;
      }
    });

    const jobsByStagePrintbox: Record<string, number> = {
      'Pre-flight': Math.max(1, Math.round(totalJobs * 0.15)),
      'Stock Cut': Math.max(1, Math.round(totalJobs * 0.20)),
      'Offset Press': Math.max(2, Math.round(totalJobs * 0.30)),
      'Die-Cutting': Math.max(1, Math.round(totalJobs * 0.20)),
      'Folding / Gluing': Math.max(1, Math.round(totalJobs * 0.10)),
      'QC & Packaging': Math.max(1, Math.round(totalJobs * 0.05)),
    };

    // 5. Sales Rep Comparison
    const salesRepsRecord: Record<string, { requests: number; quotes: number; acceptedValue: number; wonCount: number }> = {
      'Alex L.': { requests: 8, quotes: 10, acceptedValue: 1485000, wonCount: 7 },
      'Sunil R.': { requests: 6, quotes: 8, acceptedValue: 980000, wonCount: 5 },
      'Sarah M.': { requests: 5, quotes: 7, acceptedValue: 840000, wonCount: 4 },
    };

    const allQuotesForComparison = this.getQuotations();
    allQuotesForComparison.forEach(q => {
      const rep = q.salesperson || 'Alex L.';
      if (!salesRepsRecord[rep]) {
        salesRepsRecord[rep] = { requests: 4, quotes: 0, acceptedValue: 0, wonCount: 0 };
      }
      salesRepsRecord[rep].quotes++;
      if (q.status === 'accepted') {
        salesRepsRecord[rep].acceptedValue += q.total_mur;
        salesRepsRecord[rep].wonCount++;
      }
    });

    const salesRepsList = Object.entries(salesRepsRecord).map(([name, repData]) => {
      const winRate = repData.quotes > 0 ? Math.round((repData.wonCount / repData.quotes) * 100) : 65;
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      return {
        name,
        avatar: initials,
        quotedValue: Math.round(repData.acceptedValue * 1.45),
        acceptedValue: repData.acceptedValue,
        quotesCount: repData.quotes,
        wonCount: repData.wonCount,
        winRate,
      };
    });

    // 6. Pipeline Workflow Stage Counts for Donut Chart
    const stageCounts: Record<string, number> = {
      'Discovery & Enquiry': 0,
      'Commercial Quoting': 0,
      'Prepress & Artwork': 0,
      'Production Order': 0,
      'Closed & Completed': 0,
    };

    projects.forEach(p => {
      const stage = p.kanban_stage || p.request_status;
      if (stage === 'Completed' || stage === 'Closed') stageCounts['Closed & Completed']++;
      else if (stage === 'Production Order' || stage === 'In Production') stageCounts['Production Order']++;
      else if (stage === 'Quoting' || stage === 'Negotiation') stageCounts['Commercial Quoting']++;
      else if (stage === 'Design' || stage === 'Artwork') stageCounts['Prepress & Artwork']++;
      else stageCounts['Discovery & Enquiry']++;
    });

    const pipelineStages = [
      { label: 'Discovery & Enquiry', count: stageCounts['Discovery & Enquiry'] || 4, color: '#119A94', stageKey: 'Discovery' },
      { label: 'Commercial Quoting', count: stageCounts['Commercial Quoting'] || 5, color: '#C28A35', stageKey: 'Quoting' },
      { label: 'Prepress & Artwork', count: stageCounts['Prepress & Artwork'] || 3, color: '#6E4A9E', stageKey: 'Design' },
      { label: 'Production Order', count: stageCounts['Production Order'] || 4, color: '#0F625F', stageKey: 'Production Order' },
      { label: 'Closed & Completed', count: stageCounts['Closed & Completed'] || 3, color: '#4F8F68', stageKey: 'Completed' },
    ];

    // 7. Monthly Sales Trend (6-month interactive timeline)
    const monthlySalesTrend = [
      { label: 'Oct', quotedValue: 1850000, signedRevenue: 1150000, previousPeriod: 1400000 },
      { label: 'Nov', quotedValue: 2200000, signedRevenue: 1420000, previousPeriod: 1750000 },
      { label: 'Dec', quotedValue: 2750000, signedRevenue: 1890000, previousPeriod: 2100000 },
      { label: 'Jan', quotedValue: 3100000, signedRevenue: 2150000, previousPeriod: 2450000 },
      { label: 'Feb', quotedValue: 3450000, signedRevenue: 2420000, previousPeriod: 2800000 },
      { label: 'Mar', quotedValue: totalQuotationValue || 3840000, signedRevenue: acceptedQuotationValue || 2650000, previousPeriod: 3150000 },
    ];

    // 8. Conversion Funnel Stages
    const conversionFunnel = [
      { label: 'Sales Enquiries & Requests', count: totalRequests || 22, valueMur: Math.round(totalQuotationValue * 1.25), color: '#119A94' },
      { label: 'Quotations Created & Costed', count: totalQuotationsCount || 19, valueMur: totalQuotationValue, color: '#0E7E7A' },
      { label: 'Quotations Sent to Customer', count: Math.max(1, Math.round((totalQuotationsCount || 19) * 0.85)), valueMur: Math.round(totalQuotationValue * 0.85), color: '#6E4A9E' },
      { label: 'Quotations Accepted (PO Won)', count: acceptedCount || 12, valueMur: acceptedQuotationValue, color: '#553780' },
      { label: 'Production Orders Released', count: Math.max(1, Math.round((acceptedCount || 12) * 0.85)), valueMur: Math.round(acceptedQuotationValue * 0.85), color: '#4F8F68' },
    ];

    // 9. Dynamic Business Insights
    const topMaterial = Object.entries(materialCounts).sort((a, b) => b[1] - a[1])[0] || ['LDPE', 8];
    const topRep = salesRepsList[0] || { name: 'Alex L.', acceptedValue: 1485000 };
    const businessInsights = [
      {
        type: 'highlight' as const,
        title: `${topMaterial[0]} Formulation Leadership`,
        desc: `${topMaterial[0]} represents the predominant polymer demand, making up ${Math.round((topMaterial[1] / (projects.length || 1)) * 100)}% of total extrusion batches.`,
        metric: `${Math.round((topMaterial[1] / (projects.length || 1)) * 100)}% Volume`,
      },
      {
        type: 'trend' as const,
        title: `Commercial Conversion Velocity`,
        desc: `Overall Win Rate is performing strong at ${conversionRate}%, representing Rs ${(acceptedQuotationValue / 1000000).toFixed(2)}M in confirmed production orders.`,
        metric: `${conversionRate}% Win Rate`,
      },
      {
        type: 'highlight' as const,
        title: `Top Commercial Performer`,
        desc: `${topRep.name} generated the highest closed revenue with Rs ${(topRep.acceptedValue / 1000).toFixed(0)}k signed across regular client accounts.`,
        metric: `Rs ${(topRep.acceptedValue / 1000).toFixed(0)}k`,
      },
      {
        type: 'alert' as const,
        title: `Prepress Tooling Turnaround`,
        desc: `Flexographic cylinder approvals average 3.2 days from brief receipt, ensuring extrusion lines run on schedule without tooling delay.`,
        metric: '3.2 Days Avg',
      },
    ];

    return {
      isScoped,
      scopedSalesperson: salespersonName,
      activePeriod: period,
      activeBrand: brand,
      sales: {
        totalRequests,
        totalQuotationsCount,
        totalQuotationValue,
        quotedSparkline: [1850, 2100, 2600, 3100, 3450, Math.round(totalQuotationValue / 1000)],
        quotedVariation: { percent: 12, isPositive: true, comparisonText: `+12% ${comparisonSuffix}` },
        acceptedQuotationValue,
        acceptedCount,
        revenueSparkline: [950, 1250, 1600, 1950, 2200, Math.round(acceptedQuotationValue / 1000)],
        revenueVariation: { percent: 16, isPositive: true, comparisonText: `+16% ${comparisonSuffix}` },
        conversionRate,
        conversionVariation: { percent: 4, isPositive: true, comparisonText: `+4% ${comparisonSuffix}` },
        activeProjectsVariation: { percent: 8, isPositive: true, comparisonText: `+8% ${comparisonSuffix}` },
        pendingQuotationValue,
        pendingCount,
        rejectedCount,
        rejectedQuotationValue,
      },
      customers: {
        totalCustomers,
        activeCustomers,
        industryCounts,
      },
      products: {
        materialCounts,
        printCounts,
        productTypeCounts,
        colorDistribution,
        printboxPaperCounts,
        printboxColorDistribution,
      },
      production: {
        totalJobs,
        activeJobsCount: activeJobs.length,
        activeJobsVariation: { percent: 6, isPositive: true, comparisonText: `+6% ${comparisonSuffix}` },
        completedJobsCount: completedJobs.length,
        completedJobsText: `${completedJobs.length} completed ${period === 'month' ? 'this month' : 'this period'}`,
        jobsByStage,
        jobsByStagePrintbox,
      },
      monthlySalesTrend,
      pipelineStages,
      conversionFunnel,
      topClients,
      salesReps: salesRepsRecord,
      salesRepsList,
      businessInsights,
    };
  },

  // ==========================================================================
  // Weekly Sales Work & Customer Follow-Up Tracking (12-Point Template Engine)
  // ==========================================================================
  getWeeklyFollowUps(): WeeklySalesFollowUp[] {
    this.initialize();
    return getStore<WeeklySalesFollowUp[]>(STORAGE_KEYS.FOLLOWUPS, DEMO_WEEKLY_FOLLOWUPS);
  },

  getWeeklyFollowUpById(id: string): WeeklySalesFollowUp | undefined {
    return this.getWeeklyFollowUps().find(f => f.id === id);
  },

  addWeeklyFollowUp(data: Omit<WeeklySalesFollowUp, 'id' | 'created_at'>): WeeklySalesFollowUp {
    const list = this.getWeeklyFollowUps();
    const newEntry: WeeklySalesFollowUp = {
      ...data,
      id: `WFU-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...list];
    setStore(STORAGE_KEYS.FOLLOWUPS, updated);
    return newEntry;
  },

  updateWeeklyFollowUpStatus(id: string, status: WeeklyFollowUpStatus): void {
    const list = this.getWeeklyFollowUps();
    const updated = list.map(item => (item.id === id ? { ...item, status } : item));
    setStore(STORAGE_KEYS.FOLLOWUPS, updated);
  },

  deleteWeeklyFollowUp(id: string): void {
    const list = this.getWeeklyFollowUps();
    const updated = list.filter(item => item.id !== id);
    setStore(STORAGE_KEYS.FOLLOWUPS, updated);
  },

  getWeeklyWorkSummary(params?: { weekNumber?: number; salesperson?: string; brand?: string }) {
    let items = this.getWeeklyFollowUps();

    if (params?.weekNumber) {
      items = items.filter(f => f.week_number === params.weekNumber);
    }
    if (params?.salesperson && params.salesperson !== 'all') {
      items = items.filter(f => f.salesperson === params.salesperson);
    }
    if (params?.brand && params.brand !== 'Global View' && params.brand !== 'all') {
      items = items.filter(f => f.brand === params.brand);
    }

    const totalVisits = items.length;
    const samplesDelivered = items.filter(f => f.status === 'sample_given').length;
    const hotLeads = items.filter(f => f.status === 'hot_lead').length;
    const quotesIssued = items.filter(f => f.status === 'quoted').length;
    const converted = items.filter(f => f.status === 'converted').length;
    const totalPotentialSales = items.reduce((sum, f) => sum + (f.potential_sales_mur || 0), 0);

    return {
      items,
      totalVisits,
      samplesDelivered,
      hotLeads,
      quotesIssued,
      converted,
      totalPotentialSales,
    };
  },
};
