import mongoose from 'mongoose';

const AdminClientMessageSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  conversationId: { type: String, required: true, index: true }, // Client ID
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  senderAvatar: { type: String, default: '' },
  senderRole: { type: String, enum: ['admin', 'client'], required: true },
  text: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  attachmentName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const AdminClientMessage = mongoose.model('AdminClientMessage', AdminClientMessageSchema);
