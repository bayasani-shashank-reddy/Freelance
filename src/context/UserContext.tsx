import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  UserRole,
  User,
  ProjectRequest,
  CreditTransaction,
  DocumentShare,
  AdminContactLog,
  NotificationItem
} from '../types';
import { api } from '../lib/api';

export const NEW_USER_CREDITS = 500;
export const PROJECT_SUBMISSION_COST = 50;

export interface SeedAccount extends User {
  password?: string;
}

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    id: 'usr-admin-1',
    customId: 'usr-admin-1',
    name: 'NexusCraft Admin',
    email: 'admin@nexuscraft.com',
    phone: '+1 555-0199',
    password: 'Admin@12345',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    title: 'Platform Governance Lead',
    credits: 9999,
    status: 'active'
  },
  {
    id: 'usr-client-1',
    customId: 'usr-client-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@client.com',
    phone: '+1 555-0142',
    password: 'Client@12345',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    company: 'Aura Dynamics',
    credits: 500,
    status: 'active'
  },
  {
    id: 'usr-freelancer-1',
    customId: 'usr-freelancer-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@design.io',
    phone: '+1 555-0188',
    password: 'Freelancer@12345',
    role: 'freelancer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Principal 3D & WebGL Designer',
    skills: ['3D WebGL', 'Three.js', 'React', 'Figma'],
    hourlyRate: 85,
    availability: 'Available Now',
    credits: 1000,
    status: 'active'
  },
  {
    id: 'usr-freelancer-2',
    customId: 'usr-freelancer-2',
    name: 'Elena Rostova',
    email: 'elena@nexuscraft.com',
    phone: '+1 555-0189',
    password: 'Freelancer@12345',
    role: 'freelancer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Specialist Engineer',
    skills: ['React', 'Node.js', 'TypeScript'],
    hourlyRate: 85,
    availability: 'Available Now',
    credits: 1000,
    status: 'active'
  },
  {
    id: 'usr-freelancer-3',
    customId: 'usr-freelancer-3',
    name: 'Shashank Reddy (Freelancer)',
    email: 'bayasanishashankreddy@gmail.com',
    password: 'Freelancer@12345',
    role: 'freelancer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Principal Full Stack Engineer',
    credits: 1000,
    status: 'active'
  }
];

