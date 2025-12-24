import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Home,
  FileText,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';

// Mock KPI data
const kpiData = [
  {
    title: 'Total Portfolio Value',
    value: 45600000,
    change: 8.2,
    isPositive: true,
    icon: DollarSign,
    format: 'currency',
  },
  {
    title: 'Active Properties',
    value: 127,
    change: 3,
    isPositive: true,
    icon: Home,
    format: 'number',
  },
  {
    title: 'Active Dispositions',
    value: 12,
    change: -2,
    isPositive: false,
    icon: FileText,
    format: 'number',
  },
  {
    title: 'Avg. Occupancy Rate',
    value: 94.5,
    change: 1.2,
    isPositive: true,
    icon: Users,
    format: 'percent',
  },
];

// Monthly revenue data
const revenueData = [
  { month: 'Jan', revenue: 1850000, expenses: 420000 },
  { month: 'Feb', revenue: 1920000, expenses: 380000 },
  { month: 'Mar', revenue: 2100000, expenses: 450000 },
  { month: 'Apr', revenue: 1980000, expenses: 390000 },
  { month: 'May', revenue: 2250000, expenses: 410000 },
  { month: 'Jun', revenue: 2400000, expenses: 480000 },
  { month: 'Jul', revenue: 2350000, expenses: 440000 },
  { month: 'Aug', revenue: 2500000, expenses: 460000 },
  { month: 'Sep', revenue: 2450000, expenses: 430000 },
  { month: 'Oct', revenue: 2600000, expenses: 490000 },
  { month: 'Nov', revenue: 2750000, expenses: 520000 },
  { month: 'Dec', revenue: 2900000, expenses: 550000 },
];

// Property distribution by market
const marketDistribution = [
  { name: 'Phoenix', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Dallas', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Atlanta', value: 22, color: 'hsl(var(--chart-3))' },
  { name: 'Tampa', value: 15, color: 'hsl(var(--chart-4))' },
];

// Disposition pipeline data
const pipelineData = [
  { status: 'Draft', count: 5, value: 2400000 },
  { status: 'Under Review', count: 3, value: 1800000 },
  { status: 'Approved', count: 2, value: 950000 },
  { status: 'Listed', count: 2, value: 1200000 },
];

// Recent transactions
const recentTransactions = [
  {
    id: '1',
    property: '123 Oak Street',
    market: 'Phoenix',
    type: 'Sale',
    amount: 385000,
    date: '2024-12-20',
    status: 'Completed',
  },
  {
    id: '2',
    property: '456 Maple Avenue',
    market: 'Dallas',
    type: 'Acquisition',
    amount: 295000,
    date: '2024-12-18',
    status: 'Pending',
  },
  {
    id: '3',
    property: '789 Pine Lane',
    market: 'Atlanta',
    type: 'Sale',
    amount: 425000,
    date: '2024-12-15',
    status: 'Completed',
  },
  {
    id: '4',
    property: '321 Cedar Drive',
    market: 'Tampa',
    type: 'Acquisition',
    amount: 315000,
    date: '2024-12-12',
    status: 'Completed',
  },
  {
    id: '5',
    property: '654 Birch Court',
    market: 'Phoenix',
    type: 'Sale',
    amount: 365000,
    date: '2024-12-10',
    status: 'Pending',
  },
];

// Monthly performance trend
const performanceTrend = [
  { month: 'Jul', roi: 8.2, target: 7.5 },
  { month: 'Aug', roi: 8.5, target: 7.5 },
  { month: 'Sep', roi: 7.8, target: 7.5 },
  { month: 'Oct', roi: 9.1, target: 7.5 },
  { month: 'Nov', roi: 8.8, target: 7.5 },
  { month: 'Dec', roi: 9.4, target: 7.5 },
];

export default function Dashboard() {
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'percent':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 h-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-full px-6">
          <div className="flex h-full items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Portfolio overview and key metrics
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiData.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold">
                        {formatValue(kpi.value, kpi.format)}
                      </p>
                      <div className="flex items-center gap-1">
                        {kpi.isPositive ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-rose-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            kpi.isPositive ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {kpi.isPositive ? '+' : ''}
                          {kpi.change}
                          {kpi.format === 'percent' ? ' pts' : '%'}
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Expenses Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Expenses</CardTitle>
              <CardDescription>Monthly financial performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis 
                      className="text-xs" 
                      tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [formatCurrency(value), '']}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="hsl(var(--chart-1))"
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="hsl(var(--chart-2))"
                      fill="url(#expenseGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Market Distribution</CardTitle>
              <CardDescription>Properties by market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {marketDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value} properties`, '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Disposition Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Disposition Pipeline</CardTitle>
              <CardDescription>Properties by disposition status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipelineData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="status" type="category" className="text-xs" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'value') return [formatCurrency(value), 'Value'];
                        return [value, 'Count'];
                      }}
                    />
                    <Bar dataKey="count" name="Properties" fill="hsl(var(--chart-1))" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* ROI Performance */}
          <Card>
            <CardHeader>
              <CardTitle>ROI Performance</CardTitle>
              <CardDescription>Actual vs target return on investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      name="Actual ROI"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest property transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-table-header hover:bg-table-header">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Property
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Market
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                    Amount
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-table-hover">
                    <TableCell className="font-medium">{tx.property}</TableCell>
                    <TableCell className="text-muted-foreground">{tx.market}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'Sale' ? 'default' : 'secondary'}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'Completed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
