import { Offer } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OfferCard } from "./OfferCard";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface OfferAccordionGroupProps {
  groups: {
    id: string;
    name: string;
    offers: Offer[];
  }[];
  isLoading?: boolean;
}

export function OfferAccordionGroup({ groups, isLoading }: OfferAccordionGroupProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-md" />
      ))}
    </div>;
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {groups.map((group) => {
        const activeNegotiations = group.offers.filter(o => o.status === "negotiating").length;
        
        return (
          <AccordionItem 
            key={group.id} 
            value={group.id} 
            className="border rounded-lg px-4 bg-card"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium">{group.name}</span>
                <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[10px]">
                  {group.offers.length}
                </Badge>
                {activeNegotiations > 0 && (
                  <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[10px] bg-success-soft text-success border-success/20">
                    {activeNegotiations} Active
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {group.offers.map((offer) => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    onClick={() => navigate(`/offers/${offer.id}`)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
