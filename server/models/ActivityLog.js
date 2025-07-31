const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    enum: [
      'message_sent', 'message_received', 'call_made', 'call_received',
      'payment_received', 'payment_plan_created', 'status_changed',
      'risk_updated', 'document_uploaded', 'verification_completed',
      'integration_sync', 'note_added', 'reminder_set'
    ],
    required: true 
  },
  category: {
    type: String,
    enum: ['communication', 'payment', 'system', 'verification', 'integration'],
    required: true
  },
  details: {
    description: String,
    amount: Number,
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    metadata: mongoose.Schema.Types.Mixed
  },
  timestamp: { type: Date, default: Date.now },
  sessionInfo: {
    ipAddress: String,
    userAgent: String,
    location: String,
    sessionId: String
  },
  outcome: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    default: 'success'
  },
  tags: [String],
  isSystemGenerated: { type: Boolean, default: false }
}, { 
  timestamps: true,
  index: { client: 1, timestamp: -1 }
});

// Static method to log activities
activityLogSchema.statics.logActivity = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    
    // Emit real-time update
    if (global.io) {
      global.io.emit('activity_logged', {
        clientId: data.client,
        activity: log
      });
    }
    
    return log;
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Get activity timeline for a client
activityLogSchema.statics.getClientTimeline = async function(clientId, limit = 50) {
  return this.find({ client: clientId })
    .populate('user', 'fullName email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Get activity analytics
activityLogSchema.statics.getActivityAnalytics = async function(clientId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const pipeline = [
    {
      $match: {
        client: mongoose.Types.ObjectId(clientId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          category: '$category',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.category',
        dailyActivity: {
          $push: {
            date: '$_id.date',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('ActivityLog', activityLogSchema);

