import { Client } from './sales';
import {
  ExplastMaterialFamily,
  ExplastMaterialGrade,
  ExplastFormulation,
  ExplastPrintType,
  ExplastFinalProductType,
} from './explast';

export type UserRole = 'sales' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  avatar: string;
  email: string;
}

export const APP_USERS: AppUser[] = [
  {
    id: 'usr-alex',
    name: 'Alex L.',
    role: 'sales',
    title: 'Senior Technical Sales Rep',
    avatar: 'AL',
    email: 'alex@explast.mu',
  },
  {
    id: 'usr-sunil',
    name: 'Sunil R.',
    role: 'sales',
    title: 'Key Accounts Commercial Rep',
    avatar: 'SR',
    email: 'sunil@explast.mu',
  },
  {
    id: 'usr-sarah',
    name: 'Sarah M.',
    role: 'sales',
    title: 'Packaging Solutions Specialist',
    avatar: 'SM',
    email: 'sarah@explast.mu',
  },
  {
    id: 'usr-david',
    name: 'David T.',
    role: 'sales',
    title: 'Food Packaging Specialist',
    avatar: 'DT',
    email: 'david@printbox.mu',
  },
  {
    id: 'usr-admin',
    name: 'Administrator',
    role: 'admin',
    title: 'Managing Director & Plant Oversight',
    avatar: 'AD',
    email: 'admin@explast.mu',
  },
];

export type DemoQuotationStatus =
  | 'draft'
  | 'pending_approval'
  | 'admin_approved'
  | 'sent'
  | 'awaiting_response'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'revised';

export interface DemoQuotationItem {
  id: string;
  description: string;
  material_family: ExplastMaterialFamily;
  material_grade?: ExplastMaterialGrade;
  formulation: ExplastFormulation;
  final_product_type: ExplastFinalProductType;
  dimensions_summary: string;
  thickness_micron: number;
  print_type: ExplastPrintType;
  num_colors: number;
  quantity: number;
  quantity_unit: 'units' | 'kg' | 'rolls';
  unit_price_mur: number;
  subtotal_mur: number;
  tooling_stereos_fee_mur: number;
}

export interface DemoQuotation {
  id: string; // e.g. DEMO-QUO-2026-001
  quotation_number: string;
  version: number;
  project_id: string;
  project_name: string;
  client_id: string;
  client_name: string;
  contact_name: string;
  contact_email: string;
  salesperson: string;
  status: DemoQuotationStatus;
  created_at: string;
  valid_until: string;
  currency: 'MUR';
  items: DemoQuotationItem[];
  subtotal_mur: number;
  tooling_charges_mur: number;
  tax_rate_percent: number; // 15% VAT
  tax_mur: number;
  total_mur: number;
  margin_percent?: number;
  admin_approval?: {
    approved_by: string;
    approved_at: string;
    notes?: string;
  };
  payment_terms: string;
  delivery_terms: string;
  estimated_lead_time_days: number;
  internal_notes?: string;
  brand?: 'Explast' | 'PrintBox';
  contact_phone?: string;
  bank_name?: string;
  bank_account_number?: string;
  is_demo: true;
  history: {
    date: string;
    action: string;
    actor: string;
    notes?: string;
  }[];
}

export type DemoDesignStatus =
  | 'awaiting_artwork'
  | 'brief_received'
  | 'in_design'
  | 'internal_review'
  | 'awaiting_approval'
  | 'revision_requested'
  | 'approved'
  | 'ready_for_production';

export interface DemoDesignProject {
  id: string; // e.g. DEMO-DES-001
  design_reference: string;
  project_id: string;
  project_name: string;
  client_id: string;
  client_name: string;
  product_type: ExplastFinalProductType;
  material_family: ExplastMaterialFamily;
  formulation: ExplastFormulation;
  dimensions_summary: string;
  num_colors: number;
  color_names: string[];
  spot_colors_hex: string[];
  assigned_designer: string;
  status: DemoDesignStatus;
  version: number;
  created_at: string;
  updated_at: string;
  cylinder_repeat_mm: number;
  web_width_mm: number;
  plate_thickness_mm: number;
  artwork_type: 'carrier_bag' | 'bread_bag' | 'fertilizer_sack' | 'boutique_poly' | 'frozen_liner' | 'tamper_bag' | 'mulch_roll';
  artwork_title: string;
  artwork_notes?: string;
  is_demo: true;
  revisions: {
    version: number;
    date: string;
    author: string;
    comment: string;
    status: string;
  }[];
}

