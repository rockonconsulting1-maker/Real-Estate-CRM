import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Eye, FileText, TrendingUp } from "lucide-react";
import { Money } from "@/components/shared/Money";

export function ClientSellerPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4 text-accent-brand" />
            Listed Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Home className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">456 Skyline Ridge, Las Vegas</p>
              <p className="text-xs text-muted-foreground mb-2">3 Beds • 2.5 Baths • 2,800 Sqft</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-accent-brand"><Money amount={1250000} /></span>
                <Badge variant="secondary" className="text-[10px]">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Days on Market</span>
            </div>
            <p className="text-2xl font-bold tnum">14</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              <span className="text-xs">Total Showings</span>
            </div>
            <p className="text-2xl font-bold tnum">28</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-accent-brand" />
            Recent Showings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border-2 last:border-0">
                <div>
                  <p className="text-xs font-semibold">Today, 2:30 PM</p>
                  <p className="text-[10px] text-muted-foreground">Buyer: Sarah Johnson</p>
                </div>
                <Badge variant="outline" className="text-[10px]">Confirmed</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent-brand" />
            Incoming Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 rounded-lg border border-accent-brand/20 bg-accent-brand-soft">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-accent-brand">New Offer</p>
                <p className="text-xs font-bold"><Money amount={1225000} /></p>
              </div>
              <p className="text-[10px] text-foreground-2">Buyer: Michael Chen • Exp. in 4h</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
