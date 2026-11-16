import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  recipientId: { type: String, required: true, index: true }, // customId of user or 'admin'
  recipientRole: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // info, success, warning, credit, document
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
