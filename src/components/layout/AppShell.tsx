import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Settings, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { auth, signOut } from '@/firebase';
import { useAuth } from '@/App';

interface SidebarItemProps {
  icon: any;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, collapsed, onClick }: SidebarItemProps & { key?: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 group relative",
      active 
        ? "bg-primary text-primary-foreground shadow-sm" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )}
  >
    <Icon size={20} className={cn("shrink-0", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
    {!collapsed && (
      <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">
        {label}
      </span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
        {label}
      </div>
    )}
  </button>
);

export function AppShell({ children, activeTab, onTabChange }: { children: React.ReactNode, activeTab: string, onTabChange: (tab: string) => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'crm', label: 'Clientes', icon: Users },
    { id: 'sales', label: 'Pedidos de Venda', icon: ShoppingCart },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between h-16 border-b">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-xs">ERP</span>
              </div>
              <span>Nexus</span>
            </motion.div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <span className="text-primary-foreground text-[10px]">NX</span>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                collapsed={isCollapsed}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full flex justify-center"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu size={20} />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Busca global..." 
                className="pl-9 pr-4 py-1.5 bg-muted/50 border-none rounded-md text-sm w-64 focus:ring-1 focus:ring-primary outline-none transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    import('sonner').then(({ toast }) => {
                      toast.info(`Buscando por: ${e.currentTarget.value}`);
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" className="relative" onClick={() => {
              import('sonner').then(({ toast }) => toast.info('Nenhuma nova notificação.'));
            }}>
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </Button>
            
            <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Visitante'} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'V'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'Visitante'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || 'Acesso Público'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{user ? 'Perfil' : 'Fazer Login'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTabChange('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-card z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">ERP</span>
                  </div>
                  <span>Nexus</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <SidebarItem
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      active={activeTab === item.id}
                      collapsed={false}
                      onClick={() => {
                        onTabChange(item.id);
                        setIsMobileOpen(false);
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                  <LogOut size={20} className="mr-3" />
                  Sair
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
