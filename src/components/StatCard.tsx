import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon }: StatCardProps) {
  const changeColor = changeType === 'positive' ? 'text-success' : changeType === 'negative' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2 font-heading">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColor}`}>{change}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
    </div>
  );
}
