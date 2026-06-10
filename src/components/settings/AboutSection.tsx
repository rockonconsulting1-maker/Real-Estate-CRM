import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AboutSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
        <CardDescription>Application information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Version</span>
          <span className="font-medium">1.0.0</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Release Channel</span>
          <span className="font-medium">Stable</span>
        </div>
      </CardContent>
    </Card>
  );
}
