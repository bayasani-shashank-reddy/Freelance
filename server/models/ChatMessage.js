import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  projectTitle: { type: String, default: '' },
  senderId: { type: String, required: true, index: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['client', 'freelancer', 'admin'], required: true },
  senderAvatar: { type: String, default: '' },
  text: { type: String, required: true },
  attachment: {
    fileName: { type: String },
    fileUrl: { type: String },
    fileSize: { type: String },
    fileType: { type: String }
  },
  readBy: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
