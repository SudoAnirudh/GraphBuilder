import React, { useState } from 'react';
import { Grid, GitBranch, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LeftRail: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apps' | 'graphs' | 'settings'>('apps');

  const navItems = [
    { id: 'apps', icon: Grid, label: 'Apps' },
    { id: 'graphs', icon: GitBranch, label: 'Graphs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <aside className="w-12 h-[calc(100vh-48px)] border-r border-border bg-card flex flex-col items-center py-3 gap-2 select-none z-10 hidden md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            className={cn(
              "p-2.5 rounded-lg transition-all text-muted-foreground hover:text-foreground relative group",
              isActive && "bg-primary/10 text-primary hover:text-primary hover:bg-primary/15"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="absolute left-14 bg-foreground text-background text-[10px] px-2 py-1 rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
