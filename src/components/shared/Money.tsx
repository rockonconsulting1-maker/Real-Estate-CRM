import { money, shortMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MoneyProps {
  amount: number | null | undefined;
  short?: boolean;
  className?: string;
}

export function Money({ amount, short = false, className }: MoneyProps) {
  return (
    <span className={cn("tnum", className)}>
      {short ? shortMoney(amount) : money(amount)}
    </span>
  );
}
