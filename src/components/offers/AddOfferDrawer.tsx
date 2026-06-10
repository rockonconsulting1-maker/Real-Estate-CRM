import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateOffer } from "@/hooks/useOffers";
import { toast } from "@/hooks/use-toast";

interface AddOfferDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId?: string;
  contactId?: string;
}

export function AddOfferDrawer({ open, onOpenChange, propertyId, contactId }: AddOfferDrawerProps) {
  const { mutate: createOffer, isPending } = useCreateOffer();
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [closingDate, setClosingDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !deposit) {
      toast({ title: "Validation Error", description: "Price and deposit are required", variant: "destructive" });
      return;
    }

    createOffer({
      purchase_price: parseFloat(price),
      deposit_amount: parseFloat(deposit),
      closing_date: closingDate,
      status: "draft",
      property_id: propertyId,
      buyer_id: contactId,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setPrice("");
        setDeposit("");
        setClosingDate("");
      }
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Create New Offer</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Purchase Price</Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="500000" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit Amount</Label>
              <Input 
                id="deposit" 
                type="number" 
                placeholder="25000" 
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing">Expected Closing Date</Label>
              <Input 
                id="closing" 
                type="date" 
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
              />
            </div>
            
            <DrawerFooter className="px-0 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Offer"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
