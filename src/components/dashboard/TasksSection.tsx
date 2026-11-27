'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SalesTask, TaskUrgency } from '@/types/demo';
import {
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Plus,
  Building2,
  FolderKanban,
  FileText,
  User,
  Check,
  RotateCcw,
} from 'lucide-react';

interface TasksSectionProps {
  tasks: SalesTask[];
  isAdmin: boolean;
  title?: string;
  subtitle?: string;
  onCompleteTask: (taskId: string) => void;
  onRescheduleTask: (taskId: string, newDate: string) => void;
  onOpenTask: (task: SalesTask) => void;
  onViewAll: () => void;
  onAddTask?: () => void;
}

export function TasksSection({
  tasks,
  isAdmin,
  title,
  subtitle,
  onCompleteTask,
  onRescheduleTask,
  onOpenTask,
  onViewAll,
  onAddTask,
}: TasksSectionProps) {
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState<string>('2026-11-28');
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const defaultTitle = isAdmin ? 'Business Attention' : 'My Tasks & Follow-ups';
  const defaultSubtitle = isAdmin
    ? 'Items requiring attention across the company.'
    : 'Tasks that need your attention.';

  // Show only pending tasks here (top 5 urgent)
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const displayTasks = pendingTasks.slice(0, 5);

  const overdueCount = pendingTasks.filter(t => t.urgency === 'overdue').length;
  const dueTodayCount = pendingTasks.filter(t => t.urgency === 'due_today').length;

  const handleComplete = (taskId: string) => {
    setJustCompletedId(taskId);
    setTimeout(() => {
      onCompleteTask(taskId);
      setJustCompletedId(null);
    }, 400);
  };

  const getUrgencyBadge = (urgency: TaskUrgency, dueDate: string) => {
    if (urgency === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
          <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" /> Overdue ({dueDate})
        </span>
      );
    }
    if (urgency === 'due_today') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          <Clock className="w-3 h-3 text-amber-600 shrink-0" /> Due Today
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 whitespace-nowrap">
        <Calendar className="w-3 h-3 text-teal-600 shrink-0" /> Due Soon ({dueDate})
      </span>
    );
  };

  return (
    <Card className="p-6 border border-border-strong/70 shadow-sm space-y-4">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-text-primary tracking-tight">
              {title || defaultTitle}
            </h3>
            {overdueCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                {overdueCount} Overdue
              </span>
            )}
            {dueTodayCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                {dueTodayCount} Today
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onAddTask && (
            <button
              onClick={onAddTask}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1 bg-brand-primary/10 hover:bg-brand-primary/20 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          )}
          <button
            onClick={onViewAll}
            className="text-xs text-brand-primary hover:underline font-semibold flex items-center gap-0.5"
          >
            View All Tasks ({pendingTasks.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TASKS LIST */}
      {displayTasks.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-lg bg-bg-secondary/40 border border-dashed border-border-subtle">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-text-primary">
            {isAdmin
              ? 'All clear! No critical business attention items pending.'
              : "You're all caught up! No urgent tasks at the moment."}
          </h4>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            {isAdmin
              ? 'All customer requests, quotations, and active workflows are running on schedule.'
              : 'Great job maintaining your customer follow-ups and quotation pipeline.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTasks.map((task) => {
            const isCompletedAnim = justCompletedId === task.id;
            const isRescheduling = reschedulingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-lg border transition-all duration-200 ${
                  isCompletedAnim
                    ? 'opacity-40 scale-98 bg-emerald-50 border-emerald-300'
                    : task.urgency === 'overdue'
                    ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                    : task.urgency === 'due_today'
                    ? 'bg-amber-50/20 border-amber-200 hover:border-amber-300'
                    : 'bg-bg-card border-border-subtle hover:border-border-strong'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Task Content */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getUrgencyBadge(task.urgency, task.due_date)}
                      
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-bg-secondary text-text-secondary whitespace-nowrap">
                        {task.category_label}
                      </span>

                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                          <User className="w-3 h-3 shrink-0" /> {task.assigned_to}
                        </span>
                      )}

                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 whitespace-nowrap">
                        {task.brand}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-text-primary leading-tight">
                      {task.title}
                    </h4>

                    <p className="text-xs text-text-secondary line-clamp-1">
                      {task.description}
                    </p>

                    {/* Associated Entity Links */}
                    <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
                      {task.related_client_name && (
                        <button
                          type="button"
                          onClick={() => onOpenTask(task)}
                          className="inline-flex items-center gap-1 text-brand-primary hover:underline font-medium text-[11px] whitespace-nowrap"
                        >
                          <Building2 className="w-3 h-3 shrink-0" /> {task.related_client_name}
                        </button>
                      )}
                      {task.related_project_name && (
                        <button
                          type="button"
                          onClick={() => onOpenTask(task)}
                          className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary font-medium text-[11px] whitespace-nowrap"
                        >
                          <FolderKanban className="w-3 h-3 shrink-0" /> {task.related_project_name}
                        </button>
                      )}
                      {task.related_quotation_number && (
                        <button
                          type="button"
                          onClick={() => onOpenTask(task)}
                          className="inline-flex items-center gap-1 font-mono text-[#6E4A9E] hover:underline font-semibold text-[11px] whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3 shrink-0" /> {task.related_quotation_number}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center mt-1 sm:mt-0">
                    {/* Action 1: Open */}
                    <button
                      type="button"
                      onClick={() => onOpenTask(task)}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-primary bg-bg-secondary hover:bg-bg-secondary/80 border border-border-subtle flex items-center gap-1 transition-colors whitespace-nowrap"
                      title="Open related record"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" /> Open
                    </button>

                    {/* Action 2: Reschedule Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        setReschedulingTaskId(isRescheduling ? null : task.id)
                      }
                      className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-card hover:bg-bg-secondary border border-border-subtle flex items-center gap-1 transition-colors whitespace-nowrap"
                      title="Reschedule deadline"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-text-muted" /> Reschedule
                    </button>

                    {/* Action 3: Mark as Completed */}
                    <button
                      type="button"
                      onClick={() => handleComplete(task.id)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      title="Mark task completed"
                    >
                      <Check className="w-3.5 h-3.5" /> Done
                    </button>
                  </div>
                </div>

                {/* Inline Reschedule Popover / Tray */}
                {isRescheduling && (
                  <div className="mt-3 pt-3 border-t border-border-subtle/80 flex flex-wrap items-center gap-2 animate-in fade-in duration-150 bg-bg-secondary/50 p-2.5 rounded-md">
                    <span className="text-xs font-semibold text-text-secondary mr-1">
                      Reschedule to:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onRescheduleTask(task.id, '2026-11-28');
                        setReschedulingTaskId(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-white hover:bg-brand-primary hover:text-white border border-border-subtle text-text-primary font-medium transition-colors"
                    >
                      Tomorrow (28 Nov)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRescheduleTask(task.id, '2026-11-30');
                        setReschedulingTaskId(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-white hover:bg-brand-primary hover:text-white border border-border-subtle text-text-primary font-medium transition-colors"
                    >
                      In 3 Days (30 Nov)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRescheduleTask(task.id, '2026-12-01');
                        setReschedulingTaskId(null);
                      }}
                      className="px-2.5 py-1 text-xs rounded bg-white hover:bg-brand-primary hover:text-white border border-border-subtle text-text-primary font-medium transition-colors"
                    >
                      Next Monday (1 Dec)
                    </button>

                    {/* Custom Date Input */}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="px-2 py-0.5 text-xs rounded border border-border-strong bg-white font-mono text-text-primary focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customDate) {
                            onRescheduleTask(task.id, customDate);
                            setReschedulingTaskId(null);
                          }
                        }}
                        className="px-2 py-1 text-xs rounded bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
