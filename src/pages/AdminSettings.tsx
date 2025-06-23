import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, DollarSign, Trash2 } from 'lucide-react';
import { Service, User } from '../types';
import { storage } from '../services/storage';
import { toast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allServices = storage.getCollection<Service>('services');
    const allUsers = storage.getCollection<User>('users').filter(u => u.role === 'technician');
    setServices(allServices);
    setTechnicians(allUsers);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newService.name || newService.price <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    storage.create<Service>('services', newService);
    setNewService({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      active: true,
    });
    loadData();
    toast({
      title: "Service added",
      description: "New service has been created successfully",
    });
  };

  const toggleServiceStatus = (serviceId: string, active: boolean) => {
    storage.update<Service>('services', serviceId, { active });
    loadData();
    toast({
      title: "Service updated",
      description: `Service has been ${active ? 'activated' : 'deactivated'}`,
    });
  };

  const deleteService = (serviceId: string) => {
    storage.delete('services', serviceId);
    loadData();
    toast({
      title: "Service deleted",
      description: "Service has been removed",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your business settings and services</p>
      </div>

      {/* Service Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Service Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Service */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium mb-4">Add New Service</h3>
            <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="e.g. Basic Can Cleaning"
                  required
                />
              </div>
              <div>
                <Label htmlFor="servicePrice">Price ($)</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                  placeholder="25"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                <Input
                  id="serviceDuration"
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                  placeholder="30"
                  min="1"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="serviceDescription">Description</Label>
                <Textarea
                  id="serviceDescription"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe what's included in this service..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full md:w-auto">
                  Add Service
                </Button>
              </div>
            </form>
          </div>

          {/* Existing Services */}
          <div>
            <h3 className="text-lg font-medium mb-4">Existing Services</h3>
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">{service.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${service.price}
                      </div>
                      <div>~{service.duration} minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`active-${service.id}`}>Active</Label>
                      <Switch
                        id={`active-${service.id}`}
                        checked={service.active}
                        onCheckedChange={(checked) => toggleServiceStatus(service.id, checked)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No services created yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Technician Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {technicians.map((tech) => (
              <div key={tech.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{tech.name}</h4>
                  <p className="text-sm text-gray-500">{tech.email}</p>
                  {tech.phone && (
                    <p className="text-sm text-gray-500">{tech.phone}</p>
                  )}
                </div>
                <div className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  Active
                </div>
              </div>
            ))}
            {technicians.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No technicians registered yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
