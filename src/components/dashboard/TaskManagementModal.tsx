'use client';

import React, { useState } from 'react';
import { SalesTask, TaskPriority, TaskUrgency, TaskStatus, TaskCategory } from '@/types/demo';
import {
  X,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  User,
  Building2,
  FolderKanban,
  FileText,
  Check,
  Trash2,
} from 'lucide-react';

interface TaskManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: SalesTask[];
  isAdmin: boolean;
  currentUserName: string;
  onCompleteTask: (taskId: string) => void;
  onRescheduleTask: (taskId: string, newDate: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (task: Partial<SalesTask>) => void;
  onOpenTask: (task: SalesTask) => void;
}

export function TaskManagementModal({
  isOpen,
  onClose,
  tasks,
  isAdmin,
  currentUserName,
  onCompleteTask,
  onRescheduleTask,
  onDeleteTask,
  onCreateTask,
  onOpenTask,
}: TaskManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [urgencyFilter, setUrgencyFilter] = useState<TaskUrgency | 'all'>('all');
  const [repFilter, setRepFilter] = useState<string>(isAdmin ? 'all' : currentUserName);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-11-28');
  const [newAssignedTo, setNewAssignedTo] = useState(currentUserName);
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newCategory, setNewCategory] = useState<TaskCategory>('customer_followup');
  const [newBrand, setNewBrand] = useState<'Explast' | 'PrintBox' | 'Both'>('Explast');
  const [newClientName, setNewClientName] = useState('');

  if (!isOpen) return null;

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (urgencyFilter !== 'all' && t.urgency !== urgencyFilter) return false;
    if (repFilter !== 'all' && t.assigned_to !== repFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchClient = t.related_client_name?.toLowerCase().includes(q);
      const matchProject = t.related_project_name?.toLowerCase().includes(q);
      const matchQuo = t.related_quotation_number?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchClient && !matchProject && !matchQuo) {
        return false;
      }
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      due_date: newDueDate,
      assigned_to: isAdmin ? newAssignedTo : currentUserName,
      priority: newPriority,
      category: newCategory,
      category_label:
        newCategory === 'customer_followup'
          ? 'Customer Follow-up'
          : newCategory === 'quote_followup'
          ? 'Quotation Follow-up'
          : newCategory === 'quote_prep'
          ? 'Quotation Preparation'
          : newCategory === 'quote_send'
          ? 'Quotation Sending'
          : newCategory === 'client_contact'
          ? 'Client Contact'
          : newCategory === 'project_action'
          ? 'Project Action'
          : newCategory === 'approval_pending'
          ? 'Pending Customer Approval'
          : 'Sales Reminder',
      brand: newBrand,
      related_client_name: newClientName.trim() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setNewClientName('');
    setIsAddingTask(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-bg-card border border-border-strong rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Task & Follow-up Command Center
              </h3>
              <p className="text-xs text-text-secondary">
                Action-oriented daily workflow, reminders, and commercial deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-bg-secondary flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS & FILTERS TOOLBAR */}
        <div className="p-4 border-b border-border-subtle bg-bg-card space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tasks, clients, quotations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border-subtle bg-bg-page text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" /> {isAddingTask ? 'Cancel' : 'New Task'}
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* Status Tabs */}
            <div className="flex bg-bg-secondary p-0.5 rounded-lg border border-border-subtle">
              {(['pending', 'completed', 'all'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-brand-primary font-bold shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as any)}
              className="px-2.5 py-1 text-xs rounded-lg border border-border-subtle bg-bg-secondary text-text-primary font-medium focus:outline-none"
            >
              <option value="all">All Urgencies</option>
              <option value="overdue">Overdue Only</option>
              <option value="due_today">Due Today</option>
              <option value="due_soon">Due Soon</option>
            </select>

            {/* Rep Filter (Admin only) */}
            {isAdmin && (
              <select
                value={repFilter}
                onChange={(e) => setRepFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-border-subtle bg-bg-secondary text-text-primary font-medium focus:outline-none"
              >
                <option value="all">All Representatives</option>
                <option value="Alex L.">Alex L.</option>
                <option value="Sunil R.">Sunil R.</option>
                <option value="Sarah M.">Sarah M.</option>
                <option value="David T.">David T.</option>
              </select>
            )}

            <span className="text-[11px] text-text-muted ml-auto">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
        </div>

        {/* ADD NEW TASK FORM TRAY */}
        {isAddingTask && (
          <form
            onSubmit={handleCreateSubmit}
            className="p-4 bg-brand-primary-light/30 border-b border-brand-primary/20 space-y-3 animate-in slide-in-from-top-2 duration-150"
          >
            <h4 className="text-xs font-bold text-brand-primary-dark uppercase tracking-wider">
              Create New Sales Task or Reminder
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow up on signed purchase order"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary focus:outline-none"
                >
                  <option value="customer_followup">Customer Follow-up</option>
                  <option value="quote_followup">Quotation Follow-up</option>
                  <option value="quote_prep">Quotation Preparation</option>
                  <option value="quote_send">Quotation Sending</option>
                  <option value="client_contact">Client Contact</option>
                  <option value="project_action">Project Action</option>
                  <option value="approval_pending">Pending Approval</option>
                  <option value="reminder">Other Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Client / Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phoenix Beverages"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary focus:outline-none"
                />
              </div>

              {isAdmin ? (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Assign To
                  </label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary focus:outline-none"
                  >
                    <option value="Alex L.">Alex L.</option>
                    <option value="Sunil R.">Sunil R.</option>
                    <option value="Sarah M.">Sarah M.</option>
                    <option value="David T.">David T.</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                    Brand
                  </label>
                  <select
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary focus:outline-none"
                  >
                    <option value="Explast">Explast</option>
                    <option value="PrintBox">PrintBox</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              )}

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                  Description / Action Notes
                </label>
                <input
                  type="text"
                  placeholder="Details regarding required action, quote reference, or meeting points..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded border border-border-strong bg-white text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1 text-xs rounded border border-border-subtle bg-white text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1 text-xs rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark shadow-xs"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* TASK LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              No tasks match your selected filter criteria.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  task.status === 'completed'
                    ? 'bg-bg-secondary/40 border-border-subtle opacity-70'
                    : task.urgency === 'overdue'
                    ? 'bg-rose-50/30 border-rose-200'
                    : task.urgency === 'due_today'
                    ? 'bg-amber-50/20 border-amber-200'
                    : 'bg-bg-card border-border-subtle hover:border-border-strong'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {task.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      ) : task.urgency === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Overdue ({task.due_date})
                        </span>
                      ) : task.urgency === 'due_today' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Due Today
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          <Calendar className="w-3 h-3 text-teal-600" /> Due {task.due_date}
                        </span>
                      )}

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-bg-secondary text-text-secondary">
                        {task.category_label}
                      </span>

                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          <User className="w-3 h-3" /> {task.assigned_to}
                        </span>
                      )}

                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                        {task.brand}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-semibold text-text-primary ${
                        task.status === 'completed' ? 'line-through text-text-muted' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    <p className="text-xs text-text-secondary">{task.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
                      {task.related_client_name && (
                        <button
                          onClick={() => {
                            onOpenTask(task);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-brand-primary hover:underline font-medium text-[11px]"
                        >
                          <Building2 className="w-3 h-3" /> {task.related_client_name}
                        </button>
                      )}
                      {task.related_project_name && (
                        <button
                          onClick={() => {
                            onOpenTask(task);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary font-medium text-[11px]"
                        >
                          <FolderKanban className="w-3 h-3" /> {task.related_project_name}
                        </button>
                      )}
                      {task.related_quotation_number && (
                        <button
                          onClick={() => {
                            onOpenTask(task);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 font-mono text-[#6E4A9E] hover:underline font-semibold text-[11px]"
                        >
                          <FileText className="w-3 h-3" /> {task.related_quotation_number}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenTask(task);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs rounded border border-border-subtle bg-bg-secondary hover:bg-bg-secondary/80 text-text-primary flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </button>

                    {task.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={() => onCompleteTask(task.id)}
                        className="px-3 py-1 text-xs rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Done
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-text-muted hover:text-rose-600 rounded transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-secondary/20 flex items-center justify-between text-xs text-text-secondary">
          <span>Tip: Tasks update dynamically based on real calendar deadlines.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-border-subtle bg-white text-text-primary font-medium hover:bg-bg-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
