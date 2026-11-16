import mongoose from 'mongoose';

const ProjectTaskSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Under Review', 'Completed', 'Delayed', 'To Do', 'Review', 'Done'],
    default: 'Not Started'
  },
  isMilestone: { type: Boolean, default: false },
  expectedDuration: { type: String, default: '1 Week' },
  startDate: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  assigneeId: { type: String, default: '' },
  assigneeName: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  associatedDeliverableId: { type: String, default: '' },
  completionNotes: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  worklog: [
    {
      hours: { type: Number, required: true },
      note: { type: String, default: '' },
      loggedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const ProjectTask = mongoose.models.ProjectTask || mongoose.model('ProjectTask', ProjectTaskSchema);

