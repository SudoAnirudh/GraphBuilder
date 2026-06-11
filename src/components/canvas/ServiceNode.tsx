import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import type { ServiceNodeData } from '@/types';
import { cn } from '@/lib/utils';
import { Layers } from 'lucide-react';

export const ServiceNode: React.FC<NodeProps> = ({ data, selected }) => {
  const serviceData = data as unknown as ServiceNodeData;
  const { label, status, replicas } = serviceData;

  // Status-based color configuration
  const statusConfig = {
    Healthy: {
      border: 'border-emerald-500/70 dark:border-emerald-500/80',
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
      badge: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
    },
    Degraded: {
      border: 'border-amber-500/70 dark:border-amber-500/80',
      bg: 'bg-amber-50/80 dark:bg-amber-950/20',
      text: 'text-amber-700 dark:text-amber-400',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
      badge: 'bg-amber-100/80 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
    },
    Down: {
      border: 'border-rose-500/70 dark:border-rose-500/80',
      bg: 'bg-rose-50/80 dark:bg-rose-950/20',
      text: 'text-rose-700 dark:text-rose-400',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
      badge: 'bg-rose-100/80 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30',
    },
  }[status] || {
    border: 'border-border',
    bg: 'bg-card',
    text: 'text-foreground',
    dot: 'bg-muted-foreground',
    badge: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 w-52 select-none relative",
        statusConfig.border,
        statusConfig.bg,
        selected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] shadow-md z-30"
          : "hover:scale-[1.01] hover:shadow"
      )}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-border !border-2 !border-background hover:!bg-primary transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-border !border-2 !border-background hover:!bg-primary transition-colors"
      />

      {/* Node Content */}
      <div className="flex flex-col gap-2">
        {/* Status dot + Label */}
        <div className="flex items-start gap-2.5">
          <span className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", statusConfig.dot)} />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs text-foreground leading-tight truncate" title={label}>
              {label}
            </h4>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-border/40" />

        {/* Badges footer */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 h-4 border", statusConfig.badge)}>
            {status}
          </Badge>
          
          <div className="flex items-center gap-1 font-medium bg-muted/40 dark:bg-muted/10 border border-border/30 rounded px-1.5 py-0.5">
            <Layers className="h-2.5 w-2.5 text-muted-foreground" />
            <span>{replicas} {replicas === 1 ? 'replica' : 'replicas'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
