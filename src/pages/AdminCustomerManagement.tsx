
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Phone, Mail, Edit, Trash2, Plus, User } from 'lucide-react';
import { Customer, Job, Service } from '../types';
import { storage } from '../services/storage';
import { toast } from '@/hooks/use-toast';

const AdminCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm]);

  const loadData = () => {
    const allCustomers = storage.getCollection<Customer>('customers');
    const allJobs = storage.getCollection<Job>('jobs');
    const allServices = storage.getCollection<Service>('services');

    setCustomers(allCustomers.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()));
    setJobs(allJobs);
    setServices(allServices);
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const getCustomerJobCount = (customerId: string) => {
    return jobs.filter(job => job.customerId === customerId).length;
  };

  const getCustomerTotalSpent = (customerId: string) => {
    const customerJobs = jobs.filter(job => job.customerId === customerId && job.status === 'completed');
    return customerJobs.reduce((total, job) => {
      const service = services.find(s => s.id === job.serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleCreateCustomer = () => {
    setEditingCustomer({
      id: '',
      userId: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      created: '',
    });
    setIsCreating(true);
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer });
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!editingCustomer) return;

    if (!editingCustomer.name || !editingCustomer.email || !editingCustomer.phone || !editingCustomer.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (isCreating) {
      storage.create<Customer>('customers', {
        userId: editingCustomer.userId || 'temp-user-id',
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
        notes: editingCustomer.notes,
      });
      toast({
        title: "Customer created",
        description: "New customer has been added successfully",
      });
    } else {
      storage.update<Customer>('customers', editingCustomer.id, {
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
        notes: editingCustomer.notes,
      });
      toast({
        title: "Customer updated",
        description: "Customer has been updated successfully",
      });
    }

    loadData();
    setIsDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    const customerJobs = jobs.filter(job => job.customerId === customerId);
    if (customerJobs.length > 0) {
      toast({
        title: "Cannot delete customer",
        description: "Customer has existing jobs. Please remove jobs first.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this customer?')) {
      storage.delete('customers', customerId);
      loadData();
      toast({
        title: "Customer deleted",
        description: "Customer has been removed",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer accounts and information</p>
        </div>
        <Button onClick={handleCreateCustomer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, email, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          Customer since {new Date(customer.created).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{customer.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{getCustomerJobCount(customer.id)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${getCustomerTotalSpent(customer.id)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No customers found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Add New Customer' : 'Edit Customer'}</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Name *</Label>
                <Input
                  id="customerName"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input
                  id="customerPhone"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="customerAddress">Address *</Label>
                <Input
                  id="customerAddress"
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div>
                <Label htmlFor="customerNotes">Notes</Label>
                <Textarea
                  id="customerNotes"
                  value={editingCustomer.notes || ''}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                  placeholder="Gate code, special instructions, etc."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCustomer}>
                  {isCreating ? 'Add Customer' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomerManagement;
