'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import PricingModal from '@/components/pricing-modal';
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
  X,
  RotateCcw
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  all_usage_data: Array<{
    endpoint_name: string;
    input_description: string;
    timestamp: string;
    status_code: number;
    response_time_ms: number;
    request_size_bytes: number;
    response_size_bytes: number;
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
    plan_limits: number | null;
    next_renewal: string;
    created_at: string;
  };
  filters: {
    timeRange: string;
    search: string;
    statusFilter: string;
    endpointFilter: string;
  };
  timezone: string;
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: '12 Hours', value: '12h', days: 0.5 },
  { label: '24 Hours', value: '24h', days: 1 },
  { label: '7 Days', value: '7d', days: 7 },
  { label: '30 Days', value: '30d', days: 30 },
  { label: '6 Months', value: '6m', days: 180 },
  { label: '12 Months', value: '12m', days: 365 },
];

const CHART_TYPES = [
  { label: 'Bar Chart', value: 'bar', icon: BarChart3 },
  { label: 'Line Chart', value: 'line', icon: TrendingUp },
];

// Separate Graph Component
const UsageGraphCard = () => {
  const { user } = useAuth();
  const [allUsageData, setAllUsageData] = useState<UsageData['all_usage_data']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('7d');

  const fetchGraphData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        timeRange,
      });
      
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 Frontend sending timezone (graph):', userTimezone);
      const response = await fetch(`/api/users/usage?${params}`, {
        credentials: 'include',
        headers: {
          'x-timezone': userTimezone
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch graph data`);
      }

      const data = await response.json();
      console.log('📊 Received all usage data:', data.all_usage_data?.length || 0, 'rows');
      setAllUsageData(data.all_usage_data || []);
    } catch (err) {
      console.error('Graph data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  }, [user, timeRange]);

  useEffect(() => {
    if (user) {
      fetchGraphData();
    }
  }, [user, fetchGraphData]);

  // Generate complete time series data with zero values for missing periods
  const generateCompleteTimeSeries = (data: UsageData['all_usage_data'], timeRange: string) => {
    const now = new Date();
    
    let startDate: Date;
    let interval: number;
    let periods: number;
    
    switch (timeRange) {
      case '12h':
        periods = 12;
        startDate = new Date(now.getTime() - 11 * 60 * 60 * 1000);
        interval = 60 * 60 * 1000;
        break;
      case '24h':
        periods = 24;
        startDate = new Date(now.getTime() - 23 * 60 * 60 * 1000);
        interval = 60 * 60 * 1000;
        break;
      case '7d':
        periods = 7;
        startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000;
        break;
      case '30d':
        periods = 30;
        startDate = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000;
        break;
      case '6m':
        periods = 6;
        startDate = new Date(now.getTime() - 5 * 30 * 24 * 60 * 60 * 1000);
        interval = 30 * 24 * 60 * 60 * 1000;
        break;
      case '12m':
        periods = 12;
        startDate = new Date(now.getTime() - 11 * 30 * 24 * 60 * 60 * 1000);
        interval = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        periods = 7;
        startDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        interval = 24 * 60 * 60 * 1000;
    }
    
    // Group the raw data by time buckets
    const dataMap = new Map();
    data.forEach((item: any) => {
      // The timestamp is already in user's timezone from the server
      // Parse it as local time, not UTC
      const timestamp = new Date(item.timestamp.replace(' ', 'T'));
      let timeBucket: string;
      
      if (timeRange === '12h' || timeRange === '24h') {
        // Group by hour
        const year = timestamp.getFullYear();
        const month = String(timestamp.getMonth() + 1).padStart(2, '0');
        const day = String(timestamp.getDate()).padStart(2, '0');
        const hour = String(timestamp.getHours()).padStart(2, '0');
        timeBucket = `${year}-${month}-${day} ${hour}:00:00`;
      } else if (timeRange === '6m' || timeRange === '12m') {
        // Group by month
        timeBucket = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Group by day - use local date, not UTC
        const year = timestamp.getFullYear();
        const month = String(timestamp.getMonth() + 1).padStart(2, '0');
        const day = String(timestamp.getDate()).padStart(2, '0');
        timeBucket = `${year}-${month}-${day}`;
      }
      
      if (!dataMap.has(timeBucket)) {
        dataMap.set(timeBucket, {
          call_count: 0,
          avg_response_time: 0,
          success_count: 0,
          total_response_time: 0,
          count: 0
        });
      }
      
      const bucket = dataMap.get(timeBucket);
      bucket.call_count++;
      bucket.total_response_time += item.response_time_ms;
      bucket.count++;
      if (item.status_code >= 200 && item.status_code < 300) {
        bucket.success_count++;
      }
    });
    
    // Calculate averages
    dataMap.forEach((bucket: any) => {
      bucket.avg_response_time = bucket.count > 0 ? bucket.total_response_time / bucket.count : 0;
    });
    
    const completeSeries = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < periods; i++) {
      let timeBucket: string;
      
      if (timeRange === '12h' || timeRange === '24h') {
        // Format as YYYY-MM-DD HH:00:00 for matching backend format
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hour = String(currentDate.getHours()).padStart(2, '0');
        timeBucket = `${year}-${month}-${day} ${hour}:00:00`;
      } else if (timeRange === '6m' || timeRange === '12m') {
        timeBucket = currentDate.toISOString().slice(0, 7);
      } else {
        // Use local date, not UTC
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        timeBucket = `${year}-${month}-${day}`;
      }
      
      const existingData = dataMap.get(timeBucket);
      completeSeries.push({
        time_bucket: timeBucket,
        call_count: existingData?.call_count || 0,
        avg_response_time: existingData?.avg_response_time || 0,
        success_count: existingData?.success_count || 0,
        timestamp: currentDate.getTime()
      });
      
      if (timeRange === '6m' || timeRange === '12m') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (timeRange === '7d') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate = new Date(currentDate.getTime() + interval);
      }
    }
    
    return completeSeries;
  };

      const UsageChart = ({ data }: { data: any[] }) => {
      const completeData = useMemo(() => generateCompleteTimeSeries(data, timeRange), [data, timeRange]);
      const [animatedData, setAnimatedData] = useState<typeof completeData>([]);
      const [isAnimating, setIsAnimating] = useState(false);
      
      // Animate bars when data changes
      useEffect(() => {
        if (completeData.length > 0) {
          setIsAnimating(true);
          // Start with zero heights
          setAnimatedData(completeData.map((item: any) => ({ ...item, call_count: 0 })));
          
          // Animate to actual values after a short delay
          const timer = setTimeout(() => {
            setAnimatedData(completeData);
            setIsAnimating(false);
          }, 100);
          
          return () => clearTimeout(timer);
        }
      }, [data, timeRange]); // Use stable dependencies instead of completeData
      
      if (!completeData || completeData.length === 0) {
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <BarChart3 className="h-8 w-8 mr-2" />
            No data available for selected time range
          </div>
        );
      }
    
          const actualMaxCalls = Math.max(...animatedData.map((d: any) => d.call_count), 0);
    
    let yAxisMax: number;
    let yAxisTicks: number[];
    
    if (actualMaxCalls === 0) {
      yAxisMax = 1;
      yAxisTicks = [0, 1];
    } else if (actualMaxCalls <= 4) {
      yAxisMax = 4;
      yAxisTicks = [0, 1, 2, 3, 4];
    } else if (actualMaxCalls <= 8) {
      yAxisMax = 8;
      yAxisTicks = [0, 2, 4, 6, 8];
    } else if (actualMaxCalls <= 20) {
      yAxisMax = 20;
      yAxisTicks = [0, 5, 10, 15, 20];
    } else if (actualMaxCalls <= 40) {
      yAxisMax = 40;
      yAxisTicks = [0, 10, 20, 30, 40];
    } else if (actualMaxCalls <= 80) {
      yAxisMax = 80;
      yAxisTicks = [0, 20, 40, 60, 80];
    } else if (actualMaxCalls <= 200) {
      yAxisMax = 200;
      yAxisTicks = [0, 50, 100, 150, 200];
    } else if (actualMaxCalls <= 400) {
      yAxisMax = 400;
      yAxisTicks = [0, 100, 200, 300, 400];
    } else if (actualMaxCalls <= 800) {
      yAxisMax = 800;
      yAxisTicks = [0, 200, 400, 600, 800];
    } else if (actualMaxCalls <= 2000) {
      yAxisMax = 2000;
      yAxisTicks = [0, 500, 1000, 1500, 2000];
    } else if (actualMaxCalls <= 5000) {
      yAxisMax = 5000;
      yAxisTicks = [0, 1250, 2500, 3750, 5000];
    } else if (actualMaxCalls <= 10000) {
      yAxisMax = 10000;
      yAxisTicks = [0, 2500, 5000, 7500, 10000];
    } else if (actualMaxCalls <= 25000) {
      yAxisMax = 25000;
      yAxisTicks = [0, 6250, 12500, 18750, 25000];
    } else if (actualMaxCalls <= 50000) {
      yAxisMax = 50000;
      yAxisTicks = [0, 12500, 25000, 37500, 50000];
    } else if (actualMaxCalls <= 100000) {
      yAxisMax = 100000;
      yAxisTicks = [0, 25000, 50000, 75000, 100000];
    } else if (actualMaxCalls <= 250000) {
      yAxisMax = 250000;
      yAxisTicks = [0, 62500, 125000, 187500, 250000];
    } else if (actualMaxCalls <= 500000) {
      yAxisMax = 500000;
      yAxisTicks = [0, 125000, 250000, 375000, 500000];
    } else if (actualMaxCalls <= 1000000) {
      yAxisMax = 1000000;
      yAxisTicks = [0, 250000, 500000, 750000, 1000000];
    } else {
      yAxisMax = Math.ceil(actualMaxCalls / 1000000) * 1000000;
      const step = yAxisMax / 4;
      yAxisTicks = Array.from({ length: 5 }, (_, i) => Math.round(i * step));
    }

    const formatTimeLabelWithMonth = (timeBucket: string, index: number) => {
      // Parse the time bucket and format for display without timezone conversion
      let date: Date;
      
      if (timeRange === '12h' || timeRange === '24h') {
        // For hourly data, timeBucket is "2024-01-15 14:00:00" format
        date = new Date(timeBucket.replace(' ', 'T'));
      } else if (timeRange === '6m' || timeRange === '12m') {
        // For monthly data, timeBucket is "2024-01" format
        const [year, month] = timeBucket.split('-');
        if (year && month) {
          date = new Date(parseInt(year), parseInt(month) - 1, 1);
        } else {
          date = new Date();
        }
      } else {
        // For daily data, timeBucket is "2024-01-15" format
        date = new Date(timeBucket + 'T00:00:00');
      }
      
      if (isNaN(date.getTime())) {
        return <div className="text-xs text-gray-500">{timeBucket}</div>;
      }
      
      if (timeRange === '30d') {
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString(undefined, { month: 'short' });
        
        if (dayNumber === 1 || dayNumber % 10 === 0) {
          return (
            <div className="text-xs text-gray-500">
              <div>{dayNumber}</div>
              <div className="text-gray-400">{monthName}</div>
            </div>
          );
        } else {
          return <div className="text-xs text-gray-500">{dayNumber}</div>;
        }
      } else if (timeRange === '24h') {
        const hour = date.getHours();
        const isAM = hour < 12;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        
        if (hour % 6 === 0) {
          return (
            <div className="text-xs text-gray-500">
              <div>{displayHour}</div>
              <div className="text-gray-400">{isAM ? 'AM' : 'PM'}</div>
            </div>
          );
        } else {
          return <div className="text-xs text-gray-500">{displayHour}</div>;
        }
      } else if (timeRange === '12h') {
        return <div className="text-xs text-gray-500">{date.toLocaleTimeString(undefined, { 
          hour: 'numeric',
          hour12: true 
        })}</div>;
      } else if (timeRange === '7d') {
        return <div className="text-xs text-gray-500">{date.toLocaleDateString(undefined, { 
          weekday: 'short'
        })}</div>;
      } else if (timeRange === '6m' || timeRange === '12m') {
        return <div className="text-xs text-gray-500">{date.toLocaleDateString(undefined, { month: 'short' })}</div>;
      } else {
        return <div className="text-xs text-gray-500">{date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric' 
        })}</div>;
      }
    };

    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 w-12">
            {yAxisTicks.slice().reverse().map((tick, index) => (
              <span key={index}>{tick}</span>
            ))}
          </div>

          <div className="ml-12 mt-4 h-56 flex items-end justify-between gap-1 relative">
            {animatedData.map((point: any, index: number) => {
              const heightPercentage = point.call_count > 0 ? (point.call_count / yAxisMax) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group h-full">
                  <div className="w-full h-full flex items-end relative">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all duration-1000 ease-out hover:from-emerald-600 hover:to-emerald-500 group-hover:shadow-lg relative"
                      style={{ 
                        height: `${heightPercentage}%`,
                        minHeight: heightPercentage > 0 ? '4px' : '0px'
                      }}
                      title={`${point.call_count} calls (${heightPercentage}% height)`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {point.call_count} calls
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute left-12 right-0 top-0 bottom-0 pointer-events-none">
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `100%` }}
              />
            ))}
          </div>
        </div>

        <div className="ml-12 mt-1 flex justify-between gap-1">
          {animatedData.map((point: any, index: number) => (
            <div key={index} className="flex-1 text-center">
              {formatTimeLabelWithMonth(point.time_bucket, index)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Usage Analytics</CardTitle>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <UsageChart data={[]} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Usage Analytics</CardTitle>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            <AlertTriangle className="h-8 w-8 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Usage Analytics</CardTitle>
          </div>
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
        </div>
      </CardHeader>
      <CardContent>
        <UsageChart data={allUsageData} />
      </CardContent>
    </Card>
  );
};

export default function UsagePage() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Handle pricing modal
  const handleOpenPricingModal = () => {
    setPricingModalOpen(true);
  };

  const handleClosePricingModal = () => {
    setPricingModalOpen(false);
  };

  const handlePlanSelect = async (plan: any) => {
    console.log("Selected plan:", plan);
    // Close the modal first
    setPricingModalOpen(false);
    
    // Only free plan selection is handled by the modal
    // All other plans will show the coming soon popup
  };

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
        timeRange: '7d', // Fixed time range for main data
        search: searchTerm,
        status: statusFilter,
        endpoint: endpointFilter,
        page: currentPage.toString(),
        limit: '20'
      });
      
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 Frontend sending timezone (usage):', userTimezone);
      const response = await fetch(`/api/users/usage?${params}`, {
        credentials: 'include',
        headers: {
          'x-timezone': userTimezone
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch usage data`);
      }

      const data = await response.json();
      console.log('📋 Received usage data:', data.usage_data?.length || 0, 'rows');
      console.log('📊 Received all usage data:', data.all_usage_data?.length || 0, 'rows');
      setUsageData(data);
    } catch (err) {
      console.error('Usage data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, searchTerm, statusFilter, endpointFilter, currentPage]);

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
    }, 30000);

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
    return dateString;
  };

  const formatDateForTable = (dateString: string) => {
    // The timestamp is already converted to local time by the server
    // Just format it nicely for display
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatDateForGraph = (dateString: string) => {
    return dateString;
  };

  const formatTimeForGraph = (dateString: string) => {
    return dateString;
  };

  const getRemainingCalls = () => {
    if (!usageData?.current_usage.limit) return 'Unlimited';
    const remaining = usageData.current_usage.limit - usageData.current_usage.current_usage;
    return Math.max(0, remaining);
  };

  const getNextRenewalDate = () => {
    if (!usageData?.plan_info.next_renewal) return 'N/A';
    return usageData!.plan_info.next_renewal;
  };

  const getDaysUntilRenewal = () => {
    if (!usageData?.plan_info.next_renewal) return 0;
    const renewal = new Date(usageData!.plan_info.next_renewal);
    const now = new Date();
    const diffTime = renewal.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

                  <div>
                    {usageData.plan_info.plan_type === 'free' ? (
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                        onClick={handleOpenPricingModal}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Upgrade to Pro
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={handleOpenPricingModal}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Manage Plan
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <UsageGraphCard />
          </div>

          <div className="flex-1 rounded-md border flex flex-col min-h-0">
            <div className="overflow-x-auto">
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Endpoint</TableHead>
                    <TableHead className="w-64">Description</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Response Time</TableHead>
                    <TableHead className="w-28">Request Size</TableHead>
                    <TableHead className="w-28">Response Size</TableHead>
                    <TableHead className="w-40">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="overflow-x-auto">
                {usageData.usage_data.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No usage data found.</p>
                  </div>
                )}
                <Table className="table-fixed w-full">
                  <TableBody>
                    {usageData.usage_data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="w-32">
                          <Badge variant="outline" className="capitalize">
                            {item.endpoint_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-64 max-w-xs">
                          {item.input_description && item.input_description.length > 50 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate">
                                    {item.input_description}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs whitespace-normal">
                                    {item.input_description}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="truncate">
                              {item.input_description || 'N/A'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="w-24">
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
                        <TableCell className="w-32">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {formatResponseTime(item.response_time_ms)}
                          </span>
                        </TableCell>
                        <TableCell className="w-28">
                          <span className="text-sm text-gray-500">
                            {formatFileSize(item.request_size_bytes || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="w-28">
                          <span className="text-sm text-gray-500">
                            {formatFileSize(item.response_size_bytes || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="w-40">
                          <span className="text-sm text-gray-500">
                            {formatDateForTable(item.timestamp)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={pricingModalOpen}
        onClose={handleClosePricingModal}
        onSelectPlan={handlePlanSelect}
        currentPlan={usageData?.plan_info?.plan_type}
        currentPlanLimits={usageData?.plan_info?.plan_limits}
        variant="upgrade"
      />
    </>
  );
} 