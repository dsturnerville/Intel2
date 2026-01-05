import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  FileText,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Briefcase,
  HardHat,
  ArrowRightLeft,
  Shield,
  LayoutDashboard,
  Wrench,
  ShoppingCart,
  MapPin,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Department = 
  | 'Accounting'
  | 'Asset Management'
  | 'Construction'
  | 'Property Management'
  | 'Transactions'
  | 'Super Admin';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  departments: Department[];
}

interface DepartmentConfig {
  label: Department;
  icon: LucideIcon;
}

const departments: DepartmentConfig[] = [
  { label: 'Accounting', icon: Calculator },
  { label: 'Asset Management', icon: Briefcase },
  { label: 'Construction', icon: HardHat },
  { label: 'Property Management', icon: Wrench },
  { label: 'Transactions', icon: ArrowRightLeft },
  { label: 'Super Admin', icon: Shield },
];

// Navigation items with their associated departments
const navItems: NavItem[] = [
  { 
    title: 'Acquisitions', 
    url: '/acquisitions', 
    icon: ShoppingCart,
    departments: ['Asset Management', 'Super Admin'],
  },
  { 
    title: 'Dispositions', 
    url: '/dispositions', 
    icon: FileText,
    departments: ['Asset Management', 'Super Admin'],
  },
  { 
    title: 'Properties', 
    url: '/properties', 
    icon: Home,
    departments: ['Asset Management', 'Property Management', 'Construction', 'Super Admin'],
  },
  { 
    title: 'Markets', 
    url: '/markets', 
    icon: MapPin,
    departments: ['Asset Management', 'Super Admin'],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const collapsed = state === 'collapsed';
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('Asset Management');
  const [departmentLoaded, setDepartmentLoaded] = useState(false);

  // Load user's default department on mount
  useEffect(() => {
    const loadDefaultDepartment = async () => {
      if (!user || departmentLoaded) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('default_department')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.default_department) {
          setSelectedDepartment(data.default_department as Department);
        }
      } catch (error) {
        console.error('Error loading default department:', error);
      } finally {
        setDepartmentLoaded(true);
      }
    };

    loadDefaultDepartment();
  }, [user, departmentLoaded]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    if (path === '/acquisitions') {
      return location.pathname === path || location.pathname.startsWith('/acquisitions/');
    }
    if (path === '/dispositions') {
      return location.pathname === path || location.pathname.startsWith('/dispositions/');
    }
    if (path === '/properties') {
      return location.pathname === path || location.pathname.startsWith('/properties/');
    }
    if (path === '/markets') {
      return location.pathname === path || location.pathname.startsWith('/markets/');
    }
    return location.pathname === path;
  };

  // Filter nav items based on selected department
  const filteredNavItems = navItems.filter(item => 
    item.departments.includes(selectedDepartment)
  );

  const selectedDepartmentConfig = departments.find(d => d.label === selectedDepartment);
  const DepartmentIcon = selectedDepartmentConfig?.icon || Building2;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border h-20 flex items-center justify-center px-3">
        <div className={cn(
          "flex items-center w-full",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shrink-0">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">DispoFlow</span>
              <span className="text-xs text-muted-foreground">Asset Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard Link */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard')}
                  tooltip="Dashboard"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Department Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
            Department
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {collapsed ? (
              <div className="flex justify-center py-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  title={selectedDepartment}
                >
                  <DepartmentIcon className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Select
                value={selectedDepartment}
                onValueChange={(value) => setSelectedDepartment(value as Department)}
              >
                <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50">
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <SelectItem key={dept.label} value={dept.label}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{dept.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions - show based on department */}
        {(selectedDepartment === 'Asset Management' || selectedDepartment === 'Super Admin') && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="New Acquisition">
                    <Link to="/acquisitions/new">
                      <Plus className="h-4 w-4" />
                      <span>New Acquisition</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="New Disposition">
                    <Link to="/dispositions/new">
                      <Plus className="h-4 w-4" />
                      <span>New Disposition</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <div className={cn(
          "flex items-center p-2",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && <UserMenu />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
