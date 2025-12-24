import { useState } from 'react';
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
import {
  Building2,
  FileText,
  Home,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calculator,
  ShoppingCart,
  Briefcase,
  HardHat,
  ArrowRightLeft,
  Shield,
  ChevronDown,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Department = 
  | 'Accounting'
  | 'Acquisitions'
  | 'Asset Management'
  | 'Construction'
  | 'Dispositions'
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
  { label: 'Acquisitions', icon: ShoppingCart },
  { label: 'Asset Management', icon: Briefcase },
  { label: 'Construction', icon: HardHat },
  { label: 'Dispositions', icon: FileText },
  { label: 'Transactions', icon: ArrowRightLeft },
  { label: 'Super Admin', icon: Shield },
];

// Navigation items with their associated departments
const navItems: NavItem[] = [
  { 
    title: 'Dispositions', 
    url: '/dispositions', 
    icon: FileText,
    departments: ['Dispositions', 'Asset Management', 'Super Admin'],
  },
  { 
    title: 'Properties', 
    url: '/properties', 
    icon: Home,
    departments: ['Asset Management', 'Acquisitions', 'Dispositions', 'Construction', 'Super Admin'],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('Super Admin');

  const isActive = (path: string) => {
    if (path === '/dispositions') {
      return location.pathname === path || location.pathname.startsWith('/dispositions/');
    }
    if (path === '/properties') {
      return location.pathname === path || location.pathname.startsWith('/properties/');
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
      <SidebarHeader className="border-b border-border h-20 flex items-center justify-center">
        <div className="flex items-center gap-3 px-2 w-full">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
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
        {/* Department Selector */}
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
            Department
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {collapsed ? (
              <div className="flex justify-center py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={selectedDepartment}
                >
                  <DepartmentIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Select
                value={selectedDepartment}
                onValueChange={(value) => setSelectedDepartment(value as Department)}
              >
                <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border">
                  <div className="flex items-center gap-2">
                    <DepartmentIcon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select department" />
                  </div>
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
        {(selectedDepartment === 'Dispositions' || selectedDepartment === 'Super Admin') && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
        <div className="flex items-center justify-between p-2">
          {!collapsed && <UserMenu />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
