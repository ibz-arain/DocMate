"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code, Plus, X, Save, Copy, Globe, Key, FileJson, ArrowRight, 
  Trash2, Settings, Link2, Variable, Lock, Search, Eye,
  Server, Webhook, RefreshCcw, Braces, FileText, MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'POST' | 'GET';
  template: string;
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
  name: string;
  tables: {
    name: string;
    type: 'request' | 'response';
    fields: {
      name: string;
      type: string;
      description?: string;
      isRequired?: boolean;
      format?: string;
    }[];
  }[];
  created_at?: string;
  updated_at?: string;
}

export function APIPlayground() {
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showNewEndpointDialog, setShowNewEndpointDialog] = useState(false);
  const [showEndpointDetailsDialog, setShowEndpointDetailsDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTemplate, setNewTemplate] = useState<Template>({
    id: '',
    name: '',
    tables: [
      {
        name: 'Request Schema',
        type: 'request',
        fields: []
      },
      {
        name: 'Response Schema',
        type: 'response',
        fields: []
      }
    ]
  });

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplate),
      });

      if (!response.ok) throw new Error('Failed to create template');
      
      await fetchTemplates();
      setShowTemplateDialog(false);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');
      
      await fetchTemplates();
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleViewEndpoint = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
    setShowEndpointDetailsDialog(true);
  };

  return (
    <div className="grid h-[calc(100vh-3rem)] grid-cols-[1fr_300px] gap-6">
      {/* Main API Management Area */}
      <div className="flex flex-col gap-6">
        {/* Header with Search and Actions */}
        <Card>
          <CardHeader className="p-3">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search APIs..."
                  className="pl-9 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowNewEndpointDialog(true)}
                  className="bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary h-10"
                >
                  <Plus className="h-4 w-4 mr-2" /> New API
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* API Endpoints Table */}
        <Card className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-10rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {endpoints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No API endpoints configured yet
                    </TableCell>
                  </TableRow>
                ) : (
                  endpoints.map((endpoint) => (
                    <TableRow key={endpoint.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{endpoint.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {endpoint.path}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{endpoint.template}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={endpoint.status === 'active' ? 'default' : 'secondary'}
                          className={cn(
                            "bg-primary/5 text-primary",
                            endpoint.status === 'inactive' && "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {endpoint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{endpoint.requests.toLocaleString()}</TableCell>
                      <TableCell>{endpoint.lastUsed || 'Never'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewEndpoint(endpoint.id)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" /> Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" /> Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="h-4 w-4 mr-2" /> API Keys
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>

      {/* Right Side Panel - Templates */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" /> Templates
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTemplateDialog(true)}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="p-3 space-y-2">
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates created yet
                  </div>
                ) : (
                  templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="flex-1 text-left truncate">{template.name}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button className="w-full" variant="outline">
              <FileJson className="h-4 w-4 mr-2" /> Import Template
            </Button>
            <Button className="w-full" variant="outline">
              <Save className="h-4 w-4 mr-2" /> Export All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create API Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                placeholder="Enter template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <Tabs defaultValue="request">
              <TabsList>
                <TabsTrigger value="request">Request Schema</TabsTrigger>
                <TabsTrigger value="response">Response Schema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="request" className="space-y-4">
                {/* Request Schema Editor */}
                <div className="space-y-4">
                  {newTemplate.tables[0].fields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => {
                          const updatedFields = [...newTemplate.tables[0].fields];
                          updatedFields[index] = { ...field, name: e.target.value };
                          setNewTemplate(prev => ({
                            ...prev,
                            tables: [
                              { ...prev.tables[0], fields: updatedFields },
                              prev.tables[1]
                            ]
                          }));
                        }}
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value) => {
                          const updatedFields = [...newTemplate.tables[0].fields];
                          updatedFields[index] = { ...field, type: value };
                          setNewTemplate(prev => ({
                            ...prev,
                            tables: [
                              { ...prev.tables[0], fields: updatedFields },
                              prev.tables[1]
                            ]
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updatedFields = newTemplate.tables[0].fields.filter((_, i) => i !== index);
                          setNewTemplate(prev => ({
                            ...prev,
                            tables: [
                              { ...prev.tables[0], fields: updatedFields },
                              prev.tables[1]
                            ]
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewTemplate(prev => ({
                        ...prev,
                        tables: [
                          {
                            ...prev.tables[0],
                            fields: [...prev.tables[0].fields, { name: '', type: 'string' }]
                          },
                          prev.tables[1]
                        ]
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Field
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="response" className="space-y-4">
                {/* Response Schema Editor - Similar to Request Schema */}
                <div className="space-y-4">
                  {newTemplate.tables[1].fields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => {
                          const updatedFields = [...newTemplate.tables[1].fields];
                          updatedFields[index] = { ...field, name: e.target.value };
                          setNewTemplate(prev => ({
                            ...prev,
                            tables: [
                              prev.tables[0],
                              { ...prev.tables[1], fields: updatedFields }
                            ]
                          }));
                        }}
                      />
                      <Select
                        value={field.type}
                        onValueChange={(value) => {
                          const updatedFields = [...newTemplate.tables[1].fields];
                          updatedFields[index] = { ...field, type: value };
                          setNewTemplate(prev => ({
                            ...prev,
                            tables: [
                              prev.tables[0],
                              { ...prev.tables[1], fields: updatedFields }
                            ]
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updatedFields = newTemplate.tables[1].fields.filter((_, i) => i !== index);
                          setNewTemplate(prev => ({
                            ...prev,
                            tables: [
                              prev.tables[0],
                              { ...prev.tables[1], fields: updatedFields }
                            ]
                          }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewTemplate(prev => ({
                        ...prev,
                        tables: [
                          prev.tables[0],
                          {
                            ...prev.tables[1],
                            fields: [...prev.tables[1].fields, { name: '', type: 'string' }]
                          }
                        ]
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Field
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Details Dialog */}
      <Dialog open={showEndpointDetailsDialog} onOpenChange={setShowEndpointDetailsDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>API Endpoint Details</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Endpoint URL</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <code className="text-sm flex-1 text-muted-foreground">https://api.example.com/v1/analyze</code>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe what this API endpoint does..." />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Environment Variables</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Variable name" className="flex-1" />
                      <Input placeholder="Value" className="flex-1" />
                      <Button variant="ghost" size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Webhook Notifications</Label>
                    <Switch />
                  </div>
                  <Input placeholder="Webhook URL" />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>API Key Authentication</Label>
                  <Switch />
                </div>
                <Input placeholder="API Key Header (e.g., X-API-Key)" />
                <div className="flex items-center justify-between">
                  <Label>Rate Limiting</Label>
                  <Switch />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" placeholder="Requests" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Period" />
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
            </TabsContent>
            <TabsContent value="monitoring" className="space-y-4">
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">1,234</div>
                      <div className="text-sm text-muted-foreground">Total Requests</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">99.9%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm font-medium">Recent Activity</div>
                    <div className="mt-2 space-y-2">
                      {/* Add activity items here */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
} 