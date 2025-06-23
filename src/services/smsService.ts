
import { SMSWebhook } from '../types';
import { storage } from './storage';

export class SMSService {
  private defaultWebhookUrl = 'https://hooks.zapier.com/hooks/catch/your-webhook-id/';

  async sendSMS(phone: string, message: string, type: SMSWebhook['type'], jobId: string, webhookUrl?: string): Promise<boolean> {
    const smsRecord = storage.create<SMSWebhook>('sms_webhooks', {
      jobId,
      type,
      phone,
      message,
      status: 'pending',
      webhookUrl: webhookUrl || this.defaultWebhookUrl,
    });

    try {
      // Simulate webhook call to SMS service (Zapier, Twilio, etc.)
      const response = await fetch(webhookUrl || this.defaultWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          phone,
          message,
          type,
          jobId,
          timestamp: new Date().toISOString(),
        }),
      });

      storage.update('sms_webhooks', smsRecord.id, { status: 'sent' });
      console.log('SMS sent successfully:', { phone, message, type });
      return true;
    } catch (error) {
      storage.update('sms_webhooks', smsRecord.id, { status: 'failed' });
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  generateJobCreatedMessage(customerName: string, serviceDate: string): string {
    return `Hi ${customerName}! Your trash can cleaning is scheduled for ${serviceDate}. We'll send updates as we get closer. - CleanCans Pro`;
  }

  generateStatusUpdateMessage(customerName: string, status: string): string {
    const statusMessages = {
      en_route: `Hi ${customerName}! Our technician is on the way to clean your trash cans. ETA: 30 minutes. - CleanCans Pro`,
      in_progress: `Hi ${customerName}! We're currently cleaning your trash cans. Almost done! - CleanCans Pro`,
      completed: `Hi ${customerName}! Your trash cans are sparkling clean! Check your email for before/after photos. Thanks for choosing CleanCans Pro! 🗑️✨`,
    };
    return statusMessages[status as keyof typeof statusMessages] || `Status update: ${status}`;
  }

  generateReminderMessage(customerName: string, serviceDate: string): string {
    return `Hi ${customerName}! Reminder: Your trash can cleaning is scheduled for tomorrow (${serviceDate}). Please ensure cans are accessible. - CleanCans Pro`;
  }
}

export const smsService = new SMSService();
