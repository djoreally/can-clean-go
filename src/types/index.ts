
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'technician' | 'customer';
  phone?: string;
  created: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  created: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  active: boolean;
}

export interface Job {
  id: string;
  customerId: string;
  serviceId: string;
  technicianId?: string;
  scheduledDate: string;
  status: 'scheduled' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  techNotes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
  created: string;
  completed?: string;
  recurringPlanId?: string;
}

export interface RecurringPlan {
  id: string;
  customerId: string;
  serviceId: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek?: number; // 0-6, Sunday = 0
  nextDate: string;
  active: boolean;
  created: string;
}

export interface Photo {
  id: string;
  jobId: string;
  type: 'before' | 'after';
  url: string;
  filename: string;
  uploadedBy: string;
  created: string;
}

export interface SMSWebhook {
  id: string;
  jobId: string;
  type: 'job_created' | 'status_update' | 'reminder' | 'completion';
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  webhookUrl?: string;
  created: string;
}
