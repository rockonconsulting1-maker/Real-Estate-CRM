import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Home, FileText, CheckCircle2 } from "lucide-react";
import { Money } from "@/components/shared/Money";

export function ClientBuyerPanel() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="h-4 w-4 text-accent-brand" />
            Search Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-semibold"><Money amount={850000} /> - <Money amount={1100000} /></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pre-approval</p>
              <Badge variant="outline" className="mt-1 border-success text-success bg-success-soft">Verified</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Locations</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge variant="secondary">Summerlin</Badge>
              <Badge variant="secondary">Henderson</Badge>
              <Badge variant="secondary">Spring Valley</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Beds</p>
              <p className="text-sm font-medium">3+</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Baths</p>
              <p className="text-sm font-medium">2.5+</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sqft</p>
              <p className="text-sm font-medium">2,200+</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Home className="h-4 w-4 text-accent-brand" />
            Associated Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border-2 hover:bg-background-sunk cursor-pointer transition-colors">
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                  <Home className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">123 Luxury Ln, Las Vegas</p>
                  <p className="text-[10px] text-muted-foreground">Interested • Added 2d ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent-brand" />
            Offers Made
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-success-soft border border-success/20">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-success">Accepted</p>
                <p className="text-xs font-bold"><Money amount={925000} /></p>
              </div>
              <p className="text-[10px] text-foreground-2">789 Desert Wind Dr</p>
            </div>
            <div className="p-3 rounded-lg border border-border-2">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-bold text-muted-foreground">Rejected</p>
                <p className="text-xs font-bold"><Money amount={890000} /></p>
              </div>
              <p className="text-[10px] text-muted-foreground">456 Mountain View St</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
