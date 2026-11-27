'use client';

import React, { useState } from 'react';
import { DemoQuotation, DemoQuotationStatus, AppUser } from '@/types/demo';
import { DemoService } from '@/lib/sales/demo-service';
import { CompanyQuotationDocument } from './CompanyQuotationDocument';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  X,
  FileText,
  Printer,
  CheckCircle,
  Clock,
  ShieldCheck,
  Send,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Layers,
} from 'lucide-react';

interface QuotationDetailModalProps {
  quotation: DemoQuotation | null;
  isOpen: boolean;
  currentUser?: AppUser;
  onClose: () => void;
  onStatusChange?: (id: string, status: DemoQuotationStatus, actor?: string, notes?: string) => void;
  onNavigateToCustomer?: (customerId: string) => void;
}

export function QuotationDetailModal({
  quotation,
  isOpen,
  currentUser,
  onClose,
  onStatusChange,
  onNavigateToCustomer,
}: QuotationDetailModalProps) {
  const [viewMode, setViewMode] = useState<'document' | 'governance'>('document');

  if (!isOpen || !quotation) return null;

  const isAdmin = currentUser?.role === 'admin';
  const currentActorName = currentUser?.name || 'Alex L.';

  const statusBadgeVariants: Record<DemoQuotationStatus, 'brand' | 'success' | 'warning' | 'error' | 'neutral'> = {
    draft: 'neutral',
    pending_approval: 'warning',
    admin_approved: 'brand',
    sent: 'brand',
    awaiting_response: 'warning',
    accepted: 'success',
    rejected: 'error',
    expired: 'neutral',
    revised: 'brand',
  };

  const statusLabels: Record<DemoQuotationStatus, string> = {
    draft: '1. Costing Draft (Internal)',
    pending_approval: '2. Awaiting Admin Approval',
    admin_approved: '3. Admin Approved (Ready to Send)',
    sent: '4. Sent to Customer',
    awaiting_response: '4. Awaiting Client Go-Ahead',
    accepted: '5. Accepted (Order Dispatched)',
    rejected: 'Declined / Withdrawn',
    expired: 'Expired Validity',
    revised: 'Revised / Renegotiating',
  };

  // Check if production job is linked
  const linkedProduction = DemoService.getProductionJobs().find(
    j => j.quotation_id === quotation.id || j.project_id === quotation.project_id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static print:z-0 print:inset-auto">
      <div className="relative w-full max-w-4xl max-h-[94vh] bg-bg-card border border-border-subtle rounded-xl shadow-2xl flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:w-full">
        
        {/* MODAL HEADER (HIDDEN ON PRINT) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-border-subtle bg-bg-secondary/40 print:hidden">
          <div className="flex items-center space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-text-primary tracking-tight">
                  {quotation.quotation_number}
                </h2>
                <Badge variant={statusBadgeVariants[quotation.status]}>
                  {statusLabels[quotation.status]}
                </Badge>
                <span className="text-[11px] text-text-muted font-medium bg-bg-secondary px-2 py-0.5 rounded">
                  v{quotation.version}.0
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Linked Request: <span className="text-text-primary font-medium">{quotation.project_name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold px-2.5"
              title="Print Official Quotation"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIEW MODE TABS (HIDDEN ON PRINT) */}
        <div className="px-6 py-2.5 bg-bg-secondary/50 border-b border-border-subtle flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-1.5 p-1 bg-bg-card rounded-lg border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setViewMode('document')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'document'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Official Company Quotation Sheet
            </button>
            <button
              type="button"
              onClick={() => setViewMode('governance')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'governance'
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Approval Workflow & History
            </button>
          </div>

          <span className="text-[11px] text-text-muted hidden sm:inline-flex items-center gap-1">
            <Printer className="w-3 h-3" /> Standard A4 Print Ready
          </span>
        </div>

        {/* WORKFLOW PROGRESS TRACKER (HIDDEN ON PRINT) */}
        <div className="px-6 py-2.5 bg-bg-secondary/30 border-b border-border-subtle overflow-x-auto print:hidden">
          <div className="flex items-center justify-between min-w-[620px] text-xs">
            
            {/* Step 1: Sales Costing */}
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                quotation.status !== 'draft' ? 'bg-color-success text-white' : 'bg-brand-primary text-white'
              }`}>
                {quotation.status !== 'draft' ? '✓' : '1'}
              </div>
              <div>
                <p className="font-semibold text-text-primary leading-tight text-[11px]">1. Sales Costing</p>
                <span className="text-[10px] text-text-muted">Prices & Margins Prepared</span>
              </div>
            </div>

            <div className={`w-8 h-0.5 ${quotation.status !== 'draft' ? 'bg-color-success' : 'bg-border-subtle'}`} />

            {/* Step 2: Admin Approval */}
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                quotation.status === 'admin_approved' || quotation.status === 'sent' || quotation.status === 'awaiting_response' || quotation.status === 'accepted'
                  ? 'bg-color-success text-white'
                  : quotation.status === 'pending_approval'
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-bg-secondary text-text-muted'
              }`}>
                {quotation.status === 'admin_approved' || quotation.status === 'sent' || quotation.status === 'awaiting_response' || quotation.status === 'accepted' ? '✓' : '2'}
              </div>
              <div>
                <p className="font-semibold text-text-primary leading-tight text-[11px]">2. Admin Approval</p>
                <span className="text-[10px] text-text-muted">
                  {quotation.status === 'pending_approval' ? 'Awaiting Margin Check' : 'Authorized by Admin'}
                </span>
              </div>
            </div>

            <div className={`w-8 h-0.5 ${
              quotation.status === 'sent' || quotation.status === 'awaiting_response' || quotation.status === 'accepted'
                ? 'bg-color-success'
                : 'bg-border-subtle'
            }`} />

            {/* Step 3: Sent to Client */}
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                quotation.status === 'accepted'
                  ? 'bg-color-success text-white'
                  : quotation.status === 'sent' || quotation.status === 'awaiting_response'
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-secondary text-text-muted'
              }`}>
                {quotation.status === 'accepted' ? '✓' : '3'}
              </div>
              <div>
                <p className="font-semibold text-text-primary leading-tight text-[11px]">3. Client Review</p>
                <span className="text-[10px] text-text-muted">Offer in Negotiation</span>
              </div>
            </div>

            <div className={`w-8 h-0.5 ${quotation.status === 'accepted' ? 'bg-color-success' : 'bg-border-subtle'}`} />

            {/* Step 4: Client Go-Ahead & Automated Production */}
            <div className="flex items-center space-x-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                quotation.status === 'accepted'
                  ? 'bg-color-success text-white'
                  : 'bg-bg-secondary text-text-muted'
              }`}>
                {quotation.status === 'accepted' ? '✓' : '4'}
              </div>
              <div>
                <p className="font-semibold text-text-primary leading-tight text-[11px]">4. Client Go-Ahead</p>
                <span className="text-[10px] text-text-muted">Auto Production Dispatch</span>
              </div>
            </div>

          </div>
        </div>

        {/* MODAL BODY */}
        <div className="overflow-y-auto flex-1">
          
          {/* VIEW 1: OFFICIAL COMPANY QUOTATION DOCUMENT (DEFAULT) */}
          {viewMode === 'document' ? (
            <div className="p-4 sm:p-8 bg-zinc-100/70 min-h-full flex justify-center print:bg-white print:p-0">
              <CompanyQuotationDocument
                quotation={quotation}
                brand={quotation.brand || 'PrintBox'}
              />
            </div>
          ) : (
            /* VIEW 2: GOVERNANCE, MARGIN AUDIT & TIMELINE */
            <div className="p-6 space-y-6">
              {/* CLIENT CONFIRMATION & AUTO-PRODUCTION SUCCESS BANNER */}
              {quotation.status === 'accepted' && (
                <div className="p-4 rounded-xl bg-color-success/10 border border-color-success/30 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-color-success shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-color-success">Order Confirmed by Client & Dispatched to Production</h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {linkedProduction
                          ? `Manufacturing Job #${linkedProduction.job_reference} has been automatically staged on ${linkedProduction.assigned_team}.`
                          : 'Production Job automatically queued for plant floor extrusion.'}
                      </p>
                    </div>
                  </div>
                  {linkedProduction && (
                    <Badge variant="success">Stage: {linkedProduction.current_stage?.toUpperCase()}</Badge>
                  )}
                </div>
              )}

              {/* ADMIN APPROVAL STATUS BANNER */}
              {quotation.status === 'pending_approval' && (
                <div className="p-4 rounded-xl bg-color-warning/10 border border-color-warning/30 flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-color-warning shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-color-warning">Pending Internal Admin Approval</h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Price calculation and profit margins must be verified and authorized by management before transmitting to the client.
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          onStatusChange?.(quotation.id, 'admin_approved', currentActorName, 'Pricing and gross margin verified and approved by management.');
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve as Admin
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* 1. TOP METADATA BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-bg-secondary/30 border border-border-subtle text-xs">
                <div>
                  <span className="text-text-muted uppercase text-[10px] block">Customer</span>
                  <button
                    onClick={() => onNavigateToCustomer?.(quotation.client_id)}
                    className="font-semibold text-text-primary hover:text-brand-primary hover:underline text-left mt-0.5"
                  >
                    {quotation.client_name}
                  </button>
                </div>
                <div>
                  <span className="text-text-muted uppercase text-[10px] block">Sales Representative</span>
                  <p className="font-semibold text-text-primary mt-0.5">{quotation.salesperson}</p>
                </div>
                <div>
                  <span className="text-text-muted uppercase text-[10px] block">Creation Date</span>
                  <p className="font-semibold text-text-primary mt-0.5">{quotation.created_at}</p>
                </div>
                <div>
                  <span className="text-text-muted uppercase text-[10px] block">Validity</span>
                  <p className="font-semibold text-text-primary mt-0.5">{quotation.valid_until}</p>
                </div>
              </div>

              {/* 2. COST BREAKDOWN & COMMERCIAL TOTALS */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                <div className="text-xs text-text-secondary max-w-md space-y-2">
                  <div className="p-3 bg-bg-secondary/20 rounded border border-border-subtle space-y-1">
                    <span className="font-semibold text-text-primary text-[11px]">Commercial Governance & Terms:</span>
                    <p>• Payment Terms: <strong className="text-text-primary">{quotation.payment_terms || 'IB Transfer, Card, Juice or Cheque'}</strong></p>
                    <p>• Tolerances: <strong className="text-text-primary">±3% variation on quantity ordered</strong></p>
                    <p>• Bank: <strong className="text-text-primary">STATE BANK OF MAURITIUS LTD (SBM) - 503 0000 134 9609</strong></p>
                  </div>

                  {quotation.admin_approval && (
                    <div className="p-2.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-[11px] text-brand-primary space-y-0.5">
                      <p className="font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin Margin Authorization:
                      </p>
                      <p className="text-text-secondary">
                        Approved by {quotation.admin_approval.approved_by} on {quotation.admin_approval.approved_at.substring(0, 16).replace('T', ' ')}.
                      </p>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-72 bg-bg-secondary/40 p-4 rounded-lg border border-border-subtle space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal (Excl. VAT):</span>
                    <span className="font-mono font-medium text-text-primary">Rs {quotation.subtotal_mur.toLocaleString()}</span>
                  </div>
                  {quotation.tooling_charges_mur > 0 && (
                    <div className="flex justify-between text-text-secondary">
                      <span>Prepress Tooling / Stereos:</span>
                      <span className="font-mono font-medium text-text-primary">Rs {quotation.tooling_charges_mur.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>VAT ({quotation.tax_rate_percent}%):</span>
                    <span className="font-mono font-medium text-text-primary">Rs {quotation.tax_mur.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-border-subtle flex justify-between text-sm font-bold text-text-primary">
                    <span>Total Amount (MUR):</span>
                    <span className="font-mono text-brand-primary">Rs {quotation.total_mur.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 3. AUDIT TRAIL OF BACK-AND-FORTH INTERACTIONS */}
              <div className="pt-4 border-t border-border-subtle">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Approval & Communication Log
                </h4>
                <div className="space-y-2">
                  {quotation.history.map((h, i) => (
                    <div key={i} className="flex items-start text-xs space-x-3 p-2.5 rounded bg-bg-secondary/30">
                      <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-text-primary">{h.action}</span>
                          <span className="text-text-muted text-[11px] font-mono">{h.date}</span>
                        </div>
                        <p className="text-text-secondary text-[11px] mt-0.5">By {h.actor} {h.notes && `— ${h.notes}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER ACTIONS (Role-Aware Governance) - HIDDEN ON PRINT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-3.5 border-t border-border-subtle bg-bg-secondary/40 gap-3 print:hidden">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            
            {/* 1. SALES ACTION: Submit for Admin Approval */}
            {quotation.status === 'draft' && onStatusChange && (
              <Button
                onClick={() => {
                  onStatusChange(quotation.id, 'pending_approval', currentActorName, 'Submitted for price and margin review.');
                }}
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Submit for Admin Approval
              </Button>
            )}

            {/* 2. ADMIN ACTIONS: Approve or Request Revision */}
            {quotation.status === 'pending_approval' && onStatusChange && isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    onStatusChange(quotation.id, 'revised', currentActorName, 'Management requested price margin recalculation.');
                  }}
                  className="text-color-warning border-color-warning/40 hover:bg-color-warning/10"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Request Revision
                </Button>
                <Button
                  onClick={() => {
                    onStatusChange(quotation.id, 'admin_approved', currentActorName, 'Pricing and gross margin verified and approved by management.');
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Approve Pricing & Margins
                </Button>
              </>
            )}

            {/* 3. TRANSMIT TO CLIENT */}
            {quotation.status === 'admin_approved' && onStatusChange && (
              <Button
                onClick={() => {
                  onStatusChange(quotation.id, 'sent', currentActorName, 'Official quotation proposal transmitted to customer.');
                }}
              >
                <Send className="w-4 h-4 mr-1.5" /> Transmit to Client
              </Button>
            )}

            {/* 4. CLIENT RESPONSES: Accept or Renegotiate */}
            {(quotation.status === 'sent' || quotation.status === 'awaiting_response') && onStatusChange && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    onStatusChange(quotation.id, 'revised', currentActorName, 'Client requested volume discount / revision.');
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Client Wants Renegotiation
                </Button>
                
                <Button
                  onClick={() => {
                    onStatusChange(quotation.id, 'accepted', currentActorName, 'Customer issued purchase order / accepted terms.');
                  }}
                  className="bg-color-success hover:bg-color-success/90 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Record Client Go-Ahead (Accept Order)
                </Button>
              </>
            )}

            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" /> Print Official Quotation
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
