import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useConvertToClient } from "@/hooks/useLeads";

const convertSchema = z.object({
  pipelineId: z.string().min(1, "Pipeline is required"),
  stageId: z.string().min(1, "Initial stage is required"),
  monetaryValue: z.string().optional(),
});

type ConvertFormValues = z.infer<typeof convertSchema>;

interface ConvertToClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
}

export function ConvertToClientModal({ open, onOpenChange, leadId }: ConvertToClientModalProps) {
  const { mutate: convert, isPending } = useConvertToClient();

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      pipelineId: "lsNchTsvghJQKPBYCS9Z", // Buyer Transaction default
      stageId: "prospecting",
      monetaryValue: "",
    },
  });

  const onSubmit = (data: ConvertFormValues) => {
    convert({
      leadId,
      pipelineId: data.pipelineId,
      stageId: data.stageId,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Client</DialogTitle>
          <DialogDescription>
            Move this lead into a transaction pipeline to track the deal progress.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="pipelineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Pipeline</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pipeline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lsNchTsvghJQKPBYCS9Z">Buyer Transaction</SelectItem>
                      <SelectItem value="F5uB4bZnB0M8YgJ86sLg">Seller Transaction</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monetaryValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Deal Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input className="pl-6" placeholder="0.00" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="px-0 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? "Converting..." : "Convert to Client"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
