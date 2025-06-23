
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Phone, Camera, Clock, User } from 'lucide-react';
import { Job, Customer, Service } from '../../types';
import { storage } from '../../services/storage';
import { smsService } from '../../services/smsService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [techNotes, setTechNotes] = useState('');
  const [newStatus, setNewStatus] = useState<Job['status']>('scheduled');

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = () => {
    const allJobs = storage.getCollection<Job>('jobs');
    const allCustomers = storage.getCollection<Customer>('customers');
    const allServices = storage.getCollection<Service>('services');

    // Filter jobs assigned to this technician or unassigned jobs
    const techJobs = allJobs.filter(job => 
      job.technicianId === user?.id || 
      (!job.technicianId && job.status !== 'completed' && job.status !== 'cancelled')
    );

    setJobs(techJobs.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()));
    setCustomers(allCustomers);
    setServices(allServices);
  };

  const handleTakeJob = (jobId: string) => {
    if (!user) return;
    
    storage.update<Job>('jobs', jobId, { technicianId: user.id });
    loadJobs();
    toast({
      title: "Job assigned",
      description: "Job has been assigned to you",
    });
  };

  const handleStatusUpdate = async (job: Job, status: Job['status']) => {
    if (!user) return;

    // Update job status
    storage.update<Job>('jobs', job.id, { 
      status,
      techNotes: techNotes || job.techNotes,
    });

    // Send SMS notification to customer
    const customer = customers.find(c => c.id === job.customerId);
    if (customer && customer.phone) {
      const message = smsService.generateStatusUpdateMessage(customer.name, status);
      await smsService.sendSMS(customer.phone, message, 'status_update', job.id);
    }

    loadJobs();
    setSelectedJob(null);
    setTechNotes('');
    
    toast({
      title: "Status updated",
      description: `Job status updated to ${status.replace('_', ' ')}`,
    });
  };

  const handlePhotoUpload = (job: Job, type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Simulate photo upload
    const photoUrls = Array.from(files).map(file => URL.createObjectURL(file));
    
    const updatedJob = { ...job };
    if (type === 'before') {
      updatedJob.beforePhotos = [...updatedJob.beforePhotos, ...photoUrls];
    } else {
      updatedJob.afterPhotos = [...updatedJob.afterPhotos, ...photoUrls];
    }

    storage.update<Job>('jobs', job.id, updatedJob);
    loadJobs();
    
    toast({
      title: "Photos uploaded",
      description: `${type} photos have been added to the job`,
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

  const getCustomer = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  const getService = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  const todayJobs = jobs.filter(job => {
    const jobDate = new Date(job.scheduledDate).toDateString();
    const today = new Date().toDateString();
    return jobDate === today;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Technician Dashboard</h1>
        <p className="text-gray-600">Manage your assigned jobs and update status</p>
      </div>

      {/* Today's Jobs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Today's Schedule ({todayJobs.length} jobs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayJobs.length === 0 ? (
            <p className="text-gray-500">No jobs scheduled for today</p>
          ) : (
            <div className="grid gap-4">
              {todayJobs.map((job) => {
                const customer = getCustomer(job.customerId);
                const service = getService(job.serviceId);
                return (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium">{customer?.name}</h3>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service?.name}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {customer?.address}
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {customer?.phone}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            ~{service?.duration} min
                          </div>
                        </div>
                        {customer?.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                            <p className="text-sm text-yellow-800">{customer.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {!job.technicianId && (
                          <Button
                            size="sm"
                            onClick={() => handleTakeJob(job.id)}
                          >
                            Take Job
                          </Button>
                        )}
                        {job.technicianId === user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedJob(job)}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>All Available Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => {
              const customer = getCustomer(job.customerId);
              const service = getService(job.serviceId);
              return (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{customer?.name}</h3>
                        <p className="text-sm text-gray-500">{service?.name}</p>
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
                        <MapPin className="h-4 w-4 mr-1" />
                        {customer?.address}
                      </div>
                      {job.technicianId === user?.id && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Assigned to you
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!job.technicianId && job.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => handleTakeJob(job.id)}
                      >
                        Take Job
                      </Button>
                    )}
                    {job.technicianId === user?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedJob(job)}
                      >
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {jobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No jobs available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Update Modal */}
      {selectedJob && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Update Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">{getCustomer(selectedJob.customerId)?.name}</h3>
                <p className="text-sm text-gray-500">{getService(selectedJob.serviceId)?.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
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
                <label className="block text-sm font-medium mb-2">Technician Notes</label>
                <Textarea
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Add notes about the job..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Before Photos</label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(selectedJob, 'before', e)}
                  />
                  {selectedJob.beforePhotos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{selectedJob.beforePhotos.length} photos uploaded</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">After Photos</label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(selectedJob, 'after', e)}
                  />
                  {selectedJob.afterPhotos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{selectedJob.afterPhotos.length} photos uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleStatusUpdate(selectedJob, newStatus)}
                  className="flex-1"
                >
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TechnicianDashboard;
