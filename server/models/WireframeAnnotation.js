import mongoose from 'mongoose';

const WireframeAnnotationSchema = new mongoose.Schema({
  customId: { type: String, unique: true, index: true },
  projectId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  annotations: [
    {
      id: { type: String, required: true },
      x: { type: Number, required: true }, // percentage 0-100
      y: { type: Number, required: true }, // percentage 0-100
      comment: { type: String, required: true },
      authorId: { type: String, required: true },
      authorName: { type: String, required: true },
      authorRole: { type: String, default: 'client' },
      status: { type: String, enum: ['open', 'resolved'], default: 'open' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  uploadedById: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const WireframeAnnotation = mongoose.models.WireframeAnnotation || mongoose.model('WireframeAnnotation', WireframeAnnotationSchema);
