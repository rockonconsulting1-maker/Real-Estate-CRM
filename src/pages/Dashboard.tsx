import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { GreetingHeader } from "@/components/dashboard/GreetingHeader";
import { AttentionWidget } from "@/components/dashboard/AttentionWidget";
import { NewLeadsList } from "@/components/dashboard/NewLeadsList";
import { PendingOffersList } from "@/components/dashboard/PendingOffersList";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { GciProgress } from "@/components/dashboard/GciProgress";
import { FocusModeToggle } from "@/components/dashboard/FocusModeToggle";
import { NextAppointmentCard } from "@/components/shared/NextAppointmentCard";
import { StatCard } from "@/components/shared/StatCard";
import { ActivityTimeline } from "@/components/shared/ActivityTimeline";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard();
  const [focusMode, setFocusMode] = useState(false);

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <PageHeader title="Dashboard" />
        <div className="text-destructive mt-4">Failed to load dashboard data.</div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <SkeletonLoader variant="stat" className="h-8 w-48 p-0 border-0" />
            <SkeletonLoader variant="stat" className="h-4 w-32 p-0 border-0" />
          </div>
        </div>
        <SkeletonLoader variant="card" className="h-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SkeletonLoader variant="stat" />
          <SkeletonLoader variant="stat" />
          <SkeletonLoader variant="stat" />
          <SkeletonLoader variant="stat" />
        </div>
        <SkeletonLoader variant="card" className="h-48" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GreetingHeader />
        <div className="hidden md:block">
          <FocusModeToggle enabled={focusMode} onToggle={setFocusMode} />
        </div>
      </div>

      {/* Mobile: single column. Desktop: grid based on focus mode */}
      <div className={cn(
        "grid gap-6",
        focusMode ? "md:grid-cols-2" : "md:grid-cols-3"
      )}>
        
        {/* Left Column: Day at a glance */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold tracking-tight">Up Next</h2>
          <NextAppointmentCard 
            title="Listing Presentation"
            date="Today"
            time="2:00 PM - 3:30 PM"
            location="123 Main St, Springfield"
          />
          <div className="mt-8">
            <h2 className="text-lg font-semibold tracking-tight mb-4">Today's Timeline</h2>
            <ActivityTimeline items={data.activity} />
          </div>
        </div>

        {/* Middle Column: Work Queue */}
        <div className="space-y-6">
          <AttentionWidget 
            overdueTasks={data.overdueTasks}
            newLeadsCount={data.newLeads.length}
            pendingOffersCount={data.pendingOffers.length}
          />
          <NewLeadsList leads={data.newLeads} />
          <PendingOffersList offers={data.pendingOffers} />
        </div>

        {/* Right Column: Metrics (Hidden in Focus Mode) */}
        {!focusMode && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Active Leads" value={data.activeLeads} />
              <StatCard title="Active Deals" value={data.activeDeals} />
            </div>
            <PipelineChart data={data.pipelineData} />
            <GciProgress progress={data.gciProgress} />
          </div>
        )}
      </div>

      {/* Full width recent activity at bottom if not in focus mode */}
      {!focusMode && (
        <div className="pt-6 border-t border-border mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Pipeline Value" value={`$${(data.pipelineValue / 1000).toFixed(0)}k`} />
            <StatCard title="Closed MTD" value={data.closedMtd} />
          </div>
        </div>
      )}
    </div>
  );
}
