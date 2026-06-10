import { createContext, useContext } from 'react';
import { useAuth } from './AuthProvider';

export type PermissionAction = 
  | 'view_settings'
  | 'edit_settings'
  | 'manage_team'
  | 'write_contacts'
  | 'delete_contacts'
  | 'write_opportunities'
  | 'write_properties'
  | 'write_offers'
  | 'manage_calendar'
  | 'manage_tasks';

interface PermissionContextType {
  can: (action: PermissionAction) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  can: () => false,
});

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { role, permissionTemplate } = useAuth();

  const can = (action: PermissionAction): boolean => {
    if (role === 'agent') return true;
    
    // Assistant evaluation based on template
    switch (permissionTemplate) {
      case 'read_only':
        return false;
      
      case 'leads_calendar':
        if (action === 'write_contacts' || action === 'manage_calendar' || action === 'manage_tasks') return true;
        return false;

      case 'full_except_settings':
        if (action === 'view_settings' || action === 'edit_settings' || action === 'manage_team') return false;
        return true;

      case 'custom':
        return false;

      default:
        return false;
    }
  };

  return (
    <PermissionContext.Provider value={{ can }}>
      {children}
    </PermissionContext.Provider>
  );
}

export const useCan = (action: PermissionAction) => {
  const { can } = useContext(PermissionContext);
  return can(action);
};
