/**
 * NexusCraft MongoDB API Client
 * Connects frontend directly to Express/MongoDB backend with seamless offline fallback.
 */

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
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
  async getUsers() {
    try {
      const res = await fetch(`${API_BASE}/auth/users`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async register(userData: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async login(credentials: { email: string; password?: string }) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async approveFreelancer(id: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/freelancers/${id}/approve`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async rejectFreelancer(id: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/freelancers/${id}/reject`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async updateCredits(userId: string, amount: number, type: 'add' | 'spend') {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, type }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Ideas
  async getIdeas(clientId?: string) {
    try {
      const url = clientId ? `${API_BASE}/ideas/client/${clientId}` : `${API_BASE}/ideas`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async submitIdea(ideaData: any) {
    try {
      const res = await fetch(`${API_BASE}/ideas/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateIdeaStatus(id: string, status: string) {
    try {
      const res = await fetch(`${API_BASE}/ideas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Admin-Client Messages
  async getMessages(conversationId?: string) {
    try {
      const url = conversationId ? `${API_BASE}/messages?conversationId=${conversationId}` : `${API_BASE}/messages`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async sendMessage(msgData: any) {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Jobs
  async getJobs() {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async postJob(jobData: any) {
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Proposals
  async getProposals() {
    try {
      const res = await fetch(`${API_BASE}/proposals`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async submitProposal(propData: any) {
    try {
      const res = await fetch(`${API_BASE}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propData),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async awardProposal(proposalId: string) {
    try {
      const res = await fetch(`${API_BASE}/proposals/${proposalId}/award`, { method: 'POST' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },
};
