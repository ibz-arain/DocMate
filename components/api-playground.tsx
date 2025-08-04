"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, X, Copy, Globe, Key, FileJson, ArrowRight, 
  Trash2, Settings, Link2, Variable, Lock, Search, Eye,
  Server, Webhook, RefreshCcw, Braces, FileText, MoreVertical, Clock,
  CheckCircle, Calendar, AlertCircle, Cpu, PlusCircle, Activity, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { nanoid } from "nanoid";

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'POST' | 'GET';
  status: 'active' | 'inactive';
  template_id: string | null;
  template_name?: string;
  api_key: string;
  auth_enabled: boolean;
  rate_limit_enabled: boolean;
  rate_limit_requests: number;
  rate_limit_period: 'second' | 'minute' | 'hour' | 'day';
  webhook_url: string | null;
  webhook_events: string | null;
  created_at: string;
  updated_at: string;
  last_used?: string;
  requests: number;
}

interface UsageStats {
  total_requests: number;
  avg_response_time: number;
  max_response_time: number;
  min_response_time: number;
  successful_requests: number;
  failed_requests: number;
  daily_usage: { date: string; count: number }[];
}

interface Template {
  id: string;
  user_id: number;
  name: string;
  tables: any;
  created_at: string;
  updated_at: string;
}

