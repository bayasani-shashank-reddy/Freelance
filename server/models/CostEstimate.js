import mongoose from 'mongoose';

const CostEstimateSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  clientBudget: { type: Number, default: 0 },
  currency: { type: String, default: 'INR (₹)' },
  hourlyRate: { type: Number, default: 1200 },
  totalHours: { type: Number, default: 0 },
  components: {
    uiUx: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    frontend: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    backend: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    database: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    apiIntegration: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    testing: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    deployment: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    documentation: { hours: { type: Number, default: 0 }, rate: { type: Number, default: 1200 }, cost: { type: Number, default: 0 } },
    contingencyPercentage: { type: Number, default: 15 },
    contingencyAmount: { type: Number, default: 0 }
  },
  estimatedMinTotal: { type: Number, default: 0 },
  estimatedMaxTotal: { type: Number, default: 0 },
  estimatedTotal: { type: Number, default: 0 },
  budgetFeasibility: {
    type: String,
    enum: ['potentially_insufficient', 'within_estimated_range', 'above_estimated_range', 'needs_clarification'],
    default: 'needs_clarification'
  },
  feasibilityNotes: { type: String, default: '' },
  adminApprovedAmount: { type: Number, default: 0 },
  finalizedAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      'Pending Analysis',
      'AI Analyzed',
      'Under Admin Review',
      'Budget Insufficient',
      'Revision Requested',
      'Approved',
      'On Hold',
      'Finalized'
    ],
    default: 'Pending Analysis'
  },
  statusHistory: [
    {
      status: { type: String },
      changedBy: { type: String },
      reason: { type: String },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CostEstimate = mongoose.models.CostEstimate || mongoose.model('CostEstimate', CostEstimateSchema);

