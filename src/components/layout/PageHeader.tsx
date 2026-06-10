import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h2 className="h2">{title}</h2>
        {description && <p className="text-muted-foreground caption mt-1">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
