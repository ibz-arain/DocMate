'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  BarChart3, 
  Clock, 
  Activity, 
  Filter, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Database,
  Timer,
  Users,
  Target,
  Download,
  Upload,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Settings,
  BarChart,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Play,
  Pause,
  StopCircle,
  CalendarDays,
  CreditCard,
  Gauge,
  TrendingDown,
  Eye,
  EyeOff,
  Filter as FilterIcon,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { CustomSidebar } from '@/components/custom-sidebar';
import { cn } from '@/lib/utils';
import Head from 'next/head';

interface UsageData {
  current_usage: {
    current_usage: number;
    limit: number | null;
    is_over_limit: boolean;
    period_start: string;
    period_type: string;
  };
  graph_data: Array<{
    time_bucket: string;
    call_count: number;
    avg_response_time: number;
    success_count: number;
  }>;
  usage_data: Array<{
    endpoint_name: string;
    input_description: string;
    timestamp: string;
    status_code: number;
    response_time_ms: number;
    request_size_bytes: number;
    response_size_bytes: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  plan_info: {
    plan_type: string;
    next_renewal: string;
    created_at: string;
  };
  filters: {
    timeRange: string;
    graphType: string;
    search: string;
    statusFilter: string;
    endpointFilter: string;
  };
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: '12 Hours', value: '12h', days: 0.5 },
  { label: '24 Hours', value: '24h', days: 1 },
  { label: '3 Days', value: '3d', days: 3 },
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: 'This Month', value: 'month', days: 30 },
];

const GRAPH_TYPES = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];