export function APIPlayground() {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newApiName, setNewApiName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageTimeframe, setUsageTimeframe] = useState<'24hours' | '7days' | '30days'>('7days');
  const [showCreateApiDialog, setShowCreateApiDialog] = useState(false);
  const [selectedTemplateForNewApi, setSelectedTemplateForNewApi] = useState<string>("");

  // Fetch endpoints
  const fetchEndpoints = async () => {
    try {
      const response = await fetch('/api/endpoints');
      if (!response.ok) throw new Error('Failed to fetch endpoints');
      const data = await response.json();
      setEndpoints(data);
      if (data.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast({
        title: "Error",
        description: "Failed to load endpoints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch templates
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Fetch usage statistics
  const fetchUsageStats = async (endpointId: string) => {
    try {
      let startDate = new Date();
      switch (usageTimeframe) {
        case '24hours':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const response = await fetch(`/api/endpoints_usage?endpointId=${endpointId}&startDate=${startDate.toISOString()}`, {
        headers: {
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
      if (!response.ok) throw new Error('Failed to fetch usage stats');
      const data = await response.json();
      setUsageStats(data.summary);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      toast({
        title: "Error",
        description: "Failed to load usage statistics. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEndpoints();
    fetchTemplates();
  }, []);

  // Fetch usage stats when endpoint or timeframe changes
  useEffect(() => {
    if (selectedEndpoint) {
      fetchUsageStats(selectedEndpoint);
    }
  }, [selectedEndpoint, usageTimeframe]);

  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
  };

  const formatDate = (dateString: string) => {
    // Convert UTC timestamp to user's local timezone
    const date = new Date(dateString + 'Z'); // Ensure UTC interpretation
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fullFormatDate = (dateString: string) => {
    // Convert UTC timestamp to user's local timezone
    const date = new Date(dateString + 'Z'); // Ensure UTC interpretation
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSelectedEndpoint = () => {
    return endpoints.find(endpoint => endpoint.id === selectedEndpoint);
  };

  // Add a new function to handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Remove the template from the list and update selected template if needed
      setTemplates(prev => {
        const filtered = prev.filter(t => t.id !== templateId);
        
        // If we deleted the currently selected template, select another one if available
        if (selectedTemplate?.id === templateId && filtered.length > 0) {
          setSelectedTemplate(filtered[0]);
        } else if (filtered.length === 0) {
          setSelectedTemplate(null);
        }
        
        return filtered;
      });

      toast({
        title: "Template deleted",
        description: "Template has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleCopy = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: description,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleRegenerateKey = async () => {
    if (!selectedEndpoint) return;

    try {
      const newApiKey = `docm_${Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      const response = await fetch(`/api/endpoints?id=${selectedEndpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: newApiKey
        }),
      });

      if (!response.ok) throw new Error('Failed to regenerate API key');
      
      await fetchEndpoints(); // Refresh the endpoints list
      setShowRegenerateDialog(false);
      setShowApiKey(true);
      
      toast({
        title: "API Key Regenerated",
        description: "Your new API key has been generated. Make sure to update your applications.",
      });
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShowEditNameDialog = () => {
    setNewApiName(getSelectedEndpoint()?.name || "");
    setShowEditNameDialog(true);
  };

  const handleEditName = async () => {
    if (!selectedEndpoint || !newApiName.trim()) {
      toast({
        title: "Invalid name",
        description: "API name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      await handleUpdateEndpointSettings({ name: newApiName.trim() });
      setShowEditNameDialog(false);
      setNewApiName("");
    } catch (error) {
      console.error('Error updating API name:', error);
      toast({
        title: "Error",
        description: "Failed to update API name. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApi = async () => {
    if (!selectedEndpoint) return;

    try {
      const response = await fetch(`/api/endpoints?id=${selectedEndpoint}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete API');
      
      setShowDeleteDialog(false);
      setSelectedEndpoint(null);
      await fetchEndpoints(); // Refresh the endpoints list
      
      toast({
        title: "API deleted",
        description: "The API has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting API:', error);
      toast({
        title: "Error",
        description: "Failed to delete API. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEndpointSettings = async (settings: Partial<APIEndpoint>) => {
    if (!selectedEndpoint) return;

    try {
      const response = await fetch(`/api/endpoints?id=${selectedEndpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update API settings');
      
      await fetchEndpoints(); // Refresh the endpoints list
      
      toast({
        title: "Settings updated",
        description: "API settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating API settings:', error);
      toast({
        title: "Error",
        description: "Failed to update API settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateApi = async () => {
    if (!newApiName.trim() || !selectedTemplateForNewApi) {
      toast({
        title: "Missing required fields",
        description: "Please enter an API name and select a template",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a unique ID for the API
      const apiId = nanoid();
      
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: apiId,
          name: newApiName.trim(),
          path: `/api/analyze/${apiId}`,
          method: "POST",
          status: "active",
          template_id: selectedTemplateForNewApi,
          auth_enabled: true,
          rate_limit_enabled: true,
          rate_limit_requests: 100,
          rate_limit_period: "minute"
        }),
      });

      if (!response.ok) throw new Error('Failed to create API');
      
      const newEndpoint = await response.json();
      await fetchEndpoints(); // Refresh the endpoints list
      setShowCreateApiDialog(false);
      setNewApiName("");
      setSelectedTemplateForNewApi("");
      setSelectedEndpoint(apiId);
      
      toast({
        title: "API created",
        description: "Your new API has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating API:', error);
      toast({
        title: "Error",
        description: "Failed to create API. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      <div className="grid h-full grid-cols-[300px_1fr] gap-6">
        {/* Left Sidebar - API List */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search APIs..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          
          {/* API List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <>
                  {endpoints
                    .filter(endpoint => 
                      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      endpoint.id.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((endpoint) => (
                      <Card 
                        key={endpoint.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-all overflow-hidden border-l-4",
                          selectedEndpoint === endpoint.id ? "bg-muted/50 border-l-primary" : "border-l-1"
                        )}
                        onClick={() => setSelectedEndpoint(endpoint.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "p-1.5 rounded-md",
                                endpoint.method === 'GET' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                              )}>
                                {endpoint.method === 'GET' ? (
                                  <Server className="h-3.5 w-3.5" />
                                ) : (
                                  <Webhook className="h-3.5 w-3.5" />
                                )}
                              </div>
                              <span className="font-medium truncate">{endpoint.name}</span>
                            </div>
                            <Badge 
                              variant={endpoint.status === 'active' ? 'default' : 'secondary'}
                              className={cn(
                                "text-xs",
                                endpoint.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                              )}
                            >
                              {endpoint.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono truncate">
                            {endpoint.id}
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>{usageStats?.total_requests || 0} requests</span>
                            <span>{endpoint.last_used ? formatDate(endpoint.last_used) : 'Never used'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {/* Add New API Card */}
                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-all border-dashed flex items-center justify-center p-3"
                    onClick={() => setShowCreateApiDialog(true)}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <PlusCircle className="h-4 w-4" />
                      <span>Add New API</span>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Main Content Area - API Details */}
        <Card className="flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedEndpoint && getSelectedEndpoint() ? (
              <motion.div
                key={selectedEndpoint}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                {/* Sticky Header */}
                <CardHeader className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{getSelectedEndpoint()?.name}</h1>
                        <Badge 
                          variant={getSelectedEndpoint()?.status === 'active' ? 'default' : 'secondary'}
                          className={cn(
                            getSelectedEndpoint()?.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          {getSelectedEndpoint()?.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline">{getSelectedEndpoint()?.method}</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {getSelectedEndpoint()?.path}
                      </code>
                    </div>
                </div>
                </CardHeader>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 pt-4">
                    {/* API Details Sections */}
                    <div className="grid gap-6">
                      {/* API Key Management */}
                      <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Key className="h-5 w-5" /> Environment Variables
                        </h2>
                        <Card>
                          <CardContent className="p-4 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label>API Key</Label>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowRegenerateDialog(true)}
                              >
                                <RefreshCcw className="h-4 w-4" /> Regenerate
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <code className="text-sm flex-1 text-muted-foreground font-mono">
                                {showApiKey ? getSelectedEndpoint()?.api_key : "docm_••••••••••••••••••••••••••••••••"}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  if (showApiKey) {
                                    if (getSelectedEndpoint()?.api_key) {
                                      handleCopy(getSelectedEndpoint()?.api_key || "", "API key copied to clipboard");
                                    }
                                  } else {
                                    setShowApiKey(true);
                                  }
                                }}
                              >
                                {showApiKey ? (
                                  <Copy className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">Use this key to authenticate requests to this API endpoint</p>
                            <div>
                              <div className="flex items-center gap-2 mt-4 space-y-1">
                                <Label>API Endpoint URL</Label>
                                <Badge variant="outline" className="text-xs">Public</Badge>
          </div>
                              <div className="flex items-center gap-2 p-2 mt-1 bg-muted rounded-md">
                                <code className="text-sm flex-1 text-muted-foreground font-mono">
                                  https://docmate-beta.vercel.app{getSelectedEndpoint()?.path}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const url = `https://docmate-beta.vercel.app${getSelectedEndpoint()?.path}`;
                                    handleCopy(url, "API URL copied to clipboard");
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </section>

                      {/* Template Selection */}
                      <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5" /> Template Configuration
                        </h2>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div>
                              <Label>Selected Template</Label>
                              {isLoadingTemplates ? (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                  <span className="text-sm text-muted-foreground">Loading templates...</span>
                                </div>
                              ) : (
                                <>
                                  <Select 
                                    value={getSelectedEndpoint()?.template_id || templates[0]?.id} 
                                    onValueChange={async (value) => {
                                      const template = templates.find(t => t.id === value);
                                      if (template) {
                                        setSelectedTemplate(template);
                                        await handleUpdateEndpointSettings({
                                          template_id: value
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                          {template.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {templates.length === 0 && (
                                    <p className="text-sm text-destructive mt-2">
                                      You must create a template before creating an API endpoint
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {selectedTemplate && (
                              <div>
                                <div className="rounded-md border mt-2 overflow-hidden">
                                  <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                                    <div className="font-medium text-sm">Template Schema</div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        Updated {new Date(selectedTemplate.updated_at).toLocaleDateString()}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  <div className="divide-y">
                                    {selectedTemplate.tables && Array.isArray(JSON.parse(selectedTemplate.tables)) && 
                                      JSON.parse(selectedTemplate.tables).map((table: any, tableIndex: number) => (
                                        <div key={tableIndex} className="p-4">
                                          <div className="flex items-center gap-2 mb-2">
                                            <div className="font-medium">{table.name}</div>
                                            <Badge variant="outline" className="text-xs capitalize">{table.type}</Badge>
                                          </div>
                                          
                                          <div className="mt-2 rounded-md border overflow-hidden">
                                            <table className="w-full text-sm">
                                              <thead className="bg-muted/50">
                                                <tr>
                                                  <th className="py-2 px-3 text-left font-medium">Field</th>
                                                  <th className="py-2 px-3 text-left font-medium">Type</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {table.fields?.map((field: any, fieldIndex: number) => (
                                                  <tr key={fieldIndex} className="border-t">
                                                    <td className="py-2 px-3 font-mono">{field.name}</td>
                                                    <td className="py-2 px-3">
                                                      <Badge variant="secondary" className="font-mono text-xs">
                                                        {field.type}
                                                      </Badge>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      ))
                                    }
                                    
                                    {selectedTemplate.tables && (!Array.isArray(JSON.parse(selectedTemplate.tables)) || 
                                      JSON.parse(selectedTemplate.tables).length === 0) && (
                                      <div className="p-4 text-center text-muted-foreground">
                                        This template doesn't contain any tables or fields.
                                      </div>
                                    )}
                                    
                                    {!selectedTemplate.tables && (
                                      <div className="p-4 text-center text-muted-foreground">
                                        No schema information available for this template.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {templates.length === 0 && !isLoadingTemplates && (
                              <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed rounded-lg">
                                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                                <h3 className="font-medium mb-1">No Templates Available</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Create your first template to get started with API configuration.
                                </p>
                                <Button>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Create Template
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </section>

                      {/* Usage & Rate Limiting */}
                      <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Activity className="h-5 w-5" /> Usage & Rate Limiting
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium">Current Period Usage</div>
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                  {usageStats?.total_requests || 0}/{getSelectedEndpoint()?.rate_limit_requests || 100}
                                </Badge>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2 mb-1">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(
                                      ((usageStats?.total_requests || 0) / (getSelectedEndpoint()?.rate_limit_requests || 100)) * 100,
                                      100
                                    )}%` 
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {usageStats?.total_requests || 0} requests in the last {usageTimeframe}
                              </p>
                            </CardContent>
                          </Card>
                          
                          <Card className="md:col-span-2">
                            <CardContent className="p-4">
                              <div className="space-y-4">
                <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <Label>Rate Limiting</Label>
                                    <p className="text-sm text-muted-foreground">Limit the number of requests in a time period</p>
                </div>
                                  <Switch 
                                    checked={!!getSelectedEndpoint()?.rate_limit_enabled}
                                    onCheckedChange={(checked) => {
                                      handleUpdateEndpointSettings({
                                        rate_limit_enabled: checked
                                      });
                                    }}
                                  />
                </div>
                                
                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Max Requests</Label>
                                    <Input 
                                      type="number" 
                                      defaultValue={getSelectedEndpoint()?.rate_limit_requests || 100}
                                      onBlur={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value) && value > 0) {
                                          handleUpdateEndpointSettings({
                                            rate_limit_requests: value
                                          });
                                        }
                                      }}
                                      className="mt-1" 
                                    />
                                  </div>
                                  <div>
                                    <Label>Time Period</Label>
                                    <Select 
                                      value={getSelectedEndpoint()?.rate_limit_period || "minute"}
                                      onValueChange={(value: 'second' | 'minute' | 'hour' | 'day') => {
                                        handleUpdateEndpointSettings({
                                          rate_limit_period: value
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="second">Per Second</SelectItem>
                      <SelectItem value="minute">Per Minute</SelectItem>
                      <SelectItem value="hour">Per Hour</SelectItem>
                      <SelectItem value="day">Per Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </section>

                      {/* Usage Analytics */}
                      <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" /> Usage Analytics
                        </h2>
                  <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-6">
                              <div className="text-sm font-medium">Request Volume</div>
                              <Select 
                                value={usageTimeframe}
                                onValueChange={(value: "24hours" | "7days" | "30days") => setUsageTimeframe(value)}
                              >
                                <SelectTrigger className="h-8 w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                                  <SelectItem value="7days">Last 7 Days</SelectItem>
                                  <SelectItem value="30days">Last 30 Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Simple chart placeholder */}
                            <div className="w-full h-[180px] relative">
                              <div className="absolute inset-0 flex items-end justify-between px-2">
                                {Array.from({ length: 7 }).map((_, i) => {
                                  const date = new Date();
                                  date.setDate(date.getDate() - (6 - i));
                                  const dateStr = date.toISOString().split('T')[0];
                                  
                                  // Find usage data for this date
                                  const dayUsage = usageStats?.daily_usage?.find(
                                    (day: any) => day.date === dateStr
                                  ) || { count: 0 };
                                  
                                  // Calculate max height based on the highest usage
                                  const maxUsage = Math.max(
                                    ...(usageStats?.daily_usage?.map((d: any) => d.count) || [0])
                                  );
                                  
                                  const height = maxUsage > 0 
                                    ? (dayUsage.count / maxUsage) * 100 
                                    : 0;
                                  
                                  return (
                                    <div 
                                      key={i} 
                                      className="w-8 bg-primary/80 rounded-t" 
                                      style={{ 
                                        height: `${height}%`,
                                        opacity: i === 6 ? 1 : 0.7 - (6-i)*0.1
                                      }}
                                    ></div>
                                  );
                                })}
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 h-px bg-muted"></div>
                            </div>
                            
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              {Array.from({ length: 7 }).map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - i));
                                return (
                                  <div key={i}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                  </div>
                                );
                              })}
                            </div>
                            
                            <div className="mt-6 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Total Requests</div>
                                <div className="text-2xl font-bold">{usageStats?.total_requests?.toLocaleString() || '0'}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Average Response Time</div>
                                <div className="text-2xl font-bold">
                                  {usageStats?.avg_response_time ? `${Math.round(usageStats.avg_response_time)}ms` : '0ms'}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground">Successful Requests</div>
                                <div className="text-2xl font-bold text-green-600">
                                  {usageStats?.successful_requests?.toLocaleString() || '0'}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Failed Requests</div>
                                <div className="text-2xl font-bold text-red-600">
                                  {usageStats?.failed_requests?.toLocaleString() || '0'}
                                </div>
                              </div>
                            </div>
                    </CardContent>
                  </Card>
                      </section>

                      {/* Advanced Settings - replaced with Danger Zone */}
                      <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" /> Danger Zone
                        </h2>
                        <Card className="border-destructive/20">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between py-3 border-b">
                              <div>
                                <h3 className="font-medium mb-1">Edit API Name</h3>
                                <p className="text-sm text-muted-foreground">
                                  Change the display name of this API
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                onClick={handleShowEditNameDialog}
                              >
                                Edit Name
                              </Button>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                              <div>
                                <h3 className="font-medium text-destructive mb-1">Delete this API</h3>
                                <p className="text-sm text-muted-foreground">
                                  Permanently delete this API and all its data
                                </p>
                              </div>
                              <Button 
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                              >
                                Delete API
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </section>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <AlertCircle className="mx-auto h-10 w-10 mb-4" />
                  <p>Select an API to view details</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Delete Template Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate API Key Confirmation Dialog */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate your current API key. All applications using the current key will need to be updated with the new key. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRegenerateKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Regenerate Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit API Name Dialog */}
      <AlertDialog open={showEditNameDialog} onOpenChange={(open) => {
        if (!open) setNewApiName("");
        setShowEditNameDialog(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit API Name</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for your API. This will only change how the API is displayed in the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="apiName">API Name</Label>
            <Input
              id="apiName"
              value={newApiName}
              onChange={(e) => setNewApiName(e.target.value)}
              placeholder="Enter new API name"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewApiName("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditName}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete API Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this API
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteApi}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete API
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create API Dialog */}
      <AlertDialog open={showCreateApiDialog} onOpenChange={setShowCreateApiDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New API</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details for your new API endpoint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiName">API Name</Label>
              <Input
                id="apiName"
                value={newApiName}
                onChange={(e) => setNewApiName(e.target.value)}
                placeholder="Enter API name"
              />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select 
                value={selectedTemplateForNewApi} 
                onValueChange={setSelectedTemplateForNewApi}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setNewApiName("");
              setSelectedTemplateForNewApi("");
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateApi}>Create API</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 