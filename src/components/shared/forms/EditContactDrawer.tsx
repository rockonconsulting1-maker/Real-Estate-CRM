import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { FormField } from "@/components/shared/forms/FormField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useUpdateContact } from "@/hooks/useContacts";
import { useToast } from "@/hooks/use-toast";
import { Contact } from "@/types";
import { useEffect } from "react";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface EditContactDrawerProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactDrawer({ contact, open, onOpenChange }: EditContactDrawerProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: contact.email || "",
      phone: contact.phone || "",
      address1: contact.address1 || "",
      city: contact.city || "",
      state: contact.state || "",
      postalCode: contact.postalCode || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        address1: contact.address1 || "",
        city: contact.city || "",
        state: contact.state || "",
        postalCode: contact.postalCode || "",
      });
    }
  }, [contact, open, form]);

  const { mutate: updateContact, isPending } = useUpdateContact();
  const { toast } = useToast();

  const onSubmit = (data: FormValues) => {
    updateContact({ id: contact.id, data: data as any }, {
      onSuccess: () => {
        toast({ title: "Contact updated" });
        onOpenChange(false);
      },
      onError: () => {
        toast({ title: "Failed to update contact", variant: "destructive" });
      }
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Edit Contact</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" error={form.formState.errors.firstName?.message}>
              <input {...form.register("firstName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </FormField>
            <FormField label="Last Name" error={form.formState.errors.lastName?.message}>
              <input {...form.register("lastName")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </FormField>
          </div>
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <input type="email" {...form.register("email")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </FormField>
          <FormField label="Phone" error={form.formState.errors.phone?.message}>
            <input type="tel" {...form.register("phone")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </FormField>
          <FormField label="Address" error={form.formState.errors.address1?.message}>
            <input {...form.register("address1")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="City" className="col-span-1" error={form.formState.errors.city?.message}>
              <input {...form.register("city")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </FormField>
            <FormField label="State" className="col-span-1" error={form.formState.errors.state?.message}>
              <input {...form.register("state")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </FormField>
            <FormField label="ZIP" className="col-span-1" error={form.formState.errors.postalCode?.message}>
              <input {...form.register("postalCode")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-4 pb-8">
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>Save Changes</Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
