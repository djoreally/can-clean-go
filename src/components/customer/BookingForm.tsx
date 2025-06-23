
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, DollarSign, Repeat } from 'lucide-react';
import { Service, Job, RecurringPlan, Customer } from '../../types';
import { storage } from '../../services/storage';
import { smsService } from '../../services/smsService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const BookingForm = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const activeServices = storage.getCollection<Service>('services')
      .filter(service => service.active);
    setServices(activeServices);
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !scheduledDate || !user) return;

    setLoading(true);

    try {
      // Get or create customer record
      let customer = storage.findBy<Customer>('customers', c => c.userId === user.id)[0];
      
      if (!customer) {
        customer = storage.create<Customer>('customers', {
          userId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: '',
          notes: '',
        });
      }

      // Create the job
      const job = storage.create<Job>('jobs', {
        customerId: customer.id,
        serviceId: selectedService.id,
        scheduledDate,
        status: 'scheduled',
        notes,
        beforePhotos: [],
        afterPhotos: [],
      });

      // Create recurring plan if selected
      if (isRecurring) {
        const nextDate = new Date(scheduledDate);
        switch (frequency) {
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'biweekly':
            nextDate.setDate(nextDate.getDate() + 14);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        }

        storage.create<RecurringPlan>('recurring_plans', {
          customerId: customer.id,
          serviceId: selectedService.id,
          frequency,
          nextDate: nextDate.toISOString().split('T')[0],
          active: true,
        });
      }

      // Send SMS confirmation
      if (customer.phone) {
        const message = smsService.generateJobCreatedMessage(
          customer.name,
          new Date(scheduledDate).toLocaleDateString()
        );
        await smsService.sendSMS(customer.phone, message, 'job_created', job.id);
      }

      toast({
        title: "Booking confirmed!",
        description: `Your ${selectedService.name} is scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
      });

      // Reset form
      setSelectedService(null);
      setScheduledDate('');
      setNotes('');
      setIsRecurring(false);
      setFrequency('weekly');

    } catch (error) {
      toast({
        title: "Booking failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Service</h1>
        <p className="text-gray-600">Schedule professional trash can cleaning</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <Label htmlFor="service">Select Service</Label>
              <Select onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-green-600 font-medium ml-4">${service.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Service Details */}
            {selectedService && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm">
                        <strong>${selectedService.price}</strong>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm">~{selectedService.duration} minutes</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{selectedService.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Date Selection */}
            <div>
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                min={minDate}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>

            {/* Recurring Service */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="recurring" className="flex items-center">
                  <Repeat className="h-4 w-4 mr-2" />
                  Make this a recurring service
                </Label>
              </div>

              {isRecurring && (
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(value: any) => setFrequency(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Special Instructions */}
            <div>
              <Label htmlFor="notes">Special Instructions</Label>
              <Textarea
                id="notes"
                placeholder="Gate codes, special instructions, or anything we should know..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!selectedService || !scheduledDate || loading}
            >
              {loading ? 'Booking...' : `Book Service - $${selectedService?.price || 0}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingForm;
