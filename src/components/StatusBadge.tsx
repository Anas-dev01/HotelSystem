import { cn } from "@/lib/utils";

type StatusVariant = 'available' | 'occupied' | 'maintenance' | 'reserved' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'pending' | 'paid' | 'refunded' | 'partial';

const variantStyles: Record<StatusVariant, string> = {
  available: 'bg-success/10 text-success border-success/20',
  occupied: 'bg-info/10 text-info border-info/20',
  maintenance: 'bg-warning/10 text-warning border-warning/20',
  reserved: 'bg-accent/10 text-accent border-accent/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  'checked-in': 'bg-info/10 text-info border-info/20',
  'checked-out': 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
  refunded: 'bg-destructive/10 text-destructive border-destructive/20',
  partial: 'bg-warning/10 text-warning border-warning/20',
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
      variantStyles[status],
      className
    )}>
      {status.replace('-', ' ')}
    </span>
  );
}
