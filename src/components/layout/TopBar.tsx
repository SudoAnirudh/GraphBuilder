import { Network, Minimize2, Plus, Bell, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/useUIStore';

export const TopBar: React.FC = () => {
  const triggerFitView = useUIStore((state) => state.triggerFitView);
  const triggerAddNode = useUIStore((state) => state.triggerAddNode);
  const toggleMobilePanel = useUIStore((state) => state.toggleMobilePanel);

  return (
    <header className="h-12 w-full border-b border-border bg-background flex items-center justify-between px-4 z-50 select-none">
      {/* Brand logo & name */}
      <div className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <span className="font-bold text-sm tracking-tight text-foreground">GraphBuilder</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Add Node button */}
        <Button
          variant="outline"
          size="sm"
          onClick={triggerAddNode}
          className="h-8 gap-1.5 text-xs font-medium text-primary border-primary/20 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Node</span>
        </Button>

        {/* Fit View button */}
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFitView}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <Minimize2 className="h-3.5 w-3.5" />
          <span>Fit View</span>
        </Button>

        {/* Notifications (placeholder) */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User avatar (placeholder) */}
        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
          <User className="h-4 w-4 text-primary" />
        </div>

        {/* Mobile menu button (< md) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobilePanel}
          className="h-8 w-8 md:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
