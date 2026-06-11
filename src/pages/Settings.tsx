import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { BusinessDetailsSection } from "@/components/settings/BusinessDetailsSection";
import { TeamSection } from "@/components/settings/TeamSection";
import { IntegrationSection } from "@/components/settings/IntegrationSection";
import { AboutSection } from "@/components/settings/AboutSection";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PipelineMappingSection } from "@/components/settings/PipelineMappingSection";

export default function Settings() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Settings" />
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <ProfileSection />
          
          <PermissionGate action="view_settings">
            <BusinessDetailsSection />
          </PermissionGate>
          
          <PermissionGate action="manage_team">
            <TeamSection />
          </PermissionGate>
          
          <PermissionGate action="view_settings">
            <IntegrationSection />
          </PermissionGate>

          <PermissionGate action="view_settings">
            <PipelineMappingSection />
          </PermissionGate>
          
          <AboutSection />
        </div>
      </div>
    </div>
  );
}