export default function UsagePage() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [graphType, setGraphType] = useState<string>('hourly');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsageData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
        graphType,
        search: searchTerm,
        status: statusFilter,
        endpoint: endpointFilter,
        page: currentPage.toString(),
        limit: '20'
      });
      
      const response = await fetch(`/api/users/usage?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch usage data`);
      }

      const data = await response.json();
      setUsageData(data);
    } catch (err) {
      console.error('Usage data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, timeRange, graphType, searchTerm, statusFilter, endpointFilter, currentPage]);

  useEffect(() => {
    if (user) {
      fetchUsageData();
    }
  }, [user, fetchUsageData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchUsageData(true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchUsageData]);

  const getUsagePercentage = () => {
    if (!usageData?.current_usage.limit) return 0;
    return Math.min((usageData.current_usage.current_usage / usageData.current_usage.limit) * 100, 100);
  };

  const getStatusColor = (statusCode: number) => {
    return statusCode >= 200 && statusCode < 300 ? 'success' : 'error';
  };

  const getStatusText = (statusCode: number) => {
    return statusCode >= 200 && statusCode < 300 ? 'Success' : 'Error';
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRemainingCalls = () => {
    if (!usageData?.current_usage.limit) return 'Unlimited';
    const remaining = usageData.current_usage.limit - usageData.current_usage.current_usage;
    return Math.max(0, remaining);
  };

  const getNextRenewalDate = () => {
    if (!usageData?.plan_info.next_renewal) return 'N/A';
    return new Date(usageData.plan_info.next_renewal).toLocaleDateString();
  };

  const getDaysUntilRenewal = () => {
    if (!usageData?.plan_info.next_renewal) return 0;
    const renewal = new Date(usageData.plan_info.next_renewal);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };



  // Enhanced chart component
  const UsageChart = ({ data }: { data: UsageData['graph_data'] }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <BarChart3 className="h-8 w-8 mr-2" />
          No data available for selected time range
        </div>
      );
    }

    const maxCalls = Math.max(...data.map(d => d.call_count));
    const maxTime = Math.max(...data.map(d => d.avg_response_time));

    return (
      <div className="space-y-4">
        <div className="h-48 flex items-end justify-between gap-1">
          {data.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-200 hover:from-blue-600 hover:to-blue-400"
                   style={{ 
                     height: `${(point.call_count / maxCalls) * 100}%`,
                     minHeight: '4px'
                   }}>
              </div>
              <div className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                {graphType === 'hourly' 
                  ? new Date(point.time_bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : graphType === 'daily'
                  ? new Date(point.time_bucket).toLocaleDateString([], { month: 'short', day: 'numeric' })
                  : point.time_bucket
                }
              </div>
            </div>
          ))}
        </div>
        

      </div>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setEndpointFilter('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || endpointFilter !== 'all';

  if (loading) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="usage" />
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="space-y-6">
            {/* Top Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>

            {/* Bottom Table Skeleton */}
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="usage" />
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Usage Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchUsageData()}>Retry</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="usage" />
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">No Usage Data Available</h2>
              <p className="text-gray-500 mb-4">Start using the API to see your usage statistics.</p>
              <Button onClick={() => fetchUsageData()}>Refresh</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Usage Analytics | DocMate</title>
        <meta name="description" content="Monitor your API usage and track your plan limits" />
      </Head>
      <div className="flex h-full overflow-hidden bg-background">
        <CustomSidebar selectedType="usage" />
        <main className="flex-1 flex flex-col overflow-hidden p-6">
          {/* Top Row - Two Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Quick Stats Card */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Usage Overview</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchUsageData(true)}
                      disabled={isRefreshing}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      variant={autoRefresh ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className="h-8 w-8 p-0"
                    >
                      {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 space-y-6">
                {/* Main Usage Display */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-xl font-bold">
                          {usageData.current_usage.current_usage.toLocaleString()}
                          <span className="text-base font-normal text-muted-foreground ml-1">
                            / {usageData.current_usage.limit?.toLocaleString() || '∞'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">API calls this month</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-xl font-bold",
                        getUsagePercentage() > 80 ? 'text-destructive' : 'text-green-600 dark:text-green-400'
                      )}>
                        {getUsagePercentage().toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">used</div>
                    </div>
                  </div>

                  {/* Compact Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="text-muted-foreground">{getRemainingCalls()} remaining</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            getUsagePercentage() > 90 ? 'bg-destructive' :
                            getUsagePercentage() > 75 ? 'bg-yellow-500' :
                            getUsagePercentage() > 50 ? 'bg-orange-500' : 'bg-green-600 dark:bg-green-400'
                          )}
                          style={{ width: `${getUsagePercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Plan Info */}
                <div className="bg-gradient-to-br from-muted/50 to-primary/5 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">{usageData.plan_info.plan_type} Plan</div>
                        <div className="text-xs text-muted-foreground">
                          {usageData.current_usage.limit ? `${usageData.current_usage.limit.toLocaleString()} calls/month` : 'Unlimited'}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={usageData.plan_info.plan_type === 'free' ? 'secondary' : 'default'}
                      className="capitalize text-xs"
                    >
                      {usageData.plan_info.plan_type}
                    </Badge>
                  </div>

                  {/* Compact Renewal Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background/50 rounded-lg p-2 border">
                      <div className="flex items-center gap-1 mb-1">
                        <CalendarDays className="h-3 w-3 text-blue-500" />
                        <span className="text-xs font-medium">Renewal</span>
                      </div>
                      <div className="text-sm font-semibold">{getNextRenewalDate()}</div>
                    </div>
                    
                    <div className="bg-background/50 rounded-lg p-2 border">
                      <div className="flex items-center gap-1 mb-1">
                        <Gauge className="h-3 w-3 text-green-500" />
                        <span className="text-xs font-medium">Days Left</span>
                      </div>
                      <div className={cn(
                        "text-sm font-semibold",
                        getDaysUntilRenewal() <= 7 ? "text-destructive" : ""
                      )}>
                        {Math.max(0, getDaysUntilRenewal())} days
                      </div>
                    </div>
                  </div>

                  {/* Compact Action Button */}
                  <div>
                    {usageData.plan_info.plan_type === 'free' ? (
                      <Button size="sm" className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                        <Zap className="h-3 w-3 mr-1" />
                        Upgrade to Pro
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-3 w-3 mr-1" />
                        Manage Plan
                      </Button>
                    )}
                  </div>
                </div>


              </CardContent>
            </Card>

            {/* Graph Card */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Usage Analytics</CardTitle>
                    <CardDescription>API calls and performance metrics</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={graphType} onValueChange={setGraphType}>
                      <SelectTrigger className="w-[90px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRAPH_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UsageChart data={usageData.graph_data} />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Full-Width Table Card */}
          <Card className="flex-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Request History</CardTitle>
                  <CardDescription>Detailed API call logs with advanced filtering</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {usageData.pagination.total} total requests
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <FilterIcon className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                        !
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              {showFilters && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Advanced Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 px-2 text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search descriptions or endpoints..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-9"
                        />
                        {searchTerm && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Endpoint</label>
                      <Select value={endpointFilter} onValueChange={setEndpointFilter}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="All Endpoints" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Endpoints</SelectItem>
                          <SelectItem value="chat">Chat</SelectItem>
                          <SelectItem value="analyze">Analyze</SelectItem>
                          <SelectItem value="summarize">Summarize</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Request Size</TableHead>
                      <TableHead>Response Size</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageData.usage_data.map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.endpoint_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={item.input_description || 'N/A'}>
                            {item.input_description || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusColor(item.status_code) === 'success' ? 'default' : 'destructive'}
                            className="flex items-center gap-1"
                          >
                            {getStatusColor(item.status_code) === 'success' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {getStatusText(item.status_code)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {formatResponseTime(item.response_time_ms)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatFileSize(item.request_size_bytes || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatFileSize(item.response_size_bytes || 0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {formatDate(item.timestamp)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {usageData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((usageData.pagination.page - 1) * usageData.pagination.limit) + 1} to {Math.min(usageData.pagination.page * usageData.pagination.limit, usageData.pagination.total)} of {usageData.pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} of {usageData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === usageData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {usageData.usage_data.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No usage data found matching your filters.</p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
} 