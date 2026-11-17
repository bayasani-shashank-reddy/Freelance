/**
 * NexusCraft Unified REST API Client
 * Connects frontend directly to Express/MongoDB backend.
 */

const getApiBase = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  // In production (Render, Vercel, or unified port), use current host's /api
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    if (port !== '5173' && port !== '5174') {
      return `${window.location.origin}/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

export const api = {
  // Document Download URL Helper
  getDocumentDownloadUrl(storagePath?: string | null) {
    if (!storagePath) return '';
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;
    const base = API_BASE.replace(/\/api$/, '');
    return `${base}${storagePath.startsWith('/') ? '' : '/'}${storagePath}`;
  },

  // Health
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  // Auth & Users
  async register(data: { name: string; email: string; phone?: string; countryCode?: string; password?: string; company?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async login(credentials: { identifier?: string; email?: string; phone?: string; password?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getUsers() {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createUser(userData: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteUser(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async purgeDemoUsers() {
    try {
      const res = await fetch(`${API_BASE}/auth/users/purge-demo`, {
        method: 'POST'
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getProfile(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // AI Scoping Preview (FREE — No credits charged)
  async generatePreview(data: { title: string; referenceUrl?: string; docText?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Project Requests
  async submitProject(projectData: any) {
    try {
      const res = await fetch(`${API_BASE}/projects/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getProjects(params?: { status?: string; search?: string }) {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getClientProjects(clientId: string) {
    try {
      const res = await fetch(`${API_BASE}/projects/client/${clientId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getProject(id: string) {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateProjectStatus(id: string, update: { status: string; internalNote?: string; userVisibleNote?: string; adminId?: string; adminName?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateProjectNotes(id: string, notes: { internalNote?: string; userVisibleNote?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // NCX Credits
  async getCreditsBalance(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/credits/balance/${userId}`);
      return await res.json();
    } catch {
      return { success: false, credits: 0 };
    }
  },

  async getCreditsTransactions(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/credits/transactions/${userId}`);
      return await res.json();
    } catch {
      return { success: false, transactions: [] };
    }
  },

  async getAllCredits() {
    try {
      const res = await fetch(`${API_BASE}/credits/all`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async adminAdjustCredits(data: { userId: string; amount: number; reason: string; adminId?: string }) {
    try {
      const res = await fetch(`${API_BASE}/credits/admin-adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async topUpCredits(data: { userId: string; packageId: string; tokens: number; amountPaid: number; currency?: string; paymentMethod?: string }) {
    try {
      const res = await fetch(`${API_BASE}/credits/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Private Freelancers (Admin Managed)
  async getFreelancers() {
    try {
      const res = await fetch(`${API_BASE}/freelancers`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createFreelancer(data: any) {
    try {
      const res = await fetch(`${API_BASE}/freelancers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateFreelancer(id: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteFreelancer(id: string) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/${id}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getFreelancerShares(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/${freelancerId}/shares`);
      return await res.json();
    } catch {
      return { success: false, shares: [] };
    }
  },

  async submitFreelancerAssessment(data: any) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Document Upload & Sharing
  async uploadDocument(formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async shareDocument(data: { requestId: string; freelancerIds: string[]; adminInstructions?: string; dueDate?: string; adminId?: string }) {
    try {
      const res = await fetch(`${API_BASE}/documents/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async revokeDocumentShare(shareId: string) {
    try {
      const res = await fetch(`${API_BASE}/documents/revoke-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getRequestShares(requestId: string) {
    try {
      const res = await fetch(`${API_BASE}/documents/shares/${requestId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // Contact History (Calls & Emails)
  async getContactLogs(requestId?: string) {
    try {
      const url = requestId ? `${API_BASE}/contacts/request/${requestId}` : `${API_BASE}/contacts`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async addContactLog(data: any) {
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Notifications
  async getNotifications(recipientId: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${recipientId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PATCH' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async markAllNotificationsRead(recipientId: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all/${recipientId}`, { method: 'PATCH' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // ARCHITECTURAL BLUEPRINTS (17 SECTIONS)
  // ─────────────────────────────────────────────────────────────
  async getBlueprint(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${projectId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async generateBlueprint(data: { projectId: string; title: string; rawIdea?: string; category?: string }) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async approveBlueprint(id: string) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${id}/approve`, { method: 'PATCH' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async shareBlueprintWithClient(id: string) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${id}/share-client`, { method: 'PATCH' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // IDEA VAULT (FREE DRAFT OPERATIONS)
  // ─────────────────────────────────────────────────────────────
  async getClientDrafts(clientId: string) {
    try {
      const res = await fetch(`${API_BASE}/drafts/client/${clientId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createDraft(data: any) {
    try {
      const res = await fetch(`${API_BASE}/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateDraft(id: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteDraft(id: string) {
    try {
      const res = await fetch(`${API_BASE}/drafts/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // NEXUS COST INTELLIGENCE (HOURS × RATE + CONTINGENCY)
  // ─────────────────────────────────────────────────────────────
  async getCostDashboard() {
    try {
      const res = await fetch(`${API_BASE}/costs/dashboard`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getProjectCost(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/costs/project/${projectId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async generateCostEstimate(data: { projectId: string; hourlyRate?: number; clientBudget?: number; complexity?: string }) {
    try {
      const res = await fetch(`${API_BASE}/costs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateCostComponents(id: string, data: { components: any; adminId?: string; reason?: string }) {
    try {
      const res = await fetch(`${API_BASE}/costs/${id}/components`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateCostStatus(id: string, data: { status: string; adminApprovedAmount?: number; finalizedAmount?: number; reason?: string; adminId?: string }) {
    try {
      const res = await fetch(`${API_BASE}/costs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // FEASIBILITY ASSESSMENTS
  // ─────────────────────────────────────────────────────────────
  async getRequestAssessments(requestId: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/request/${requestId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getFreelancerAssessments(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/assessments/freelancer/${freelancerId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async submitAssessment(data: any) {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateAssessmentStatus(id: string, data: { status: string; adminFeedback?: string; adminId?: string }) {
    try {
      const res = await fetch(`${API_BASE}/assessments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // FREELANCER QUOTATIONS (VERSION PRESERVED)
  // ─────────────────────────────────────────────────────────────
  async getRequestQuotations(requestId: string) {
    try {
      const res = await fetch(`${API_BASE}/quotations/request/${requestId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getFreelancerQuotations(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/quotations/freelancer/${freelancerId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async submitQuotation(data: any) {
    try {
      const res = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateQuotationStatus(id: string, data: { status: string; adminFeedback?: string; adminId?: string }) {
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // NEXUS DELIVERABLE CENTER & ZIP INSPECTOR
  // ─────────────────────────────────────────────────────────────
  async uploadDeliverableZip(formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}/deliverables/upload-zip`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getProjectDeliverables(projectId: string, role?: string) {
    try {
      const query = role ? `?role=${role}` : '';
      const res = await fetch(`${API_BASE}/deliverables/project/${projectId}${query}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getFreelancerDeliverables(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/deliverables/freelancer/${freelancerId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async updateDeliverableStatus(id: string, data: { status: string; adminFeedback?: string; adminId?: string }) {
    try {
      const res = await fetch(`${API_BASE}/deliverables/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async releaseDeliverableToClient(id: string, adminId?: string) {
    try {
      const res = await fetch(`${API_BASE}/deliverables/${id}/release-client`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // CLARIFICATION CENTER (STRUCTURED Q&A)
  // ─────────────────────────────────────────────────────────────
  async getProjectClarifications(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/clarifications/project/${projectId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createClarification(data: any) {
    try {
      const res = await fetch(`${API_BASE}/clarifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async answerClarification(id: string, data: { answer: string; answeredBy?: any; supportingDocs?: string[] }) {
    try {
      const res = await fetch(`${API_BASE}/clarifications/${id}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateClarificationStatus(id: string, status: string) {
    try {
      const res = await fetch(`${API_BASE}/clarifications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // PROJECT TASK WORKBOARD
  // ─────────────────────────────────────────────────────────────
  async getProjectTasks(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/tasks/project/${projectId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getFreelancerTasks(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/tasks/freelancer/${freelancerId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createTask(data: any) {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateTask(id: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // ANALYTICS, AUDIT LOG & ACTIVITIES
  // ─────────────────────────────────────────────────────────────
  async getAdminAnalytics() {
    try {
      const res = await fetch(`${API_BASE}/analytics/admin`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async createAuditLog(data: any) {
    try {
      const res = await fetch(`${API_BASE}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getProjectActivities(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/activities/project/${projectId}`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  // ─────────────────────────────────────────────────────────────
  // 12 CLIENT AI TOOLS & ADMIN PROJECT INTELLIGENCE
  // ─────────────────────────────────────────────────────────────
  async runAITool(tool: string, data: { title?: string; input?: string; category?: string; context?: any }) {
    try {
      const res = await fetch(`${API_BASE}/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, ...data })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // PUBLIC AI BLUEPRINT SANDBOX (Section A)
  // ─────────────────────────────────────────────────────────────
  async getPublicAiSandbox(prompt?: string, chipKey?: string) {
    try {
      const res = await fetch(`${API_BASE}/ai/public-sandbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, chipKey })
      });
      return await res.json();
    } catch (err: any) {
      return { error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // FREELANCER ENHANCEMENTS (Section C)
  // ─────────────────────────────────────────────────────────────
  async getFreelancerProfileCompletion(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/profile-completion/${freelancerId}`);
      if (!res.ok) return { score: 70, breakdown: {}, missingFields: [] };
      return await res.json();
    } catch {
      return { score: 70, breakdown: {}, missingFields: [] };
    }
  },

  async updateFreelancerProfile(freelancerId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/profile/${freelancerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getSmartFreelancerMatches(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/matching/${projectId}`);
      if (!res.ok) return { success: false, recommendations: [] };
      return await res.json();
    } catch {
      return { success: false, recommendations: [] };
    }
  },

  async getFreelancerTimeline(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/tasks/timeline/${freelancerId}`);
      if (!res.ok) return { timeline: [] };
      return await res.json();
    } catch {
      return { timeline: [] };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // ADMIN QUICK ACTION DRAWER & COMMERCIAL TERMS (Section D)
  // ─────────────────────────────────────────────────────────────
  async updateProjectPriority(projectId: string, priority: string, adminInfo?: { adminId?: string; adminName?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority, ...adminInfo })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateProjectCommercials(projectId: string, commercials: any) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/commercials`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commercials)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async assignFreelancerToProject(projectId: string, data: { freelancerId: string; freelancerName?: string; adminName?: string; notes?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/assign-freelancer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // CLIENT BLUEPRINT EDITOR & SUGGESTIONS (Section B)
  // ─────────────────────────────────────────────────────────────
  async clientEditBlueprint(blueprintId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${blueprintId}/client-edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async aiSuggestBlueprint(blueprintId: string, focus = 'milestones') {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${blueprintId}/ai-suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateTaskMilestone(taskId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // UNIQUE ROLE FEATURES (Client, Admin, Freelancer)
  // ─────────────────────────────────────────────────────────────

  // Client Scope Change Center
  async submitScopeChange(projectId: string, payload: { title: string; description: string; reason?: string; affectedRequirements?: string[]; estimatedBudgetImpact?: number; estimatedTimelineImpact?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/scope-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Admin Scope Change Review
  async reviewScopeChange(projectId: string, changeId: string, payload: { status: string; adminNotes?: string; budgetImpact?: number; timelineImpact?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/scope-changes/${changeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Project Decision Center
  async createDecision(projectId: string, payload: { title: string; description: string; decisionType?: string; deadline?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async respondToDecision(projectId: string, decisionId: string, payload: { status: string; clientFeedback?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/decisions/${decisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Client Final Handover Acceptance
  async recordHandoverAcceptance(projectId: string, payload: { status: string; rating?: number; feedback?: string; issues?: string[] }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/acceptance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Freelancer Effort vs Estimate Tracker
  async logFreelancerWork(projectId: string, payload: { freelancerId: string; freelancerName?: string; taskTitle: string; estimatedHours: number; actualHours: number; workCompleted?: string; remainingWork?: string; deviationReason?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/worklogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Freelancer Technical Handover Generator
  async saveHandoverDoc(projectId: string, payload: { overview: string; technologies: string[]; installationInstructions: string; envVariables?: string[]; databaseSetup?: string; startupInstructions: string; keyModules?: string[]; knownLimitations?: string; futureRecommendations?: string; authorName?: string }) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Admin SLA & Bottleneck Radar
  async getSlaRadar() {
    try {
      const res = await fetch(`${API_BASE}/projects/operations/sla-radar`);
      if (!res.ok) return { summary: { total: 0, onTrack: 0, atRisk: 0, breaches: 0 }, items: [] };
      return await res.json();
    } catch {
      return { summary: { total: 0, onTrack: 0, atRisk: 0, breaches: 0 }, items: [] };
    }
  },

  // ── PHASE 1: AUTH & SECURITY METHODS ──
  async forgotPassword(email: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async verifyEmail(token: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async generate2FA(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async verify2FA(userId: string, code: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getSessions(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/sessions/${userId}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async revokeSession(sessionId: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/sessions/revoke/${sessionId}`, { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateProfile(userId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async sendPhoneOtp(userId: string, phone: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/phone/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, phone })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async verifyPhoneOtp(userId: string, code: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/phone/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async verifyGoogleAccount(userId: string, googleEmail?: string, googleId?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/google/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, googleEmail, googleId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleUserVerification(userId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/toggle-verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateProjectReference(projectId: string, data: any) {
    try {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reference`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── PHASE 2: FINANCIAL INTEGRITY & ORDERS ──
  async createPaymentOrder(userId: string, packageId: string, currency = 'INR') {
    try {
      const res = await fetch(`${API_BASE}/credits/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId, currency })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async verifyPaymentOrder(orderId: string, providerPaymentId?: string) {
    try {
      const res = await fetch(`${API_BASE}/credits/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, providerPaymentId })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async lockMilestoneEscrow(payload: { clientId: string; projectId: string; projectTitle?: string; amountNCX: number; milestoneTitle?: string }) {
    try {
      const res = await fetch(`${API_BASE}/credits/escrow-lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async releaseMilestoneEscrowFunds(payload: { clientId: string; specialistId: string; projectId: string; amountNCX: number; milestoneTitle?: string }) {
    try {
      const res = await fetch(`${API_BASE}/credits/escrow-release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── PHASE 4: IN-APP CHAT ──
  async getProjectChat(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/chat/project/${projectId}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async sendProjectChat(projectId: string, payload: { senderId: string; senderName: string; senderRole: string; senderAvatar?: string; text: string; attachment?: any }) {
    try {
      const res = await fetch(`${API_BASE}/chat/project/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── PHASE 5: BLUEPRINTS, DIFFS & TEAMS ──
  async getBlueprintVersions(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${projectId}/versions`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async createBlueprintShareLink(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/${projectId}/share-link`, { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getSharedBlueprint(token: string) {
    try {
      const res = await fetch(`${API_BASE}/blueprints/shared/${token}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getClientTeam(clientId: string) {
    try {
      const res = await fetch(`${API_BASE}/teams/client/${clientId}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async inviteTeamMember(payload: { clientId: string; name: string; email: string; role?: string }) {
    try {
      const res = await fetch(`${API_BASE}/teams/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async removeTeamMember(clientId: string, memberId: string) {
    try {
      const res = await fetch(`${API_BASE}/teams/member/${clientId}/${memberId}`, { method: 'DELETE' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getProjectWireframes(projectId: string) {
    try {
      const res = await fetch(`${API_BASE}/wireframes/project/${projectId}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async addWireframeAnnotation(wireframeId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/wireframes/${wireframeId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── PHASE 6: DISPUTES, BULK ACTIONS & FORECASTING ──
  async getDisputes() {
    try {
      const res = await fetch(`${API_BASE}/disputes`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async createDispute(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resolveDispute(disputeId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async bulkActionProjects(action: string, projectIds: string[], payload?: any) {
    try {
      const res = await fetch(`${API_BASE}/projects/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, projectIds, payload })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getFinancialForecasting() {
    try {
      const res = await fetch(`${API_BASE}/costs/forecasting`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async getPlatformSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async updatePlatformSettings(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ── PHASE 7: SPECIALIST EARNINGS, INVOICES & SKILLS ──
  async getSpecialistInvoices(freelancerId: string) {
    try {
      const res = await fetch(`${API_BASE}/invoices/specialist/${freelancerId}`);
      return await res.json();
    } catch {
      return { totalEarnings: 0, pendingPayout: 0, invoices: [] };
    }
  },

  async createInvoice(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getSkillAssessments() {
    try {
      const res = await fetch(`${API_BASE}/skills/assessments`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async submitSkillAssessment(payload: { userId: string; assessmentId: string; answers: number[] }) {
    try {
      const res = await fetch(`${API_BASE}/skills/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getPublicSpecialistProfile(specialistId: string) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/public/${specialistId}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateSpecialistAvailability(specialistId: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/freelancers/availability/${specialistId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Document Requirements & Templates System
  // ─────────────────────────────────────────────────────────────
  async getDocumentTemplates(params?: { category?: string; search?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      const res = await fetch(`${API_BASE}/document-requirements/templates?${q.toString()}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async createDocumentTemplate(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateDocumentTemplate(id: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async duplicateDocumentTemplate(id: string, createdBy = 'Admin') {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/templates/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createdBy })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteDocumentTemplate(id: string) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/templates/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async assignTemplateToProjects(templateId: string, projectIds: string[], assignedBy = 'Admin') {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/templates/${templateId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds, assignedBy })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Document Requirements Builder & Management
  async getDocumentRequirements(params?: { projectId?: string; clientId?: string; status?: string; stage?: string; category?: string; search?: string; submissionStatus?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.projectId) q.set('projectId', params.projectId);
      if (params?.clientId) q.set('clientId', params.clientId);
      if (params?.status) q.set('status', params.status);
      if (params?.stage) q.set('stage', params.stage);
      if (params?.category) q.set('category', params.category);
      if (params?.submissionStatus) q.set('submissionStatus', params.submissionStatus);
      if (params?.search) q.set('search', params.search);
      const res = await fetch(`${API_BASE}/document-requirements/requirements?${q.toString()}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async createDocumentRequirement(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateDocumentRequirement(id: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/requirements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteDocumentRequirement(id: string, actorName = 'Admin') {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/requirements/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async duplicateDocumentRequirement(id: string) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/requirements/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async sendDocumentReminder(id: string, actorName = 'Admin') {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/requirements/${id}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Client Document Portal
  async getClientDocumentRequirements(clientId: string, projectId?: string) {
    try {
      const q = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
      const res = await fetch(`${API_BASE}/document-requirements/client/${encodeURIComponent(clientId)}${q}`);
      return await res.json();
    } catch {
      return { metrics: { total: 0, submitted: 0, approved: 0, pending: 0, revision: 0, rejected: 0, overdue: 0, completionPercent: 0 }, requirements: [] };
    }
  },

  async uploadClientDocumentSubmission(formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/upload-submission`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getDocumentSubmissionHistory(requirementId: string) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/submissions/${encodeURIComponent(requirementId)}/history`);
      return await res.json();
    } catch {
      return { versions: [], currentVersionNumber: 0, status: 'Not Submitted' };
    }
  },

  // Admin Review Workspace
  async getDocumentReviews(params?: { status?: string; projectId?: string; search?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.projectId) q.set('projectId', params.projectId);
      if (params?.search) q.set('search', params.search);
      const res = await fetch(`${API_BASE}/document-requirements/reviews?${q.toString()}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async approveDocumentReview(id: string, payload: { reviewerId?: string; reviewerName?: string; internalNotes?: string }) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/reviews/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async requestDocumentRevision(id: string, payload: { reason: string; instructions: string; revisionDeadline?: string | null; internalNotes?: string; reviewerId?: string; reviewerName?: string }) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/reviews/${id}/request-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async rejectDocumentReview(id: string, payload: { reason: string; instructions?: string; internalNotes?: string; reviewerId?: string; reviewerName?: string }) {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/reviews/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Compliance Telemetry & CSV
  async getDocumentComplianceOverview() {
    try {
      const res = await fetch(`${API_BASE}/document-requirements/compliance/overview`);
      return await res.json();
    } catch {
      return { summary: {}, projects: [] };
    }
  },

  getDocumentComplianceExportUrl() {
    return `${API_BASE}/document-requirements/compliance/export-csv`;
  },

  // Sub-Admins Management & Audit Logs
  async getSubAdmins(params?: { department?: string; role?: string; status?: string; search?: string }) {
    try {
      const q = new URLSearchParams();
      if (params?.department) q.set('department', params.department);
      if (params?.role) q.set('role', params.role);
      if (params?.status) q.set('status', params.status);
      if (params?.search) q.set('search', params.search);
      const res = await fetch(`${API_BASE}/sub-admins?${q.toString()}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async createSubAdmin(payload: any) {
    try {
      const res = await fetch(`${API_BASE}/sub-admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateSubAdminPermissions(id: string, payload: any) {
    try {
      const res = await fetch(`${API_BASE}/sub-admins/${id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async toggleSubAdminStatus(id: string, status: string, actorName = 'Super Admin') {
    try {
      const res = await fetch(`${API_BASE}/sub-admins/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorName })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteSubAdmin(id: string, actorName = 'Super Admin') {
    try {
      const res = await fetch(`${API_BASE}/sub-admins/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getAdminActivityLogs(params?: { action?: string; resourceType?: string; search?: string; limit?: number }) {
    try {
      const q = new URLSearchParams();
      if (params?.action) q.set('action', params.action);
      if (params?.resourceType) q.set('resourceType', params.resourceType);
      if (params?.search) q.set('search', params.search);
      if (params?.limit) q.set('limit', String(params.limit));
      const res = await fetch(`${API_BASE}/sub-admins/logs/activity?${q.toString()}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  // Intake Reference Template (Admin-managed reference document for client submission)
  async getIntakeReferenceTemplate() {
    try {
      const res = await fetch(`${API_BASE}/settings/intake-template`);
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateIntakeReferenceTemplate(formData: FormData) {
    try {
      const res = await fetch(`${API_BASE}/settings/intake-template`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async resetIntakeReferenceTemplate(adminId = 'admin', adminName = 'Administrator') {
    try {
      const res = await fetch(`${API_BASE}/settings/intake-template/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, adminName })
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
