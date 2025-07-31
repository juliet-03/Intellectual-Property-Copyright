const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: String,
  phone: String,
  location: String,
  amountOwed: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'overdue', 'paid'],
    default: 'active',
  },
  riskScore: {
    type: Number,
    default: 0, // 0–100 risk score based on behavior
  },
  lastContacted: Date,
  notes: [String],
  
  // Enhanced risk factors
  riskFactors: {
    paymentHistory: {
      onTimePayments: { type: Number, default: 0 },
      latePayments: { type: Number, default: 0 },
      missedPayments: { type: Number, default: 0 },
      averageDelayDays: { type: Number, default: 0 }
    },
    financialProfile: {
      debtToIncomeRatio: { type: Number, default: 0 },
      creditScore: { type: Number, default: 0 },
      employmentStatus: { 
        type: String, 
        enum: ['employed', 'unemployed', 'self_employed', 'retired'],
        default: 'employed'
      },
      monthlyIncome: { type: Number, default: 0 }
    },
    behavioralFactors: {
      communicationScore: { type: Number, default: 100 },
      responseRate: { type: Number, default: 100 },
      cooperationLevel: { 
        type: String, 
        enum: ['high', 'medium', 'low'],
        default: 'medium'
      },
      disputeHistory: { type: Number, default: 0 }
    },
    externalFactors: {
      economicRegion: { type: String },
      industryRisk: { type: Number, default: 50 },
      seasonalFactors: { type: Number, default: 0 }
    }
  },
  
  // ML-based risk prediction
  mlRiskScore: { type: Number, default: 0 },
  riskTrend: { type: String, enum: ['improving', 'stable', 'declining'], default: 'stable' },
  lastRiskUpdate: { type: Date, default: Date.now }
}, { timestamps: true });

// Enhanced risk calculation with ML integration
clientSchema.methods.calculateAdvancedRiskScore = function() {
  const factors = this.riskFactors;
  let score = 0;
  
  // Payment History Analysis (35% weight)
  const totalPayments = factors.paymentHistory.onTimePayments + 
                       factors.paymentHistory.latePayments + 
                       factors.paymentHistory.missedPayments;
  
  if (totalPayments > 0) {
    const onTimeRate = factors.paymentHistory.onTimePayments / totalPayments;
    const missedRate = factors.paymentHistory.missedPayments / totalPayments;
    score += (1 - onTimeRate) * 35 + missedRate * 10;
  }
  
  // Financial Profile (30% weight)
  score += Math.min(factors.financialProfile.debtToIncomeRatio * 30, 30);
  
  if (factors.financialProfile.creditScore > 0) {
    score += Math.max(0, (850 - factors.financialProfile.creditScore) / 850 * 20);
  }
  
  // Behavioral Factors (25% weight)
  score += (100 - factors.behavioralFactors.communicationScore) / 100 * 15;
  score += (100 - factors.behavioralFactors.responseRate) / 100 * 10;
  
  // External Factors (10% weight)
  score += factors.externalFactors.industryRisk / 100 * 5;
  score += factors.externalFactors.seasonalFactors / 100 * 5;
  
  // Apply ML adjustment if available
  if (this.mlRiskScore > 0) {
    score = (score * 0.7) + (this.mlRiskScore * 0.3);
  }
  
  this.riskScore = Math.min(Math.round(score), 100);
  this.lastRiskUpdate = new Date();
  
  return this.riskScore;
};

// Risk trend analysis
clientSchema.methods.updateRiskTrend = function() {
  // Compare current risk with historical data
  const currentRisk = this.riskScore;
  const historicalAvg = this.riskHistory?.slice(-5).reduce((a, b) => a + b, 0) / 5 || currentRisk;
  
  if (currentRisk < historicalAvg - 5) {
    this.riskTrend = 'improving';
  } else if (currentRisk > historicalAvg + 5) {
    this.riskTrend = 'declining';
  } else {
    this.riskTrend = 'stable';
  }
};

// Risk-based action recommendations
clientSchema.methods.getRecommendedActions = function() {
  const actions = [];
  
  if (this.riskScore >= 80) {
    actions.push({
      priority: 'high',
      action: 'immediate_contact',
      description: 'Immediate phone contact required'
    });
    actions.push({
      priority: 'high',
      action: 'payment_plan',
      description: 'Offer structured payment plan'
    });
  } else if (this.riskScore >= 60) {
    actions.push({
      priority: 'medium',
      action: 'follow_up',
      description: 'Schedule follow-up within 3 days'
    });
  } else if (this.riskScore >= 40) {
    actions.push({
      priority: 'low',
      action: 'reminder',
      description: 'Send payment reminder'
    });
  }
  
  return actions;
};

module.exports = mongoose.model('Client', clientSchema);
