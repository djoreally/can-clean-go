
import { Job, RecurringPlan, Customer, Service } from '../types';
import { storage } from './storage';
import { smsService } from './smsService';

export class RecurringJobService {
  generateNextJobs(): Job[] {
    const recurringPlans = storage.getCollection<RecurringPlan>('recurring_plans')
      .filter(plan => plan.active);
    
    const today = new Date();
    const newJobs: Job[] = [];

    recurringPlans.forEach(plan => {
      const nextDate = new Date(plan.nextDate);
      
      if (nextDate <= today) {
        // Create new job
        const job = storage.create<Job>('jobs', {
          customerId: plan.customerId,
          serviceId: plan.serviceId,
          scheduledDate: plan.nextDate,
          status: 'scheduled',
          beforePhotos: [],
          afterPhotos: [],
          recurringPlanId: plan.id,
        });

        newJobs.push(job);

        // Calculate next date
        const newNextDate = this.calculateNextDate(nextDate, plan.frequency, plan.dayOfWeek);
        
        // Update recurring plan
        storage.update('recurring_plans', plan.id, {
          nextDate: newNextDate.toISOString().split('T')[0],
        });

        // Send SMS notification
        this.sendJobCreatedNotification(job);
      }
    });

    return newJobs;
  }

  private calculateNextDate(currentDate: Date, frequency: string, dayOfWeek?: number): Date {
    const nextDate = new Date(currentDate);

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

    return nextDate;
  }

  private async sendJobCreatedNotification(job: Job): Promise<void> {
    const customer = storage.findById<Customer>('customers', job.customerId);
    const service = storage.findById<Service>('services', job.serviceId);
    
    if (customer && service) {
      const message = smsService.generateJobCreatedMessage(
        customer.name,
        new Date(job.scheduledDate).toLocaleDateString()
      );
      
      await smsService.sendSMS(customer.phone, message, 'job_created', job.id);
    }
  }

  // Run this function periodically (daily) to auto-generate jobs
  autoGenerateJobs(): void {
    const newJobs = this.generateNextJobs();
    console.log(`Auto-generated ${newJobs.length} recurring jobs`);
  }
}

export const recurringJobService = new RecurringJobService();