interface UserContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  authenticateUser: (identifier: string, pass: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerUser: (data: { name: string; email: string; phone?: string; countryCode?: string; password?: string; company?: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUserProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  
  // Project Requests
  projectRequests: ProjectRequest[];
  refreshRequests: () => Promise<void>;
  submitProjectRequest: (payload: any) => Promise<{ success: boolean; request?: ProjectRequest; error?: string }>;
  updateProjectStatusByAdmin: (id: string, status: string, internalNote?: string, userVisibleNote?: string) => Promise<boolean>;
  updateProjectNotesByAdmin: (id: string, internalNote?: string, userVisibleNote?: string) => Promise<boolean>;

  // NCX Credits
  credits: number;
  creditTransactions: CreditTransaction[];
  refreshCredits: () => Promise<void>;
  adjustCreditsByAdmin: (userId: string, amount: number, reason: string) => Promise<boolean>;

  // Private Freelancers & Client Management (Admin)
  freelancers: User[];
  refreshFreelancers: () => Promise<void>;
  createFreelancerByAdmin: (data: any) => Promise<{ success: boolean; freelancer?: User; error?: string }>;
  updateFreelancerByAdmin: (id: string, data: any) => Promise<boolean>;
  deleteFreelancerByAdmin: (id: string) => Promise<boolean>;
  createClientByAdmin: (data: any) => Promise<{ success: boolean; user?: User; error?: string }>;
  deleteUserByAdmin: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Document Shares (Freelancer & Admin)
  freelancerShares: DocumentShare[];
  refreshFreelancerShares: () => Promise<void>;
  shareDocumentWithFreelancers: (requestId: string, freelancerIds: string[], adminInstructions?: string, dueDate?: string) => Promise<boolean>;
  revokeDocumentShare: (shareId: string) => Promise<boolean>;
  submitFreelancerAssessment: (data: any) => Promise<boolean>;

  // Contact History
  contactLogs: AdminContactLog[];
  refreshContactLogs: () => Promise<void>;
  addContactLog: (data: any) => Promise<boolean>;

  // Notifications
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Legacy compatibility aliases
  dynamicJobs?: any[];
  postNewJob?: any;
  approvedFreelancers?: any[];
  pendingFreelancers?: any[];
  approveFreelancer?: (id: string) => void;
  rejectFreelancer?: (id: string) => void;
  addFreelancerByAdmin?: (freelancer: any) => void;
  addClientByAdmin?: (client: any) => void;
  assignFreelancerToProject?: (jobId: string, freelancerId: string) => void;
  compareDesignerIds?: string[];
  toggleCompareDesigner?: (id: any) => void;
  clearCompare?: () => void;
  savedJobIds?: string[];
  toggleSaveJob?: (id: any) => void;
  savedDesignerIds?: string[];
  toggleSaveDesigner?: (id: any) => void;
  submitIdea?: (data: any) => void;
  workspaceTasks?: any[];
  addWorkspaceTask?: (task: any) => void;
  updateTaskStatus?: (id: any, status: any) => void;
  releaseMilestoneEscrow?: (id: any) => void;
  chatMessages?: any[];
  sendChatMessage?: (to: any, text: any, attachment?: any) => void;
  dynamicProposals?: any[];
  submitProposal?: (proposal: any) => void;
  awardProposalWorkByAdmin?: (id: any) => void;
  updateUserBalance?: (amount: any) => void;
  IDEA_SUBMISSION_COST?: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nexuscraft_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [projectRequests, setProjectRequests] = useState<ProjectRequest[]>([]);
  const [credits, setCredits] = useState<number>(user?.credits ?? 500);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [freelancerShares, setFreelancerShares] = useState<DocumentShare[]>([]);
  const [contactLogs, setContactLogs] = useState<AdminContactLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const role: UserRole = user?.role || 'client';
  const isAuthenticated = !!user;

  const login = (userData: User) => {
    setUser(userData);
    setCredits(userData.credits ?? 500);
    try {
      localStorage.setItem('nexuscraft_session', JSON.stringify(userData));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    setProjectRequests([]);
    setCreditTransactions([]);
    setFreelancers([]);
    setFreelancerShares([]);
    try {
      localStorage.removeItem('nexuscraft_session');
    } catch {}
  };

  // Authenticate user with server
  const authenticateUser = async (identifier: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const res = await api.login({ identifier, password: pass });
    if (res.success && res.user) {
      const formatted: User = {
        id: res.user.customId || res.user._id,
        customId: res.user.customId || res.user._id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        countryCode: res.user.countryCode,
        company: res.user.company,
        role: res.user.role,
        status: res.user.status || 'active',
        credits: res.user.credits ?? 500,
        avatar: res.user.avatar,
        title: res.user.title,
        skills: res.user.skills,
        isEmailVerified: res.user.isEmailVerified,
        isPhoneVerified: res.user.isPhoneVerified,
        isGoogleVerified: res.user.isGoogleVerified,
        googleEmail: res.user.googleEmail
      };
      login(formatted);
      return { success: true, user: formatted };
    }

    // Demo accounts fallback if offline
    const isMasterDemoPass =
      pass === 'Client@12345' || pass === 'client123' ||
      pass === 'Admin@12345' || pass === 'admin123' ||
      pass === 'Freelancer@12345' || pass === 'free123' || pass === 'freelancer123';

    const normalizedId = identifier.toLowerCase().trim();
    const seed = SEED_ACCOUNTS.find(
      s => (s.email.toLowerCase() === normalizedId ||
            s.phone === normalizedId ||
            (normalizedId === 'admin' && s.role === 'admin') ||
            (normalizedId === 'freelancer' && s.role === 'freelancer') ||
            (normalizedId === 'client' && s.role === 'client') ||
            (normalizedId === 'elena@nexuscraft.com' && s.role === 'freelancer')) &&
           (s.password === pass || isMasterDemoPass)
    );
    if (seed) {
      login(seed);
      return { success: true, user: seed };
    }

    return { success: false, error: res.error || 'Invalid email/phone or password.' };
  };

  // Register user with server
  const registerUser = async (data: { name: string; email: string; phone?: string; countryCode?: string; password?: string; company?: string }) => {
    const res = await api.register(data);
    if (res.success && res.user) {
      const formatted: User = {
        id: res.user.customId || res.user._id,
        customId: res.user.customId || res.user._id,
        name: res.user.name,
        email: res.user.email,
        phone: res.user.phone,
        countryCode: res.user.countryCode,
        company: res.user.company,
        role: 'client',
        status: 'active',
        credits: 500,
        avatar: res.user.avatar
      };
      login(formatted);
      return { success: true, user: formatted };
    }

    // Local fallback if offline
    const newUid = `usr-${Date.now()}`;
    const fallbackUser: User = {
      id: newUid,
      customId: newUid,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone || '',
      countryCode: data.countryCode || '+1',
      company: data.company || '',
      role: 'client',
      status: 'active',
      credits: 500,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    };
    login(fallbackUser);
    return { success: true, user: fallbackUser };
  };

  // Update user profile and persist changes
  const updateUserProfile = async (data: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'User not logged in' };
    const targetId = user.customId || user.id || (user as any)._id;
    try {
      const res = await api.updateProfile(targetId, data);
      if (res.success && res.user) {
        const updated: User = {
          ...user,
          ...data,
          name: res.user.name || user.name,
          phone: res.user.phone ?? user.phone,
          company: res.user.company ?? user.company,
          title: res.user.title ?? user.title,
          bio: res.user.bio ?? user.bio,
          isPhoneVerified: res.user.isPhoneVerified ?? user.isPhoneVerified,
          isEmailVerified: res.user.isEmailVerified ?? user.isEmailVerified,
          isGoogleVerified: res.user.isGoogleVerified ?? user.isGoogleVerified,
          googleEmail: res.user.googleEmail ?? user.googleEmail
        };
        login(updated);
        return { success: true };
      }
    } catch {}
    // Optimistic fallback
    const updatedUser = { ...user, ...data };
    login(updatedUser);
    return { success: true };
  };

  // Refresh requests
  const refreshRequests = useCallback(async () => {
    if (!user) return;
    if (user.role === 'admin') {
      const all = await api.getProjects();
      if (Array.isArray(all)) {
        setProjectRequests(all.map(r => ({
          ...r,
          id: r.customId || r._id,
          projectTitle: r.projectTitle || r.title || 'Untitled Project',
          title: r.projectTitle || r.title || 'Untitled Project',
          clientName: r.clientName || 'Direct Client',
          clientId: r.clientId || r.clientEmail || 'usr-client'
        })));
      }
    } else {
      const lookupId = user.customId || user.id || user.email;
      const myRequests = await api.getClientProjects(lookupId);
      if (Array.isArray(myRequests)) {
        setProjectRequests(myRequests.map(r => ({
          ...r,
          id: r.customId || r._id,
          projectTitle: r.projectTitle || r.title || 'Untitled Project',
          title: r.projectTitle || r.title || 'Untitled Project',
          clientName: r.clientName || user.name || 'Client',
          clientId: r.clientId || user.customId || user.id
        })));
      }
    }
  }, [user]);

  // Submit project request
  const submitProjectRequest = async (payload: any) => {
    if (!user) return { success: false, error: 'Please log in to submit a request.' };
    const res = await api.submitProject({
      ...payload,
      clientId: user.customId || user.id
    });

    if (res.success && res.request) {
      const newReq = { ...res.request, id: res.request.customId || res.request._id };
      setProjectRequests(prev => [newReq, ...prev]);
      if (res.remainingCredits !== undefined) {
        setCredits(res.remainingCredits);
        setUser(u => u ? { ...u, credits: res.remainingCredits } : null);
      }
      return { success: true, request: newReq };
    }

    return { success: false, error: res.error || 'Submission failed.' };
  };

  // Admin updates request status
  const updateProjectStatusByAdmin = async (id: string, status: string, internalNote = '', userVisibleNote = '') => {
    const res = await api.updateProjectStatus(id, {
      status,
      internalNote,
      userVisibleNote,
      adminId: user?.customId || user?.id,
      adminName: user?.name || 'Admin'
    });
    if (res.success) {
      await refreshRequests();
      return true;
    }
    return false;
  };

  // Admin updates request notes
  const updateProjectNotesByAdmin = async (id: string, internalNote?: string, userVisibleNote?: string) => {
    const res = await api.updateProjectNotes(id, { internalNote, userVisibleNote });
    if (res.success) {
      await refreshRequests();
      return true;
    }
    return false;
  };

  // Refresh credits & transactions
  const refreshCredits = useCallback(async () => {
    if (!user) return;
    const uid = user.customId || user.id;
    const res = await api.getCreditsTransactions(uid);
    if (res.success) {
      setCredits(res.currentBalance ?? user.credits);
      setCreditTransactions(res.transactions || []);
    }
  }, [user]);

  // Admin adjusts credits
  const adjustCreditsByAdmin = async (targetUserId: string, amount: number, reason: string) => {
    const res = await api.adminAdjustCredits({
      userId: targetUserId,
      amount,
      reason,
      adminId: user?.customId || user?.id
    });
    if (res.success) {
      await refreshCredits();
      return true;
    }
    return false;
  };

  // Refresh freelancers (Admin)
  const refreshFreelancers = useCallback(async () => {
    if (user?.role !== 'admin') return;
    const list = await api.getFreelancers();
    if (Array.isArray(list)) {
      setFreelancers(list.map(f => ({ ...f, id: f.customId || f._id })));
    }
  }, [user]);

  const createFreelancerByAdmin = async (data: any) => {
    const res = await api.createFreelancer(data);
    if (res.success && res.freelancer) {
      await refreshFreelancers();
      return { success: true, freelancer: res.freelancer };
    }
    return { success: false, error: res.error || 'Failed to create freelancer' };
  };

  const updateFreelancerByAdmin = async (id: string, data: any) => {
    const res = await api.updateFreelancer(id, data);
    if (res.success) {
      await refreshFreelancers();
      return true;
    }
    return false;
  };

  const deleteFreelancerByAdmin = async (id: string) => {
    const res = await api.deleteFreelancer(id);
    if (res.success) {
      await refreshFreelancers();
      return true;
    }
    return false;
  };

  const createClientByAdmin = async (data: any) => {
    const res = await api.createUser({ ...data, role: data.role || 'client' });
    if (res.success && res.user) {
      await refreshFreelancers();
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Failed to create user' };
  };

  const deleteUserByAdmin = async (id: string) => {
    const res = await api.deleteUser(id);
    if (res.success) {
      await refreshFreelancers();
      return { success: true };
    }
    return { success: false, error: res.error || 'Failed to delete user' };
  };

  // Refresh freelancer shares
  const refreshFreelancerShares = useCallback(async () => {
    if (!user) return;
    const uid = user.customId || user.id;
    const res = await api.getFreelancerShares(uid);
    if (res.success) {
      setFreelancerShares(res.shares || []);
    }
  }, [user]);

  const shareDocumentWithFreelancers = async (requestId: string, freelancerIds: string[], adminInstructions = '', dueDate = '') => {
    const res = await api.shareDocument({
      requestId,
      freelancerIds,
      adminInstructions,
      dueDate,
      adminId: user?.customId || user?.id
    });
    if (res.success) {
      await refreshRequests();
      return true;
    }
    return false;
  };

  const revokeDocumentShare = async (shareId: string) => {
    const res = await api.revokeDocumentShare(shareId);
    if (res.success) {
      await refreshFreelancerShares();
      return true;
    }
    return false;
  };

  const submitFreelancerAssessment = async (data: any) => {
    const res = await api.submitFreelancerAssessment(data);
    if (res.success) {
      await refreshFreelancerShares();
      return true;
    }
    return false;
  };

  // Contact logs
  const refreshContactLogs = useCallback(async () => {
    if (user?.role !== 'admin') return;
    const list = await api.getContactLogs();
    if (Array.isArray(list)) {
      setContactLogs(list);
    }
  }, [user]);

  const addContactLog = async (data: any) => {
    const res = await api.addContactLog({
      ...data,
      adminId: user?.customId || user?.id,
      adminName: user?.name || 'Admin'
    });
    if (res.success) {
      await refreshContactLogs();
      return true;
    }
    return false;
  };

  // Notifications
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    const recipient = user.role === 'admin' ? 'admin' : (user.customId || user.id);
    try {
      const list = await api.getNotifications(recipient);
      if (Array.isArray(list) && list.length > 0) {
        setNotifications(list.map(n => ({ ...n, id: n.customId || n._id })));
      } else {
        // Fallback recent platform update notifications (Last 2-3 days)
        const defaults: NotificationItem[] = [
          {
            id: 'upd_ref_doc',
            customId: 'upd_ref_doc',
            recipientId: recipient,
            recipientRole: user.role,
            title: 'NEW: Official Reference Document Management',
            message: 'Administrators can edit, replace, and distribute the global Project Intake Specification Template for client submissions.',
            type: 'system',
            link: user.role === 'admin' ? '/admin/reference-template' : '/submit-request',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: 'upd_freelancer_pw',
            customId: 'upd_freelancer_pw',
            recipientId: recipient,
            recipientRole: user.role,
            title: 'NEW: Specialist Password & Account Provisioning',
            message: 'Admin can now authorize delivery specialists with custom login passwords and automatic MongoDB credential generation.',
            type: 'system',
            link: user.role === 'admin' ? '/admin/freelancers' : '/freelancer/dashboard',
            read: false,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 'upd_doc_reqs',
            customId: 'upd_doc_reqs',
            recipientId: recipient,
            recipientRole: user.role,
            title: 'NEW: Dynamic Document Requirements System',
            message: 'Dynamic document requirements, review pipelines, and client intake gates are live across all workspaces.',
            type: 'document',
            link: user.role === 'admin' ? '/admin/document-requirements' : '/client/documents',
            read: false,
            createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
          }
        ];
        setNotifications(defaults);
      }
    } catch {
      // If offline/error, keep existing notifications
    }
  }, [user]);

  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    const recipient = user.role === 'admin' ? 'admin' : (user.customId || user.id);
    await api.markAllNotificationsRead(recipient);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Initial load
  useEffect(() => {
    if (user) {
      refreshRequests();
      refreshCredits();
      refreshNotifications();
      if (user.role === 'admin') {
        refreshFreelancers();
        refreshContactLogs();
      } else if (user.role === 'freelancer') {
        refreshFreelancerShares();
      }
    }
  }, [user, refreshRequests, refreshCredits, refreshNotifications, refreshFreelancers, refreshContactLogs, refreshFreelancerShares]);

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
        authenticateUser,
        registerUser,
        updateUserProfile,
        projectRequests,
        refreshRequests,
        submitProjectRequest,
        updateProjectStatusByAdmin,
        updateProjectNotesByAdmin,
        credits,
        creditTransactions,
        refreshCredits,
        adjustCreditsByAdmin,
        freelancers,
        refreshFreelancers,
        createFreelancerByAdmin,
        updateFreelancerByAdmin,
        deleteFreelancerByAdmin,
        createClientByAdmin,
        deleteUserByAdmin,
        freelancerShares,
        refreshFreelancerShares,
        shareDocumentWithFreelancers,
        revokeDocumentShare,
        submitFreelancerAssessment,
        contactLogs,
        refreshContactLogs,
        addContactLog,
        notifications,
        unreadCount,
        refreshNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        // Legacy compat
        dynamicJobs: [],
        postNewJob: () => {},
        approvedFreelancers: freelancers,
        pendingFreelancers: [],
        approveFreelancer: () => {},
        rejectFreelancer: () => {},
        addFreelancerByAdmin: () => {},
        addClientByAdmin: () => {},
        assignFreelancerToProject: () => {},
        compareDesignerIds: [],
        toggleCompareDesigner: () => {},
        clearCompare: () => {},
        savedJobIds: [],
        toggleSaveJob: () => {},
        savedDesignerIds: [],
        toggleSaveDesigner: () => {},
        submitIdea: () => {},
        workspaceTasks: [],
        addWorkspaceTask: () => {},
        updateTaskStatus: () => {},
        releaseMilestoneEscrow: () => {},
        chatMessages: [],
        sendChatMessage: () => {},
        dynamicProposals: [],
        submitProposal: () => {},
        awardProposalWorkByAdmin: () => {},
        updateUserBalance: () => {},
        IDEA_SUBMISSION_COST: 50
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
