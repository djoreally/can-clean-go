
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Mail, Calendar, DollarSign } from 'lucide-react';
import { Customer, Job, Service, RecurringPlan } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const CustomerProfile = () => {
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [recurringPlans, setRecurringPlans] = useState<RecurringPlan[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadCustomerData();
    }
  }, [user]);

  const loadCustomerData = () => {
    if (!user) return;

    let customerRecord = storage.findBy<Customer>('customers', c => c.userId === user.id)[0];
    
    if (!customerRecord) {
      customerRecord = storage.create<Customer>('customers', {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: '',
        notes: '',
      });
    }

    setCustomer(customerRecord);
    setFormData({
      address: customerRecord.address,
      phone: customerRecord.phone,
      notes: customerRecord.notes || '',
    });

    const customerJobs = storage.findBy<Job>('jobs', j => j.customerId === customerRecord.id);
    const allServices = storage.getCollection<Service>('services');
    const customerPlans = storage.findBy<RecurringPlan>('recurring_plans', p => p.customerId === customerRecord.id);

    setJobs(customerJobs.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setServices(allServices);
    setRecurringPlans(customerPlans);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    storage.update<Customer>('customers', customer.id, formData);
    loadCustomerData();
    setEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully",
    });
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
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

  const cancelRecurringPlan = (planId: string) => {
    storage.update<RecurringPlan>('recurring_plans', planId, { active: false });
    loadCustomerData();
    toast({
      title: "Recurring plan cancelled",
      description: "Your recurring service has been cancelled",
    });
  };

  if (!customer) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account and view service history</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={customer.name} disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={customer.email} disabled />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Service Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Where we service your cans"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Gate codes, special instructions, etc."
                  rows={3}
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{customer.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{customer.phone || 'No phone number'}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{customer.address || 'No address set'}</span>
                </div>
              </div>
              {customer.notes && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-sm text-yellow-800">{customer.notes}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recurringPlans.filter(plan => plan.active).map((plan) => (
              <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{getServiceName(plan.serviceId)}</h4>
                  <p className="text-sm text-gray-500">
                    {plan.frequency} • Next service: {new Date(plan.nextDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelRecurringPlan(plan.id)}
                >
                  Cancel
                </Button>
              </div>
            ))}
            {recurringPlans.filter(plan => plan.active).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recurring services active
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{getServiceName(job.serviceId)}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(job.scheduledDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {job.notes && (
                    <p className="text-sm text-gray-600 mt-2">{job.notes}</p>
                  )}
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No service history yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;
