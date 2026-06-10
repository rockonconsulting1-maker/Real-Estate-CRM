import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface PipelineChartProps {
  data: any[];
  className?: string;
}

const COLORS = [
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--primary))",
];

export function PipelineChart({ data, className }: PipelineChartProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Pipeline Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center min-h-[200px]">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--foreground))"
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-muted-foreground">No pipeline data.</div>
        )}
      </CardContent>
    </Card>
  );
}
