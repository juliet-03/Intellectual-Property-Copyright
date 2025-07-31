const axios = require('axios');
const ActivityLog = require('../models/ActivityLog');

class IntegrationService {
  constructor() {
    this.integrations = {
      loanCompany: {
        baseUrl: process.env.LOAN_COMPANY_API_URL,
        apiKey: process.env.LOAN_COMPANY_API_KEY,
        enabled: process.env.LOAN_COMPANY_INTEGRATION === 'true'
      },
      creditBureau: {
        baseUrl: process.env.CREDIT_BUREAU_API_URL,
        apiKey: process.env.CREDIT_BUREAU_API_KEY,
        enabled: process.env.CREDIT_BUREAU_INTEGRATION === 'true'
      },
      paymentGateway: {
        baseUrl: process.env.PAYMENT_GATEWAY_API_URL,
        apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
        enabled: process.env.PAYMENT_GATEWAY_INTEGRATION === 'true'
      },
      smsProvider: {
        baseUrl: process.env.SMS_PROVIDER_API_URL,
        apiKey: process.env.SMS_PROVIDER_API_KEY,
        enabled: process.env.SMS_INTEGRATION === 'true'
      }
    };
  }

  // Loan Company Integration
  async syncWithLoanCompany(clientData, userId) {
    if (!this.integrations.loanCompany.enabled) {
      throw new Error('Loan company integration not enabled');
    }

    try {
      const response = await axios.post(
        `${this.integrations.loanCompany.baseUrl}/sync`,
        {
          clientId: clientData._id,
          amount: clientData.amountOwed,
          status: clientData.status,
          lastPayment: clientData.lastPaymentDate,
          riskScore: clientData.riskScore
        },
        {
          headers: {
            'Authorization': `Bearer ${this.integrations.loanCompany.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the integration activity
      await ActivityLog.logActivity({
        client: clientData._id,
        user: userId,
        action: 'integration_sync',
        category: 'integration',
        details: {
          description: 'Synced client data with loan company',
          integration: 'loan_company',
          response: response.data
        },
        outcome: 'success'
      });

      return response.data;
    } catch (error) {
      await ActivityLog.logActivity({
        client: clientData._id,
        user: userId,
        action: 'integration_sync',
        category: 'integration',
        details: {
          description: 'Failed to sync with loan company',
          integration: 'loan_company',
          error: error.message
        },
        outcome: 'failed'
      });
      throw error;
    }
  }

  // Credit Bureau Verification
  async validateClientWithCreditBureau(clientId, userId) {
    if (!this.integrations.creditBureau.enabled) {
      throw new Error('Credit bureau integration not enabled');
    }

    try {
      const response = await axios.get(
        `${this.integrations.creditBureau.baseUrl}/verify/${clientId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.integrations.creditBureau.apiKey}`
          }
        }
      );

      const verificationData = response.data;

      // Update client with credit bureau data
      const Client = require('../models/Client');
      await Client.findByIdAndUpdate(clientId, {
        'riskFactors.financialProfile.creditScore': verificationData.creditScore,
        'verification.creditBureau': {
          verified: true,
          score: verificationData.creditScore,
          verifiedAt: new Date(),
          reportId: verificationData.reportId
        }
      });

      await ActivityLog.logActivity({
        client: clientId,
        user: userId,
        action: 'verification_completed',
        category: 'verification',
        details: {
          description: 'Credit bureau verification completed',
          creditScore: verificationData.creditScore,
          reportId: verificationData.reportId
        },
        outcome: 'success'
      });

      return verificationData;
    } catch (error) {
      await ActivityLog.logActivity({
        client: clientId,
        user: userId,
        action: 'verification_completed',
        category: 'verification',
        details: {
          description: 'Credit bureau verification failed',
          error: error.message
        },
        outcome: 'failed'
      });
      throw error;
    }
  }

  // Payment Gateway Integration
  async processPayment(clientId, amount, paymentMethod, userId) {
    if (!this.integrations.paymentGateway.enabled) {
      throw new Error('Payment gateway integration not enabled');
    }

    try {
      const response = await axios.post(
        `${this.integrations.paymentGateway.baseUrl}/process`,
        {
          clientId,
          amount,
          paymentMethod,
          currency: 'USD'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.integrations.paymentGateway.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const paymentData = response.data;

      if (paymentData.status === 'success') {
        // Update client payment record
        const Client = require('../models/Client');
        const client = await Client.findById(clientId);
        client.amountOwed -= amount;
        client.lastPaymentDate = new Date();
        client.paymentHistory.push({
          amount,
          date: new Date(),
          method: paymentMethod,
          transactionId: paymentData.transactionId
        });
        await client.save();

        await ActivityLog.logActivity({
          client: clientId,
          user: userId,
          action: 'payment_received',
          category: 'payment',
          details: {
            description: `Payment of $${amount} processed successfully`,
            amount,
            method: paymentMethod,
            transactionId: paymentData.transactionId
          },
          outcome: 'success'
        });
      }

      return paymentData;
    } catch (error) {
      await ActivityLog.logActivity({
        client: clientId,
        user: userId,
        action: 'payment_received',
        category: 'payment',
        details: {
          description: `Payment processing failed for $${amount}`,
          amount,
          error: error.message
        },
        outcome: 'failed'
      });
      throw error;
    }
  }

  // SMS Integration
  async sendSMS(clientId, phoneNumber, message, userId) {
    if (!this.integrations.smsProvider.enabled) {
      throw new Error('SMS integration not enabled');
    }

    try {
      const response = await axios.post(
        `${this.integrations.smsProvider.baseUrl}/send`,
        {
          to: phoneNumber,
          message,
          from: process.env.SMS_FROM_NUMBER
        },
        {
          headers: {
            'Authorization': `Bearer ${this.integrations.smsProvider.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await ActivityLog.logActivity({
        client: clientId,
        user: userId,
        action: 'message_sent',
        category: 'communication',
        details: {
          description: 'SMS sent to client',
          channel: 'sms',
          messageId: response.data.messageId
        },
        outcome: 'success'
      });

      return response.data;
    } catch (error) {
      await ActivityLog.logActivity({
        client: clientId,
        user: userId,
        action: 'message_sent',
        category: 'communication',
        details: {
          description: 'Failed to send SMS',
          channel: 'sms',
          error: error.message
        },
        outcome: 'failed'
      });
      throw error;
    }
  }

  // Webhook handler for external integrations
  async handleWebhook(source, payload) {
    try {
      switch (source) {
        case 'payment_gateway':
          await this.handlePaymentWebhook(payload);
          break;
        case 'credit_bureau':
          await this.handleCreditBureauWebhook(payload);
          break;
        case 'loan_company':
          await this.handleLoanCompanyWebhook(payload);
          break;
        default:
          console.log(`Unknown webhook source: ${source}`);
      }
    } catch (error) {
      console.error(`Webhook handling error for ${source}:`, error);
    }
  }

  async handlePaymentWebhook(payload) {
    // Handle payment status updates
    const { clientId, transactionId, status, amount } = payload;
    
    if (status === 'completed') {
      const Client = require('../models/Client');
      const client = await Client.findById(clientId);
      if (client) {
        client.amountOwed -= amount;
        client.lastPaymentDate = new Date();
        await client.save();
        
        await ActivityLog.logActivity({
          client: clientId,
          user: null,
          action: 'payment_received',
          category: 'payment',
          details: {
            description: `Webhook: Payment of $${amount} confirmed`,
            amount,
            transactionId
          },
          isSystemGenerated: true,
          outcome: 'success'
        });
      }
    }
  }

  // Health check for all integrations
  async checkIntegrationsHealth() {
    const health = {};
    
    for (const [name, config] of Object.entries(this.integrations)) {
      if (config.enabled) {
        try {
          const response = await axios.get(`${config.baseUrl}/health`, {
            headers: { 'Authorization': `Bearer ${config.apiKey}` },
            timeout: 5000
          });
          health[name] = { status: 'healthy', response: response.status };
        } catch (error) {
          health[name] = { status: 'unhealthy', error: error.message };
        }
      } else {
        health[name] = { status: 'disabled' };
      }
    }
    
    return health;
  }
}

module.exports = new IntegrationService();

