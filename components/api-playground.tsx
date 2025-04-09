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
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([
    {
      id: "1",
      name: "Document Analysis",
      path: "/v1/analyze",
      method: "POST",
      status: "active",
      lastUsed: "2024-03-20T15:30:00Z",
      requests: 1250,
      createdAt: "2024-02-15T10:00:00Z",
      settings: {
        auth: true,
        rateLimit: {
          requests: 100,
          period: "minute"
        },
        webhook: {
          url: "https://webhook.example.com/notifications",
          events: ["analysis_complete", "error"]
        },
        envVariables: [
          { key: "OPENAI_API_KEY", value: "sk-...", isSecret: true },
          { key: "MAX_FILE_SIZE", value: "10MB", isSecret: false }
        ]
      }
    },
    {
      id: "2",
      name: "Document Search",
      path: "/v1/search",
      method: "GET",
      status: "active",
      lastUsed: "2024-03-20T14:45:00Z",
      requests: 3420,
      createdAt: "2024-02-10T09:00:00Z",
      settings: {
        auth: true,
        rateLimit: {
          requests: 200,
          period: "minute"
        },
        webhook: {
          url: "https://webhook.example.com/search-notifications",
          events: ["search_complete"]
        },
        envVariables: [
          { key: "ELASTICSEARCH_URL", value: "http://localhost:9200", isSecret: false },
          { key: "ELASTICSEARCH_API_KEY", value: "es-...", isSecret: true }
        ]
      }
    },
    {
      id: "3",
      name: "Document Summarization",
      path: "/v1/summarize",
      method: "POST",
      status: "inactive",
      lastUsed: "2024-03-19T11:20:00Z",
      requests: 780,
      createdAt: "2024-03-01T14:00:00Z",
      settings: {
        auth: true,
        rateLimit: {
          requests: 50,
          period: "minute"
        },
        webhook: {
          url: "https://webhook.example.com/summary-notifications",
          events: ["summary_complete", "error"]
        },
        envVariables: [
          { key: "SUMMARIZATION_MODEL", value: "gpt-4", isSecret: false },
          { key: "OPENAI_API_KEY", value: "sk-...", isSecret: true }
        ]
    }
    },
    {
      id: "4",
      name: "Document Translation",
      path: "/v1/translate",
      method: "POST",
      status: "active",
      lastUsed: "2024-03-20T16:15:00Z",
      requests: 890,
      createdAt: "2024-02-20T11:00:00Z",
      settings: {
        auth: true,
        rateLimit: {
          requests: 75,
          period: "minute"
        },
        webhook: {
          url: "https://webhook.example.com/translation-notifications",
          events: ["translation_complete", "error"]
        },
        envVariables: [
          { key: "DEEPL_API_KEY", value: "dl-...", isSecret: true },
          { key: "SUPPORTED_LANGUAGES", value: "en,es,fr,de,it", isSecret: false }
        ]
      }
    }
  ]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

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

  const handleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
  };

  const formatDate = (dateString: string) => {
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
              {endpoints.map((endpoint) => (
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
                      <span>{endpoint.requests.toLocaleString()} requests</span>
                      <span>{endpoint.lastUsed ? formatDate(endpoint.lastUsed) : 'Never used'}</span>
              </div>
          </CardContent>
        </Card>
              ))}

              {/* Add New API Card */}
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-all border-dashed flex items-center justify-center p-3"
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
                          <Key className="h-5 w-5" /> API Key Management
                        </h2>
                        <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label>API Key</Label>
                                <p className="text-sm text-muted-foreground">Use this key to authenticate requests to this API endpoint</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <RefreshCcw className="h-4 w-4 mr-2" /> Regenerate
                      </Button>
                    </div>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <code className="text-sm flex-1 text-muted-foreground font-mono">
                                {getSelectedEndpoint()?.id === "1" ? "docm_" : "docm_"}
                                {Array(32).fill("x").join("").replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))}
                              </code>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Copy className="h-4 w-4" />
                  </Button>
                </div>
                            <div>
                              <div className="flex items-center gap-2 mt-4">
                                <Label>API Endpoint URL</Label>
                                <Badge variant="outline" className="text-xs">Public</Badge>
          </div>
                              <div className="flex items-center gap-2 p-2 mt-1 bg-muted rounded-md">
                                <code className="text-sm flex-1 text-muted-foreground font-mono">
                                  https://api.docmate.io{getSelectedEndpoint()?.path}
                                </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                    onValueChange={(value) => {
                                      const template = templates.find(t => t.id === value);
                                      if (template) setSelectedTemplate(template);
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
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 ml-2"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setTemplateToDelete(template.id);
                                              }}
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
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
                                <div className="flex items-center justify-between">
                                  <Label>Template Preview</Label>
                                  <Button variant="ghost" size="sm" className="gap-1">
                                    <Eye className="h-3.5 w-3.5" /> View Full Template
                                  </Button>
                                </div>
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
                                  {Math.floor(getSelectedEndpoint()!.requests * 0.3)}/{getSelectedEndpoint()?.settings?.rateLimit?.requests || 100}
                                </Badge>
                </div>
                              <div className="w-full bg-muted rounded-full h-2 mb-1">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
                              <p className="text-xs text-muted-foreground">Resets in 18 hours, 24 minutes</p>
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
                                  <Switch defaultChecked={!!getSelectedEndpoint()?.settings.rateLimit} />
                </div>
                                
                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Max Requests</Label>
                                    <Input 
                                      type="number" 
                                      defaultValue={getSelectedEndpoint()?.settings.rateLimit?.requests || 100} 
                                      className="mt-1" 
                                    />
                                  </div>
                                  <div>
                                    <Label>Time Period</Label>
                                    <Select defaultValue={getSelectedEndpoint()?.settings.rateLimit?.period || "minute"}>
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
                            
                            {/* Simple chart placeholder */}
                            <div className="w-full h-[180px] relative">
                              <div className="absolute inset-0 flex items-end justify-between px-2">
                                {Array.from({ length: 7 }).map((_, i) => (
                                  <div key={i} 
                                    className="w-8 bg-primary/80 rounded-t" 
                                    style={{ 
                                      height: `${30 + Math.random() * 70}%`,
                                      opacity: i === 6 ? 1 : 0.7 - (6-i)*0.1
                                    }}
                                  ></div>
                                ))}
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
                                <div className="text-2xl font-bold">{getSelectedEndpoint()?.requests.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Average Per Day</div>
                                <div className="text-2xl font-bold">
                                  {Math.floor(getSelectedEndpoint()!.requests / 7).toLocaleString()}
                                </div>
                              </div>
                            </div>
                    </CardContent>
                  </Card>
                      </section>

                      {/* Advanced Settings */}
                      <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Settings className="h-5 w-5" /> Advanced Settings
                        </h2>
                  <Card>
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label>CORS Settings</Label>
                                <p className="text-sm text-muted-foreground">Allow cross-origin requests from specific domains</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label>Request Logging</Label>
                                <p className="text-sm text-muted-foreground">Log all requests for debugging and analytics</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label>Error Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive notifications when errors occur</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <Label>API Versioning</Label>
                                <p className="text-sm text-muted-foreground">Enable version control for API changes</p>
                              </div>
                              <Switch />
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
    </div>
  );
} 