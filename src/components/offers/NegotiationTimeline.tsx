import { Offer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, MessageSquare } from "lucide-react";
import { money } from "@/lib/format";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface NegotiationTimelineProps {
  offer: Offer;
}

// Mock negotiation events since they aren't explicitly in the DTO but implied by the PRD
const MOCK_EVENTS = [
  { id: "1", type: "initial", amount: 450000, date: "2024-05-10T10:00:00Z", label: "Initial Offer" },
  { id: "2", type: "counter", amount: 475000, date: "2024-05-11T14:30:00Z", label: "Seller Counter" },
  { id: "3", type: "revision", amount: 465000, date: "2024-05-12T09:15:00Z", label: "Buyer Revision" },
  { id: "4", type: "counter", amount: 470000, date: "2024-05-13T16:45:00Z", label: "Seller Counter" },
  { id: "5", type: "acceptance", amount: 470000, date: "2024-05-14T11:00:00Z", label: "Offer Accepted" },
];

export function NegotiationTimeline({ offer }: NegotiationTimelineProps) {
  // In a real app, these would come from the offer's history or associated tasks/notes
  const events = MOCK_EVENTS;
  
  const chartData = events.map(e => ({
    amount: e.amount,
    date: format(new Date(e.date), "MMM d"),
  }));

  const getIcon = (type: string) => {
    switch (type) {
      case "initial": return <MessageSquare className="w-4 h-4" />;
      case "counter": return <ArrowUpRight className="w-4 h-4 text-warning" />;
      case "revision": return <ArrowDownRight className="w-4 h-4 text-info" />;
      case "acceptance": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "rejection": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Negotiation Timeline</CardTitle>
          <div className="h-8 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  strokeWidth={2}
                />
                <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {events.map((event, idx) => (
            <div key={event.id} className="relative flex items-start gap-4">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10",
                event.type === 'acceptance' ? "border-success/50 bg-success-soft" : ""
              )}>
                {getIcon(event.type)}
              </div>
              <div className="flex flex-col pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{event.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(event.date), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="text-sm font-medium text-primary mt-0.5">
                  {money(event.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
