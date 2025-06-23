
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Briefcase, DollarSign, Clock, MapPin, Phone } from 'lucide-react';
import { Job, Customer, Service } from '../../types';
import { storage } from '../../services/storage';
import { recurringJobService } from '../../services/recurringJobService';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    todayJobs: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  });

  useEffect(() => {
    loadData();
    
    // Auto-generate recurring jobs
    recurringJobService.autoGenerateJobs();
  }, []);

  const loadData = () => {
    const allJobs = storage.getCollection<Job>('jobs');
    const allCustomers = storage.getCollection<Customer>('customers');
    const allServices = storage.getCollection<Service>('services');

    setJobs(allJobs.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setCustomers(allCustomers);
    setServices(allServices);

    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const todayJobs = allJobs.filter(job => job.scheduledDate === today);
    const totalRevenue = allJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => {
        const service = allServices.find(s => s.id === job.serviceId);
        return sum + (service?.price || 0);
      }, 0);

    setStats({
      totalJobs: allJobs.length,
      todayJobs: todayJobs.length,
      totalRevenue,
      activeCustomers: allCustomers.length,
    });
  };

  const handleGenerateRecurringJobs = () => {
    const newJobs = recurringJobService.generateNextJobs();
    loadData(); // Refresh data
    toast({
      title: "Recurring jobs generated",
      description: `Generated ${newJobs.length} new recurring jobs`,
    });
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'en_route': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const getServicePrice = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.price || 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your trash can cleaning business</p>
        </div>
        <Button onClick={handleGenerateRecurringJobs} variant="outline">
          Generate Recurring Jobs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.slice(0, 10).map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{getCustomerName(job.customerId)}</h3>
                      <p className="text-sm text-gray-500">{getServiceName(job.serviceId)}</p>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${getServicePrice(job.serviceId)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No jobs scheduled yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
