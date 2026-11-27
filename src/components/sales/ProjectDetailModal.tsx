'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DemoService } from '@/lib/sales/demo-service';
import { AppUser } from '@/types/demo';
import { CompanyQuotationDocument } from './CompanyQuotationDocument';
import {
  X,
  FolderKanban,
  Building,
  User,
  Calendar,
  Layers,
  Palette,
  Factory,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Printer,
  Sliders,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: any | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenClient?: (clientId: string) => void;
  onOpenQuotation?: (quotationId: string) => void;
  currentUser?: AppUser;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onOpenClient,
  onOpenQuotation,
  currentUser,
}: ProjectDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'feasibility' | 'quotation' | 'artwork' | 'production' | 'timeline'>('specs');

  if (!isOpen || !project) return null;

  // Resolve client and linked records from DemoService
  const customer = project.client_id ? DemoService.getCustomerById(project.client_id) : project.client;
  const quotations = DemoService.getQuotations().filter(q => q.project_id === project.id || (project.client_id && q.client_id === project.client_id));
  const linkedQuotation = quotations[0];
  const designs = DemoService.getDesignProjects().filter(d => d.project_id === project.id || (project.client_id && d.client_id === project.client_id));
  const linkedDesign = designs[0];
  const productionJobs = DemoService.getProductionJobs().filter(p => p.project_id === project.id || (linkedQuotation && p.quotation_id === linkedQuotation.id));
  const linkedProduction = productionJobs[0];

  const stageBadgeVariant: Record<string, 'brand' | 'success' | 'warning' | 'neutral' | 'error'> = {
    'Discovery': 'neutral',
    'Quoting': 'warning',
    'Production Order': 'brand',
    'Completed': 'success',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  {project.project_name}
                </h2>
                <Badge variant={stageBadgeVariant[project.kanban_stage] || 'brand'}>
                  {project.kanban_stage || 'Active'}
                </Badge>
                {project.urgency === 'urgent' && (
                  <Badge variant="error">Urgent Run</Badge>
                )}
                {project.urgency === 'high' && (
                  <Badge variant="warning">High Priority</Badge>
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                <span>Ref: <strong className="font-mono text-text-primary">{project.id}</strong></span>
                <span>•</span>
                <span>Brand: <strong className="text-text-primary">{project.business_unit || project.brand || 'Explast'}</strong></span>
                <span>•</span>
                <span>Workflow: <strong className="text-brand-primary">{project.workflow_path || 'Path B'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-border-subtle bg-bg-secondary/20 px-6 gap-2 overflow-x-auto text-xs">
          {[
            { id: 'specs', label: 'Manufacturing Specification', icon: Sliders },
            { id: 'feasibility', label: 'Technical Feasibility', icon: ShieldCheck },
            { id: 'quotation', label: 'Quotation & Commercials', icon: FileText, count: quotations.length },
            { id: 'artwork', label: 'Prepress & Artwork', icon: Palette, count: designs.length },
            { id: 'production', label: 'Plant MES Job', icon: Factory, isLive: !!linkedProduction },
            { id: 'timeline', label: 'Timeline & History', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 font-medium border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-bg-secondary font-mono">
                    {tab.count}
                  </span>
                )}
                {tab.isLive && (
                  <span className="w-2 h-2 rounded-full bg-color-success animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: MANUFACTURING SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-in fade-in">
              {/* CUSTOMER CARD */}
              <Card className="p-4 bg-bg-secondary/30 border border-border-subtle flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Client Account</span>
                    <h3 className="text-base font-semibold text-text-primary">
                      {customer?.company_name || project.client_name || 'Client Record'}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {customer?.contact_name} • {customer?.contact_phone || customer?.contact_email} • {customer?.industry}
                    </p>
                  </div>
                </div>

                {project.client_id && onOpenClient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onOpenClient(project.client_id);
                    }}
                  >
                    View 360° Profile <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                )}
              </Card>

              {/* SPECIFICATION TILES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Formulation & Extrusion */}
                <Card className="p-5 space-y-3 border-l-4 border-l-brand-primary">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-brand-primary" /> Material & Formulation
                    </h4>
                    <Badge variant="brand">{project.material_family || 'LDPE'}</Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1 border-b border-border-subtle">
                      <span className="text-text-muted">Material Family:</span>
                      <strong className="text-text-primary">{project.material_family || 'LDPE'}</strong>
                    </div>
                    {project.material_grade && (
                      <div className="flex justify-between pb-1 border-b border-border-subtle">
                        <span className="text-text-muted">Grade / Subfamily:</span>
                        <strong className="text-text-primary">{project.material_grade}</strong>
                      </div>
                    )}
                    <div className="flex justify-between pb-1 border-b border-border-subtle">
                      <span className="text-text-muted">Exact Formulation:</span>
                      <strong className="text-brand-primary font-medium text-right max-w-[200px] truncate">
                        {project.formulation || 'Standard Blend'}
                      </strong>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-border-subtle">
                      <span className="text-text-muted">Extrusion Roll Width:</span>
                      <strong className="text-text-primary">
                        {project.extrusion_spec?.roll_width_mm ? `${project.extrusion_spec.roll_width_mm} mm` : 'Auto-calculated'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Material Base Colour:</span>
                      <strong className="text-text-primary">
                        {project.extrusion_spec?.material_color || project.product_spec?.material_color || 'Natural Clear'}
                      </strong>
                    </div>
                  </div>
                </Card>

                {/* 2. Printing & Visual Specs */}
                <Card className="p-5 space-y-3 border-l-4 border-l-purple-500">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-purple-600" /> Printing & Visual Branding
                    </h4>
                    <Badge variant={project.print_type === 'printed' ? 'brand' : 'neutral'}>
                      {project.print_type === 'printed' ? 'Printed' : 'Plain'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1 border-b border-border-subtle">
                      <span className="text-text-muted">Print Mode:</span>
                      <strong className="text-text-primary uppercase tracking-wider text-[11px]">
                        {project.print_type === 'printed' ? 'Printed Flexographic' : 'Plain Unprinted'}
                      </strong>
                    </div>
                    {project.print_type === 'printed' && (
                      <>
                        <div className="flex justify-between pb-1 border-b border-border-subtle">
                          <span className="text-text-muted">Number of Colours:</span>
                          <strong className="text-purple-600 font-bold">
                            {project.printing_spec?.num_colors || project.num_colors || 1} Colours (Max 8)
                          </strong>
                        </div>
                        <div className="flex justify-between pb-1 border-b border-border-subtle">
                          <span className="text-text-muted">Artwork Status:</span>
                          <strong className="text-text-primary">
                            {project.printing_spec?.artwork_status?.replace('_', ' ') || 'Approved Existing'}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Artwork Master File:</span>
                          <strong className="text-brand-primary font-mono truncate max-w-[180px]">
                            {project.printing_spec?.artwork_file_name || 'supernord-carrier-v2.ai'}
                          </strong>
                        </div>
                      </>
                    )}
                    {project.print_type !== 'printed' && (
                      <p className="text-text-muted italic pt-1">
                        Product is plain unprinted. Extruded plain rolls bypass the flexographic printing press directly into conversion / sealing.
                      </p>
                    )}
                  </div>
                </Card>

                {/* 3. Final Product Conversion Specifications */}
                <Card className="p-5 space-y-3 border-l-4 border-l-amber-500 md:col-span-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-amber-600" /> Final Product & Converting Parameters
                    </h4>
                    <Badge variant="brand">{project.final_product_type || 'Side Sealing Bag'}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                    <div className="p-3 bg-bg-secondary/40 rounded border border-border-subtle space-y-1">
                      <span className="text-[10px] uppercase text-text-muted font-bold">Product Form</span>
                      <p className="font-semibold text-text-primary text-sm">{project.final_product_type || 'Side Sealing Bag'}</p>
                    </div>

                    <div className="p-3 bg-bg-secondary/40 rounded border border-border-subtle space-y-1">
                      <span className="text-[10px] uppercase text-text-muted font-bold">Thickness / Gauge</span>
                      <p className="font-semibold text-text-primary text-sm">
                        {project.product_spec?.thickness_micron || project.extrusion_spec?.thickness_micron || 40} µm (microns)
                      </p>
                    </div>

                    <div className="p-3 bg-bg-secondary/40 rounded border border-border-subtle space-y-1">
                      <span className="text-[10px] uppercase text-text-muted font-bold">Target Order Volume</span>
                      <p className="font-semibold text-brand-primary text-sm font-mono">
                        {project.quantity?.toLocaleString() || 50000} {project.quantity_unit || 'units'}
                      </p>
                    </div>
                  </div>

                  {/* Physical Dimensions */}
                  <div className="p-3 bg-bg-secondary/20 rounded border border-border-subtle space-y-2 text-xs">
                    <p className="font-semibold text-text-primary">Geometric & Technical Dimensions:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-text-secondary">
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase">Width:</span>
                        <strong className="text-text-primary">{project.product_spec?.width_mm || project.product_spec?.roll_width_mm || 380} mm</strong>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase">Length:</span>
                        <strong className="text-text-primary">{project.product_spec?.length_mm || project.product_spec?.roll_length_meters ? `${project.product_spec?.roll_length_meters} m` : '520 mm'}</strong>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase">Handle / Seal:</span>
                        <strong className="text-text-primary">{project.product_spec?.tape_type || 'Reinforced Die-Cut Punch'}</strong>
                      </div>
                      <div>
                        <span className="text-text-muted block text-[10px] uppercase">Delivery Req:</span>
                        <strong className="text-text-primary">{project.requested_delivery_date || 'Standard Run'}</strong>
                      </div>
                    </div>
                    {project.product_spec?.additional_requirements && (
                      <p className="text-[11px] text-text-secondary pt-1 border-t border-border-subtle mt-1">
                        <strong>Notes:</strong> {project.product_spec.additional_requirements}
                      </p>
                    )}
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL FEASIBILITY */}
          {activeTab === 'feasibility' && (
            <div className="space-y-5 animate-in fade-in">
              <Card className="p-5 border-l-4 border-l-color-success space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">Technical Feasibility Assessment</h3>
                    <p className="text-xs text-text-secondary">Validated by Plant Engineering & Prepress</p>
                  </div>
                  <Badge variant="success">Feasible & Approved</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 bg-bg-secondary/40 rounded border border-border-subtle">
                    <span className="text-[10px] uppercase text-text-muted font-bold block mb-1">1. Extrusion Line</span>
                    <Badge variant="success">Feasible</Badge>
                    <p className="text-[11px] text-text-secondary mt-1">Melt index and bubble stability verified on extruder die.</p>
                  </div>

                  <div className="p-3 bg-bg-secondary/40 rounded border border-border-subtle">
                    <span className="text-[10px] uppercase text-text-muted font-bold block mb-1">2. Flexo Printing</span>
                    <Badge variant={project.print_type === 'printed' ? 'success' : 'neutral'}>
                      {project.print_type === 'printed' ? 'Feasible' : 'Not Required'}
                    </Badge>
                    <p className="text-[11px] text-text-secondary mt-1">
                      {project.print_type === 'printed' ? 'Cylinder repeat gear ratio aligns with web width.' : 'Plain unprinted film flow.'}
                    </p>
                  </div>

                  <div className="p-3 bg-bg-secondary/40 rounded border border-border-subtle">
                    <span className="text-[10px] uppercase text-text-muted font-bold block mb-1">3. Conversion & Sealing</span>
                    <Badge variant="success">Feasible</Badge>
                    <p className="text-[11px] text-text-secondary mt-1">Hot wire / ultrasonic side seal dwell time validated.</p>
                  </div>
                </div>

                <div className="p-4 bg-bg-secondary/20 rounded-lg border border-border-subtle text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text-primary">Assessor Observations:</span>
                    <span className="text-[11px] text-text-muted">
                      Engineer: <strong className="text-text-primary">{project.technical_assessment?.responsible_person || 'Sunil R. (Extrusion Lead)'}</strong>
                    </span>
                  </div>
                  <p className="text-text-secondary">
                    {project.technical_assessment?.observations || 'Formulation and dimensions align with standard plant operating window. Extruder Line 1 scheduled with Grade 2 Linear blend. Quality tolerances within ±5% thickness.'}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: QUOTATION & COMMERCIALS */}
          {activeTab === 'quotation' && (
            <div className="space-y-5 animate-in fade-in">
              {linkedQuotation ? (
                <Card className="p-6 space-y-5 border-l-4 border-l-brand-primary">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Linked Formal Quotation</span>
                      <h3 className="text-lg font-bold text-text-primary">{linkedQuotation.quotation_number}</h3>
                      <p className="text-xs text-text-secondary">Created on {linkedQuotation.created_at} • Valid for 30 days</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="brand">{linkedQuotation.status?.toUpperCase()}</Badge>
                      {onOpenQuotation && (
                        <Button
                          size="sm"
                          onClick={() => {
                            onClose();
                            onOpenQuotation(linkedQuotation.id);
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Full Quotation View
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-border-subtle">
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">Unit Price</span>
                      <p className="font-mono font-bold text-base text-text-primary">
                        Rs {linkedQuotation.items[0]?.unit_price_mur.toFixed(2) || '2.85'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">Quantity</span>
                      <p className="font-mono font-bold text-base text-text-primary">
                        {linkedQuotation.items[0]?.quantity.toLocaleString() || '100,000'} {linkedQuotation.items[0]?.quantity_unit || 'units'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">VAT (15%)</span>
                      <p className="font-mono font-bold text-base text-text-secondary">
                        Rs {linkedQuotation.tax_mur?.toLocaleString() || '21,750'}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">Total Amount (Incl. VAT)</span>
                      <p className="font-mono font-bold text-base text-brand-primary">
                        Rs {linkedQuotation.total_mur.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-bg-secondary/30 rounded border border-border-subtle text-xs space-y-1">
                    <p className="font-semibold text-text-primary">Commercial Governance Status:</p>
                    <p className="text-text-secondary">
                      {linkedQuotation.status === 'accepted'
                        ? '✓ Customer approved order. Production released automatically.'
                        : linkedQuotation.status === 'admin_approved'
                        ? '✓ Internal margin approved by management. Ready for client signature.'
                        : linkedQuotation.status === 'pending_approval'
                        ? '⏳ Awaiting Admin pricing & margin verification.'
                        : 'Quotation active in negotiation.'}
                    </p>
                  </div>

                  {/* Official Company Document Format Preview */}
                  <div className="pt-4 border-t border-border-subtle">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        Official Company Quotation Document Preview
                      </span>
                      {onOpenQuotation && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenQuotation(linkedQuotation.id);
                          }}
                          className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          Open in Full View / Print →
                        </button>
                      )}
                    </div>
                    <div className="bg-zinc-100/70 p-3 sm:p-5 rounded-xl border border-border-subtle flex justify-center">
                      <CompanyQuotationDocument
                        quotation={linkedQuotation}
                        brand={project.brand || 'PrintBox'}
                        className="scale-[0.92] sm:scale-100 origin-top"
                      />
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="border border-dashed border-border-subtle rounded-xl p-8 text-center space-y-3">
                  <FileText className="w-8 h-8 mx-auto text-text-muted" />
                  <h4 className="text-sm font-semibold text-text-primary">No Formal Quotation Linked Yet</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    This project has been assessed for manufacturing feasibility and is currently queued for commercial price calculation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PREPRESS & ARTWORK */}
          {activeTab === 'artwork' && (
            <div className="space-y-5 animate-in fade-in">
              {linkedDesign ? (
                <Card className="p-6 space-y-4 border-l-4 border-l-purple-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Prepress Engineering Asset</span>
                      <h3 className="text-base font-bold text-text-primary">{linkedDesign.artwork_title}</h3>
                      <p className="text-xs text-text-secondary font-mono">{linkedDesign.design_reference}</p>
                    </div>
                    <Badge variant="brand">{linkedDesign.status?.toUpperCase()}</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-border-subtle">
                    <div className="p-2 bg-bg-secondary/40 rounded">
                      <span className="text-[10px] text-text-muted uppercase block">Cylinder Repeat</span>
                      <strong className="text-text-primary font-mono">{linkedDesign.cylinder_repeat_mm} mm</strong>
                    </div>
                    <div className="p-2 bg-bg-secondary/40 rounded">
                      <span className="text-[10px] text-text-muted uppercase block">Web Width</span>
                      <strong className="text-text-primary font-mono">{linkedDesign.web_width_mm} mm</strong>
                    </div>
                    <div className="p-2 bg-bg-secondary/40 rounded">
                      <span className="text-[10px] text-text-muted uppercase block">Plate Thickness</span>
                      <strong className="text-text-primary font-mono">{linkedDesign.plate_thickness_mm} mm</strong>
                    </div>
                    <div className="p-2 bg-bg-secondary/40 rounded">
                      <span className="text-[10px] text-text-muted uppercase block">Color Channels</span>
                      <strong className="text-purple-600 font-bold">{linkedDesign.num_colors} Colours</strong>
                    </div>
                  </div>

                  {linkedDesign.color_names?.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Separation Plates / Spot Inks:</span>
                      <div className="flex flex-wrap gap-2">
                        {linkedDesign.color_names.map((col: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-bg-secondary text-xs text-text-primary border border-border-subtle flex items-center gap-1.5 font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
                              style={{ backgroundColor: linkedDesign.spot_colors_hex?.[i] || '#008080' }}
                            />
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ) : (
                <div className="border border-dashed border-border-subtle rounded-xl p-8 text-center space-y-2">
                  <Palette className="w-8 h-8 mx-auto text-text-muted" />
                  <h4 className="text-sm font-semibold text-text-primary">
                    {project.print_type === 'printed' ? 'Artwork Staged in Prepress' : 'Plain Product — No Artwork Required'}
                  </h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    {project.print_type === 'printed'
                      ? 'Flexographic printing plates will be mounted upon order confirmation.'
                      : 'Unprinted extrusion and conversion bypass prepress and flexographic tooling.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLANT MES JOB */}
          {activeTab === 'production' && (
            <div className="space-y-5 animate-in fade-in">
              {linkedProduction ? (
                <Card className="p-6 space-y-5 border-l-4 border-l-emerald-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Active Plant Floor Order</span>
                      <h3 className="text-base font-bold text-text-primary">{linkedProduction.job_reference}</h3>
                      <p className="text-xs text-text-secondary">Assigned: {linkedProduction.assigned_team}</p>
                    </div>
                    <Badge variant="success">{linkedProduction.current_stage?.toUpperCase()}</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-muted">Manufacturing Progress:</span>
                      <span className="font-mono font-bold text-text-primary">{linkedProduction.progress_percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${linkedProduction.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-border-subtle">
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">Extrusion Line</span>
                      <strong className="text-text-primary">{linkedProduction.extrusion_line}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">Target Completion</span>
                      <strong className="text-text-primary">{linkedProduction.target_completion_date}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">Produced / Target</span>
                      <strong className="text-text-primary font-mono">
                        {linkedProduction.produced_quantity.toLocaleString()} / {linkedProduction.required_quantity.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-text-muted uppercase text-[10px] block">QC Inspection</span>
                      <Badge variant="success">Passed Standards</Badge>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="border border-dashed border-border-subtle rounded-xl p-8 text-center space-y-3">
                  <Factory className="w-8 h-8 mx-auto text-text-muted" />
                  <h4 className="text-sm font-semibold text-text-primary">Production Scheduled Upon Quotation Acceptance</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Explast manufacturing orders are dispatched automatically once the customer gives the go-ahead and accepts the commercial quotation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TIMELINE & AUDIT HISTORY */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                End-to-End Lifecycle Milestones
              </h4>
              <div className="space-y-3">
                {[
                  {
                    title: 'Sales Enquiry & Technical Scope Captured',
                    date: project.created_at || '2026-02-02',
                    desc: `Initiated under ${project.workflow_path || 'Path B'} with ${project.material_family} formulation specification.`,
                    actor: project.assigned_salesperson || 'Alex L.',
                    done: true,
                  },
                  {
                    title: 'Plant Technical Feasibility Approved',
                    date: '2026-02-05',
                    desc: 'Extrusion melt flow, flexo repeat ratio, and conversion parameters approved by Head of Extrusion.',
                    actor: 'Sunil R. (Plant Lead)',
                    done: true,
                  },
                  {
                    title: 'Commercial Price Calculation & Quotation',
                    date: '2026-02-08',
                    desc: linkedQuotation ? `Quotation ${linkedQuotation.quotation_number} generated with target profit margin.` : 'Quotation formulation in progress.',
                    actor: project.assigned_salesperson || 'Alex L.',
                    done: !!linkedQuotation,
                  },
                  {
                    title: 'Internal Admin / Management Approval',
                    date: '2026-02-09',
                    desc: linkedQuotation?.status === 'accepted' || linkedQuotation?.status === 'sent' || linkedQuotation?.status === 'admin_approved'
                      ? 'Pricing and margins verified and approved by management.'
                      : 'Pending admin review before sending to customer.',
                    actor: 'Administrator',
                    done: linkedQuotation?.status === 'accepted' || linkedQuotation?.status === 'sent' || linkedQuotation?.status === 'admin_approved',
                  },
                  {
                    title: 'Client Go-Ahead & Order Confirmation',
                    date: linkedQuotation?.status === 'accepted' ? '2026-02-12' : 'Pending',
                    desc: linkedQuotation?.status === 'accepted'
                      ? 'Customer purchase order confirmed. Production job auto-dispatched.'
                      : 'Awaiting client signature / purchase order.',
                    actor: customer?.contact_name || 'Customer',
                    done: linkedQuotation?.status === 'accepted',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs p-3 rounded-lg bg-bg-secondary/30 border border-border-subtle/60">
                    <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${item.done ? 'bg-color-success' : 'bg-text-muted/40'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-primary">{item.title}</span>
                        <span className="text-[11px] font-mono text-text-muted">{item.date}</span>
                      </div>
                      <p className="text-text-secondary mt-0.5">{item.desc}</p>
                      <span className="text-[10px] text-text-muted block mt-1">Responsible: {item.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle bg-bg-secondary/40">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center space-x-2">
            {linkedQuotation && onOpenQuotation && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenQuotation(linkedQuotation.id);
                }}
              >
                <FileText className="w-4 h-4 mr-1.5" /> View Quotation
              </Button>
            )}
            {customer && onOpenClient && (
              <Button
                variant="outline"
                onClick={() => {
                  onClose();
                  onOpenClient(customer.id);
                }}
              >
                <Building className="w-4 h-4 mr-1.5" /> Customer 360°
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
