import React, { useMemo } from 'react';
import { useUIStore } from '@/store/useUIStore';

export const RuntimeTab: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);

  // Generate deterministic metrics based on the node ID for variety
  const metrics = useMemo(() => {
    if (!selectedNodeId) return null;
    
    // Hash helper
    let hash = 0;
    for (let i = 0; i < selectedNodeId.length; i++) {
      hash = selectedNodeId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const cpu = Math.abs((hash % 45) + 15); // 15% - 60%
    const memory = Math.abs(((hash >> 2) % 50) + 30); // 30% - 80%
    const uptimeDays = Math.abs((hash >> 4) % 90) + 5; // 5 - 95 days
    const uptimeHours = Math.abs((hash >> 6) % 24);
    
    // Last deployed relative date calculation
    const deployDaysAgo = Math.abs((hash >> 8) % 7) + 1; // 1 - 8 days ago
    const deployDate = new Date();
    deployDate.setDate(deployDate.getDate() - deployDaysAgo);
    deployDate.setHours(10, 32, 0, 0);

    return {
      cpu,
      memory,
      uptime: `${uptimeDays}d ${uptimeHours}h`,
      lastDeployed: deployDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    };
  }, [selectedNodeId]);

  if (!metrics) return null;

  return (
    <div className="space-y-4 p-4 select-none text-xs">
      {/* CPU Usage */}
      <div className="space-y-1.5">
        <div className="flex justify-between font-semibold">
          <span className="text-muted-foreground">CPU Usage</span>
          <span className="text-foreground">{metrics.cpu}%</span>
        </div>
        <div className="w-full h-2 bg-muted dark:bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${metrics.cpu}%` }}
          />
        </div>
      </div>

      {/* Memory Usage */}
      <div className="space-y-1.5">
        <div className="flex justify-between font-semibold">
          <span className="text-muted-foreground">Memory Usage</span>
          <span className="text-foreground">{metrics.memory}%</span>
        </div>
        <div className="w-full h-2 bg-muted dark:bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${metrics.memory}%` }}
          />
        </div>
      </div>

      {/* Grid for uptime & deploy */}
      <div className="h-[1px] w-full bg-border/40 my-2" />

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Uptime</span>
          <span className="text-foreground font-semibold">{metrics.uptime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground font-medium">Last Deployed</span>
          <span className="text-foreground font-semibold text-right">{metrics.lastDeployed}</span>
        </div>
      </div>
    </div>
  );
};
