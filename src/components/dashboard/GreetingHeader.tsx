import { format } from "date-fns";

export function GreetingHeader() {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const dateStr = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{greeting}</h1>
      <p className="text-sm text-muted-foreground">{dateStr}</p>
    </div>
  );
}