export type DemoProductionStage =
  | 'scheduled'
  | 'awaiting_material'
  | 'extrusion'
  | 'awaiting_printing'
  | 'printing'
  | 'conversion'
  | 'quality_control'
  | 'completed'
  | 'on_hold';

export interface DemoProductionJob {
  id: string; // e.g. DEMO-PROD-2026-001
  job_reference: string;
  project_id: string;
  project_name: string;
  quotation_id: string;
  client_id: string;
  client_name: string;
  product_type: ExplastFinalProductType;
  material_family: ExplastMaterialFamily;
  material_grade?: ExplastMaterialGrade;
  formulation: ExplastFormulation;
  dimensions_summary: string;
  thickness_micron: number;
  is_printed: boolean;
  num_colors: number;
  required_quantity: number;
  quantity_unit: 'units' | 'kg' | 'rolls';
  produced_quantity: number;
  assigned_team: string; // e.g. Extrusion Line 2 (Sunil / Team A)
  extrusion_line: string;
  printing_press?: string;
  conversion_line: string;
  planned_start_date: string;
  target_completion_date: string;
  current_stage: DemoProductionStage;
  progress_percent: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  qc_status: 'pending' | 'passed' | 'recheck';
  is_demo: true;
  stages_completed: string[];
  internal_notes?: string;
}

export interface DemoActivityEvent {
  id: string;
  timestamp: string;
  event_type: 'customer' | 'request' | 'quotation' | 'design' | 'production';
  title: string;
  description: string;
  actor: string;
  entity_id: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface DemoCustomerProfile extends Client {
  brn_number: string;
  vat_number: string;
  assigned_salesperson: string;
  credit_terms: string;
  total_revenue_mur: number;
  active_projects_count: number;
  account_tier: 'Key Account' | 'VIP' | 'Regular' | 'New Partner';
  customer_since: string;
  relationship_timeline: {
    date: string;
    milestone: string;
    details: string;
  }[];
  is_demo: true;
}

export type WeeklyFollowUpStatus =
  | 'hot_lead'
  | 'sample_given'
  | 'quoted'
  | 'in_negotiation'
  | 'converted'
  | 'cold';

export interface WeeklySalesFollowUp {
  id: string; // e.g. WFU-2026-001
  salesperson: string; // e.g. 'Alex L.'
  week_number: number; // e.g. 48
  week_label: string; // e.g. 'Week 48 (23 Nov - 29 Nov 2026)'
  visit_date: string; // e.g. '2026-11-27'
  business_and_visit: string; // 1. Business & visit (e.g. 'Grillicious')
  contact_and_authority: string; // 2. Contact & buying authority (e.g. 'Sweety / Purchasing Lead (Tel – 54613220)')
  packaging_required: string; // 3. Packaging required (e.g. 'Food packaging items - printed takeaway boxes')
  quantity_and_buying_date?: string; // 4. Quantity & buying date (e.g. '2,500 pcs initial, monthly repeats')
  current_supplier_and_price?: string; // 5. Current supplier & price (e.g. 'N/A - plain stock from distributor')
  need_and_reason_to_change: string; // 6. Need & reason to change (e.g. 'Will depend on proposed price and custom print')
  your_proposal: string; // 7. Your proposal. (e.g. 'Best price, better service - proposed Rs 8.25/pc')
  customer_response?: string; // 8. Customer response (e.g. 'Very interested in high-definition print proof')
  current_stage_and_evidence: string; // 9. Current stage & evidence (e.g. 'Is using plain packaging')
  potential_sales_mur?: number; // 10. Potential sales (optional) (e.g. 45000)
  next_action_and_commitment: string; // 11. Next action & commitment (e.g. 'Gave our printed samples – will check for response soon.')
  support_and_documents?: string; // 12. Support & documents (e.g. 'Sample pack delivered, Quotation QUO-PB-2026-0010 issued')
  brand: 'Explast' | 'PrintBox';
  status: WeeklyFollowUpStatus;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}
