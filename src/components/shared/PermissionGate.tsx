import { ReactNode } from "react";
import { useCan, PermissionAction } from "@/providers/PermissionProvider";

interface PermissionGateProps {
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ action, children, fallback = null }: PermissionGateProps) {
  const can = useCan(action);

  if (!can) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
