
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Phone, User, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';
import { Job, Customer, Service, User as UserType } from '../types';
import { storage } from '../services/storage';
import { toast } from '@/hooks/use-toast';

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<UserType[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, searchTerm]);

  const loadData = () => {
    const allJobs = storage.getCollection<Job>('jobs');
    const allCustomers = storage.getCollection<Customer>('customers');
    const allServices = storage.getCollection<Service>('services');
    const allUsers = storage.getCollection<UserType>('users').filter(u => u.role === 'technician');

    setJobs(allJobs.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setCustomers(allCustomers);
    setServices(allServices);
    setTechnicians(allUsers);
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(job => {
        const customer = getCustomerName(job.customerId).toLowerCase();
        const service = getServiceName(job.serviceId).toLowerCase();
        return customer.includes(searchTerm.toLowerCase()) || service.includes(searchTerm.toLowerCase());
      });
    }

    setFilteredJobs(filtered);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown Customer';
  };

  const getCustomerPhone = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.phone || '';
  };

  const getCustomerAddress = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.address || '';
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const getServicePrice = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.price || 0;
  };

  const getTechnicianName = (technicianId?: string) => {
    if (!technicianId) return 'Unassigned';
    const tech = technicians.find(t => t.id === technicianId);
    return tech?.name || 'Unknown Technician';
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

  const handleEditJob = (job: Job) => {
    setEditingJob({ ...job });
    setIsDialogOpen(true);
  };

  const handleSaveJob = () => {
    if (!editingJob) return;

    storage.update<Job>('jobs', editingJob.id, {
      technicianId: editingJob.technicianId,
      status: editingJob.status,
      notes: editingJob.notes,
      scheduledDate: editingJob.scheduledDate,
    });

    loadData();
    setIsDialogOpen(false);
    setEditingJob(null);
    toast({
      title: "Job updated",
      description: "Job has been updated successfully",
    });
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      storage.delete('jobs', jobId);
      loadData();
      toast({
        title: "Job deleted",
        description: "Job has been removed",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage all jobs and assignments</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="en_route">En Route</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{getCustomerName(job.customerId)}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {getCustomerAddress(job.customerId)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {getCustomerPhone(job.customerId)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getServiceName(job.serviceId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {getTechnicianName(job.technicianId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ${getServicePrice(job.serviceId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No jobs found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Job Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobDate">Scheduled Date</Label>
                <Input
                  id="jobDate"
                  type="date"
                  value={editingJob.scheduledDate}
                  onChange={(e) => setEditingJob({ ...editingJob, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="jobStatus">Status</Label>
                <Select 
                  value={editingJob.status} 
                  onValueChange={(value: Job['status']) => setEditingJob({ ...editingJob, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="en_route">En Route</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jobTechnician">Technician</Label>
                <Select 
                  value={editingJob.technicianId || ''} 
                  onValueChange={(value) => setEditingJob({ ...editingJob, technicianId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {technicians.map((tech) => (
                      <SelectItem key={tech.id} value={tech.id}>
                        {tech.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="jobNotes">Notes</Label>
                <Textarea
                  id="jobNotes"
                  value={editingJob.notes || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, notes: e.target.value })}
                  placeholder="Job notes..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveJob}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminJobManagement;
