import { Contact } from "@/types";
import { Card } from "@/components/ui/card";

interface ContactDetailSectionsProps {
  contact: Contact;
}

export function ContactDetailSections({ contact }: ContactDetailSectionsProps) {
  const role = contact.role || "other";
  
  const showLeadInfo = role.includes("lead");
  const showVendorInfo = role === "vendor";
  const showSoiInfo = role === "soi";

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block mb-1">Phone</span>
            <span className="font-medium">{contact.phone || "—"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Email</span>
            <span className="font-medium">{contact.email || "—"}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground block mb-1">Address</span>
            <span className="font-medium">
              {[contact.address1, contact.city, contact.state, contact.postalCode].filter(Boolean).join(", ") || "—"}
            </span>
          </div>
        </div>
      </Card>

      {showLeadInfo && (
        <Card className="p-5">
          <h3 className="font-semibold text-lg mb-4">Lead Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">Source</span>
              <span className="font-medium">{contact.source || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Type</span>
              <span className="font-medium capitalize">{role.replace("_", " ")}</span>
            </div>
          </div>
        </Card>
      )}

      {showVendorInfo && (
        <Card className="p-5">
          <h3 className="font-semibold text-lg mb-4">Vendor Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">Company</span>
              <span className="font-medium">{contact.companyName || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Website</span>
              <span className="font-medium">{contact.website || "—"}</span>
            </div>
          </div>
        </Card>
      )}

      {showSoiInfo && (
        <Card className="p-5">
          <h3 className="font-semibold text-lg mb-4">SOI Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">Relationship</span>
              <span className="font-medium">Sphere of Influence</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
