'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Users, TrendingUp, ChevronRight } from 'lucide-react';

export interface SalesRepPerformanceItem {
  name: string;
  avatar: string;
  activeProjects: number;
  quotedValue: number;
  acceptedValue: number;
  winRate: number;
}

interface SalesTeamPerformanceTableProps {
  reps: SalesRepPerformanceItem[];
  selectedRep?: string;
  onSelectRep: (repName: string) => void;
  className?: string;
}

export function SalesTeamPerformanceTable({
  reps,
  selectedRep,
  onSelectRep,
  className = '',
}: SalesTeamPerformanceTableProps) {
  return (
    <Card className={`p-6 border border-border-strong/70 shadow-sm space-y-4 ${className}`}>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary tracking-tight">
            Sales Team Performance
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Commercial activity and quotation conversion across all 4 representatives
          </p>
        </div>
        {selectedRep && selectedRep !== 'all' && (
          <button
            onClick={() => onSelectRep('all')}
            className="text-xs text-brand-primary hover:underline font-semibold"
          >
            Reset Filter (Show All)
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-border-subtle text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              <th className="py-2.5 px-3">Sales Representative</th>
              <th className="py-2.5 px-3 text-center">Active Projects</th>
              <th className="py-2.5 px-3 text-right">Quoted Pipeline</th>
              <th className="py-2.5 px-3 text-right">Signed Revenue</th>
              <th className="py-2.5 px-3 text-right">Win Rate</th>
              <th className="py-2.5 px-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/60">
            {reps.map((rep) => {
              const isSelected = selectedRep === rep.name;

              return (
                <tr
                  key={rep.name}
                  onClick={() => onSelectRep(isSelected ? 'all' : rep.name)}
                  className={`group cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-primary-light/40 font-medium'
                      : 'hover:bg-bg-secondary/70'
                  }`}
                >
                  {/* Name & Avatar */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        {rep.avatar}
                      </div>
                      <div>
                        <span className="font-semibold text-text-primary group-hover:text-brand-primary transition-colors block">
                          {rep.name}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          Technical Sales
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Active Projects */}
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] bg-bg-secondary text-text-primary">
                      {rep.activeProjects}
                    </span>
                  </td>

                  {/* Quoted Value */}
                  <td className="py-3 px-3 text-right font-mono font-medium text-text-primary">
                    Rs {rep.quotedValue.toLocaleString()}
                  </td>

                  {/* Signed Revenue */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#6E4A9E]">
                    Rs {rep.acceptedValue.toLocaleString()}
                  </td>

                  {/* Win Rate */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="font-mono font-bold text-text-primary">
                        {rep.winRate}%
                      </span>
                      <div className="w-12 h-1.5 bg-bg-secondary rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, rep.winRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Drill-down action indicator */}
                  <td className="py-3 px-2 text-center text-text-muted group-hover:text-brand-primary">
                    <ChevronRight className="w-3.5 h-3.5 inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-[11px] text-text-muted flex items-center justify-between border-t border-border-subtle/60">
        <span>Click any representative to filter dashboard analytics.</span>
        <span className="font-semibold text-text-secondary">4 Representatives Total</span>
      </div>
    </Card>
  );
}
