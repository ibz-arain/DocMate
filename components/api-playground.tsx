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

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'POST' | 'GET';
  status: 'active' | 'inactive';
  lastUsed?: string;
  requests: number;
  createdAt: string;
  api_key: string;
  settings: {
    auth: boolean;
    rateLimit?: {
      requests: number;
      period: 'second' | 'minute' | 'hour' | 'day';
    };
    webhook?: {
      url: string;
      events: string[];
    };
    envVariables: { key: string; value: string; isSecret: boolean }[];
  };
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
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(true);
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
  const [currentApiKey, setCurrentApiKey] = useState<string | null>(null);
  const [endpointUsage, setEndpointUsage] = useState<any>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  // Fetch endpoints when component mounts
  useEffect(() => {
    fetchEndpoints();
  }, []);

  // Fetch templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
        }
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

    fetchTemplates();
  }, []);

  // Fetch usage data when an endpoint is selected
  useEffect(() => {
    if (selectedEndpoint) {
      fetchEndpointUsage(selectedEndpoint);
    }
  }, [selectedEndpoint]);

  // Initialize new API name when endpoint changes
  useEffect(() => {
    if (selectedEndpoint) {
      const endpoint = endpoints.find(ep => ep.id === selectedEndpoint);
      if (endpoint) {
        setNewApiName(endpoint.name);
        setCurrentApiKey(endpoint.api_key);
      }
    }
  }, [selectedEndpoint, endpoints]);

  // Fetch endpoints from API
  const fetchEndpoints = async () => {
    setIsLoadingEndpoints(true);
    try {
      const response = await fetch('/api/endpoints');
      if (!response.ok) {
        throw new Error('Failed to fetch endpoints');
      }
      const data = await response.json();
      
      // Transform API data to match our interface
      const transformedEndpoints: APIEndpoint[] = data.map((endpoint: any) => ({
        id: endpoint.id,
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: endpoint.status,
        lastUsed: endpoint.last_used,
        requests: 0, // Will be populated from usage data
        createdAt: endpoint.created_at,
        api_key: endpoint.api_key,
        settings: {
          auth: endpoint.auth_enabled,
          rateLimit: {
            requests: endpoint.rate_limit_requests,
            period: endpoint.rate_limit_period
          },
          webhook: {
            url: endpoint.webhook_url,
            events: endpoint.webhook_events ? JSON.parse(endpoint.webhook_events) : []
          },
          envVariables: [
            { key: "API_KEY", value: endpoint.api_key, isSecret: true }
          ]
        }
      }));
      
      setEndpoints(transformedEndpoints);
      
      // Select the first endpoint if none is selected
      if (transformedEndpoints.length > 0 && !selectedEndpoint) {
        setSelectedEndpoint(transformedEndpoints[0].id);
        setCurrentApiKey(transformedEndpoints[0].api_key);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      toast({
        title: "Error",
        description: "Failed to load API endpoints. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEndpoints(false);
    }
  };

  // Fetch usage data for a specific endpoint
  const fetchEndpointUsage = async (endpointId: string) => {
    setIsLoadingUsage(true);
    try {
      const response = await fetch(`/api/endpoints_usage?endpointId=${endpointId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch endpoint usage');
      }
      const data = await response.json();
      
      setEndpointUsage(data);
      
      // Update the requests count in the endpoints list
      setEndpoints(prevEndpoints => {
        return prevEndpoints.map(ep => {
          if (ep.id === endpointId) {
            return {
              ...ep,
              requests: data.summary ? data.summary.total_requests : 0
            };
          }
          return ep;
        });
      });
    } catch (error) {
      console.error('Error fetching endpoint usage:', error);
      toast({
        title: "Error",
        description: "Failed to load API usage data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsage(false);
    }
  };

  // Create a new endpoint
  const createEndpoint = async (endpointData: any) => {
    try {
      const response = await fetch('/api/endpoints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpointData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create endpoint');
      }
      
      const newEndpoint = await response.json();
      
      // Refetch endpoints or add to current state
      fetchEndpoints();
      
      toast({
        title: "Success",
        description: "API endpoint created successfully.",
      });
      
      return newEndpoint;
    } catch (error) {
      console.error('Error creating endpoint:', error);
      toast({
        title: "Error",
        description: "Failed to create API endpoint. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing endpoint
  const updateEndpoint = async (endpointId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/endpoints?id=${endpointId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update endpoint');
      }
      
      const updatedEndpoint = await response.json();
      
      // Update in the local state
      setEndpoints(prevEndpoints => {
        return prevEndpoints.map(ep => {
          if (ep.id === endpointId) {
            // Map the API response to our interface structure
            return {
              ...ep,
              ...updatedEndpoint,
              settings: {
                auth: updatedEndpoint.auth_enabled,
                rateLimit: {
                  requests: updatedEndpoint.rate_limit_requests,
                  period: updatedEndpoint.rate_limit_period
                },
                webhook: {
                  url: updatedEndpoint.webhook_url,
                  events: updatedEndpoint.webhook_events ? JSON.parse(updatedEndpoint.webhook_events) : []
                },
                envVariables: ep.settings.envVariables
              }
            };
          }
          return ep;
        });
      });
      
      toast({
        title: "Success",
        description: "API endpoint updated successfully.",
      });
      
      return updatedEndpoint;
    } catch (error) {
      console.error('Error updating endpoint:', error);
      toast({
        title: "Error",
        description: "Failed to update API endpoint. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Delete an endpoint
  const deleteEndpoint = async (endpointId: string) => {
    try {
      const response = await fetch(`/api/endpoints?id=${endpointId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete endpoint');
      }
      
      // Remove from local state
      setEndpoints(prevEndpoints => prevEndpoints.filter(ep => ep.id !== endpointId));
      
      // If the deleted endpoint was selected, select another one
      if (selectedEndpoint === endpointId) {
        const remainingEndpoints = endpoints.filter(ep => ep.id !== endpointId);
        setSelectedEndpoint(remainingEndpoints.length > 0 ? remainingEndpoints[0].id : null);
      }
      
      toast({
        title: "Success",
        description: "API endpoint deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      toast({
        title: "Error",
        description: "Failed to delete API endpoint. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Regenerate API key
  const handleRegenerateKey = async () => {
    if (!selectedEndpoint) return;
    
    try {
      // Our API doesn't have a specific endpoint for regenerating keys,
      // so we'll create a random key here and update the endpoint
      const newKey = `docm_${Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      const result = await updateEndpoint(selectedEndpoint, {
        api_key: newKey
      });
      
      if (result) {
        setCurrentApiKey(newKey);
        setShowApiKey(true);
        setShowRegenerateDialog(false);
        
        toast({
          title: "API Key Regenerated",
          description: "Your new API key has been generated. Make sure to update your applications.",
        });
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      toast({
        title: "Error",
        description: "Failed to regenerate API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle editing the API name
  const handleEditName = async () => {
    if (!selectedEndpoint || !newApiName.trim()) {
      toast({
        title: "Invalid name",
        description: "API name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    const result = await updateEndpoint(selectedEndpoint, {
      name: newApiName.trim()
    });
    
    if (result) {
      setShowEditNameDialog(false);
    }
  };

  // Handle deleting the API
  const handleDeleteApi = async () => {
    if (!selectedEndpoint) return;
    
    const success = await deleteEndpoint(selectedEndpoint);
    
    if (success) {
      setShowDeleteDialog(false);
    }
  };

  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never used';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fullFormatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
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

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col">
      <div className="grid h-full grid-cols-[350px_1fr] gap-6">
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
              {isLoadingEndpoints ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="ml-2">Loading APIs...</span>
                </div>
              ) : endpoints.length > 0 ? (
                endpoints
                  .filter(endpoint => 
                    endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((endpoint) => (
                    <Card 
                      key={endpoint.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50 transition-all overflow-hidden border-l-4",
                        selectedEndpoint === endpoint.id ? "bg-muted/50 border-l-primary" : "border-l-1"
                      )}
                      onClick={() => handleSelectEndpoint(endpoint.id)}
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
                          {endpoint.path}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{endpoint.requests?.toLocaleString() || '0'} requests</span>
                          <span>{endpoint.lastUsed ? formatDate(endpoint.lastUsed) : 'Never used'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  <p>No API endpoints found</p>
                </div>
              )}

              {/* Add New API Card */}
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-all border-dashed flex items-center justify-center p-3"
                onClick={() => {
                  // Will implement this in a future update
                  toast({
                    title: "Coming soon",
                    description: "This feature is under development"
                  });
                }}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <PlusCircle className="h-4 w-4" />
                  <span>Add New API</span>
                </div>
              </Card>
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
                                <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <code className="text-sm flex-1 text-muted-foreground font-mono">
                                {showApiKey ? currentApiKey : currentApiKey ? currentApiKey.replace(/./g, "•") : "•••••••••••••••••••••••••••••••••"}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  if (showApiKey) {
                                    if (currentApiKey) {
                                      handleCopy(currentApiKey, "API key copied to clipboard");
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
                                  https://api.docmate.io{getSelectedEndpoint()?.path}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => {
                                    const url = `https://api.docmate.io${getSelectedEndpoint()?.path}`;
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
                                    value={selectedTemplate?.id} 
                                    onValueChange={async (value) => {
                                      const template = templates.find(t => t.id === value);
                                      if (template) {
                                        setSelectedTemplate(template);
                                        
                                        // Update the endpoint's template_id if an endpoint is selected
                                        if (selectedEndpoint) {
                                          await updateEndpoint(selectedEndpoint, {
                                            template_id: value
                                          });
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {templates.map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                          <div className="flex items-center justify-between w-full">
                                            <span>{template.name}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {templates.length === 0 
                                      ? "No templates available. Create a template to get started."
                                      : "The selected template defines the structure of requests and responses for this API."}
                                  </p>
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
                              {isLoadingUsage ? (
                                <div className="flex items-center justify-center py-4">
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                  <span className="ml-2 text-sm">Loading usage...</span>
                                </div>
                              ) : endpointUsage?.summary ? (
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium">Current Usage</div>
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                      {endpointUsage.pagination?.total || 0} requests
                                    </Badge>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Successful:</span>
                                      <span className="font-medium">{endpointUsage.summary.successful_requests || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Failed:</span>
                                      <span className="font-medium">{endpointUsage.summary.failed_requests || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Avg response time:</span>
                                      <span className="font-medium">{Math.round(endpointUsage.summary.avg_response_time || 0)}ms</span>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-center py-2 text-muted-foreground">
                                  <p>No usage data available</p>
                                </div>
                              )}
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
                                    checked={getSelectedEndpoint()?.settings.rateLimit !== undefined}
                                    onCheckedChange={async (checked) => {
                                      if (selectedEndpoint) {
                                        await updateEndpoint(selectedEndpoint, {
                                          rate_limit_enabled: checked
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Max Requests</Label>
                                    <Input 
                                      type="number" 
                                      value={getSelectedEndpoint()?.settings.rateLimit?.requests || 100}
                                      onChange={async (e) => {
                                        const value = parseInt(e.target.value);
                                        if (selectedEndpoint && !isNaN(value)) {
                                          await updateEndpoint(selectedEndpoint, {
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
                                      value={getSelectedEndpoint()?.settings.rateLimit?.period || "minute"}
                                      onValueChange={async (value) => {
                                        if (selectedEndpoint) {
                                          await updateEndpoint(selectedEndpoint, {
                                            rate_limit_period: value
                                          });
                                        }
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
                              <Select defaultValue="7days">
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
                            
                            {isLoadingUsage ? (
                              <div className="w-full h-[180px] flex items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                <span className="ml-2">Loading analytics...</span>
                              </div>
                            ) : endpointUsage?.data && endpointUsage.data.length > 0 ? (
                              <>
                                {/* Simple chart visualization */}
                                <div className="w-full h-[180px] relative">
                                  <div className="absolute inset-0 flex items-end justify-between px-2">
                                    {/* Group usage data by day and create bars */}
                                    {Array.from({ length: 7 }).map((_, i) => {
                                      // In a real implementation, we would aggregate the data by day here
                                      // For now, we'll show a simplified visualization
                                      const height = endpointUsage.data.length > i ? 
                                        30 + (endpointUsage.data.length - i) * 10 : 
                                        20 + Math.random() * 30;
                                      
                                      return (
                                        <div key={i} 
                                          className="w-8 bg-primary/80 rounded-t" 
                                          style={{ 
                                            height: `${Math.min(height, 100)}%`,
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
                                    <div className="text-2xl font-bold">{endpointUsage.summary?.total_requests || 0}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground">Average Response Time</div>
                                    <div className="text-2xl font-bold">
                                      {Math.round(endpointUsage.summary?.avg_response_time || 0)}ms
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-[180px] flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                  <p>No usage data available</p>
                                  <p className="text-xs mt-1">API analytics will appear here once your endpoint receives traffic</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </section>

                      {/* Danger Zone */}
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
                                onClick={() => {
                                  // Set the current name before showing the dialog
                                  if (selectedEndpoint) {
                                    const endpoint = endpoints.find(ep => ep.id === selectedEndpoint);
                                    if (endpoint) {
                                      setNewApiName(endpoint.name);
                                      setShowEditNameDialog(true);
                                    }
                                  }
                                }}
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
      <AlertDialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog}>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEditName}
              disabled={!newApiName.trim()}
            >
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
    </div>
  );
} 