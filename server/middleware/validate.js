import { z } from 'zod';

export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed.',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(400).json({ error: 'Malformed request payload.' });
    }
  };
};

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  company: z.string().optional()
});

export const loginSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required')
});

export const projectSubmissionSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  projectTitle: z.string().min(3, 'Project title must be at least 3 characters').trim(),
  rawIdea: z.string().optional(),
  referenceUrl: z.string().optional(),
  aiCategory: z.string().optional(),
  expectedBudget: z.string().optional(),
  preferredTimeline: z.string().optional()
}).passthrough();
