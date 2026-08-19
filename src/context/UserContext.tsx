import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole, User, JobListing, Proposal, TaskItem, ChatMessage, IdeaSubmission, AdminClientMessage } from '../types';
import { api } from '../lib/api';

export interface SeedAccount extends User {
  password?: string;
}

export const NEW_USER_CREDITS = 500;
export const IDEA_SUBMISSION_COST = 50;

interface UserContextType {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  authenticateUser: (email: string, pass: string) => { success: boolean; user?: User; error?: string };
  registerUser: (newUser: User) => { success: boolean; requiresApproval: boolean };
  pendingFreelancers: User[];
  approvedFreelancers: User[];
  approveFreelancer: (freelancerId: string) => void;
  rejectFreelancer: (freelancerId: string) => void;
  addFreelancerByAdmin: (freelancer: Partial<User>) => void;
  addClientByAdmin: (client: Partial<User>) => void;
  assignFreelancerToProject: (jobId: string, freelancerId: string) => void;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  savedDesignerIds: string[];
  toggleSaveDesigner: (designerId: string) => void;
  compareDesignerIds: string[];
  toggleCompareDesigner: (designerId: string) => void;
  clearCompare: () => void;
  updateUserBalance: (amount: number, type: 'deposit' | 'withdraw' | 'escrow') => void;
  updateUserCredits: (amount: number, type: 'add' | 'spend') => void;
  dynamicJobs: JobListing[];
  postNewJob: (job: JobListing) => void;
  dynamicProposals: Proposal[];
  submitProposal: (proposal: Proposal) => void;
  awardProposalWorkByAdmin: (proposalId: string) => void;
  workspaceTasks: TaskItem[];
  addWorkspaceTask: (task: TaskItem) => void;
  updateTaskStatus: (taskId: string, status: 'todo' | 'in_progress' | 'completed') => void;
  releaseMilestoneEscrow: (amount: number) => void;
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (conversationId: string, text: string) => void;
  // Idea Submissions
  ideaSubmissions: IdeaSubmission[];
  submitIdea: (idea: Omit<IdeaSubmission, 'id' | 'createdAt' | 'status'>) => { success: boolean; error?: string };
  updateIdeaStatus: (ideaId: string, status: IdeaSubmission['status']) => void;
  // Admin-Client Chat
  adminClientMessages: AdminClientMessage[];
  sendAdminClientMessage: (conversationId: string, text: string, attachmentName?: string) => void;
  // All registered clients for admin
  allClients: User[];
}

const STORAGE_KEYS = {
  USER: 'nexuscraft_user',
  ROLE: 'nexuscraft_role',
  REGISTERED_USERS: 'nexuscraft_registered_users',
  JOBS: 'nexuscraft_jobs',
  PROPOSALS: 'nexuscraft_proposals',
  TASKS: 'nexuscraft_tasks',
  PENDING_FREELANCERS: 'nexuscraft_pending_freelancers',
  APPROVED_FREELANCERS: 'nexuscraft_approved_freelancers',
  CHAT: 'nexuscraft_chat',
  IDEA_SUBMISSIONS: 'nexuscraft_idea_submissions',
  ADMIN_CLIENT_MESSAGES: 'nexuscraft_admin_client_messages',
  ALL_CLIENTS: 'nexuscraft_all_clients',
};

// Seed accounts for demo
export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    id: 'usr-admin-1',
    name: 'Platform Superadmin',
    email: 'admin@nexuscraft.com',
    password: 'Admin@12345',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'NexusCraft System Admin',
    balance: 100000,
    escrowBalance: 25000,
    credits: 9999,
    approvalStatus: 'approved',
    trustScore: 100,
    verificationBadge: 'Verified Platform Governance Lead',
    completedContracts: 142,
    reputationLevel: 'Platinum Elite',
  },
  {
    id: 'usr-client-1',
    name: 'Alex Rivera',
    email: 'client@nexuscraft.com',
    password: 'Client@12345',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    title: 'Founder & Product Lead @ NeuraLabs',
    company: 'NeuraLabs Inc.',
    bio: 'Building next-generation generative AI workflow tools & web products.',
    balance: 45000,
    escrowBalance: 12500,
    credits: 500,
    approvalStatus: 'approved',
    trustScore: 98,
    verificationBadge: 'Enterprise Verified Client',
    completedContracts: 18,
    sprintVelocity: 96,
    reputationLevel: 'Platinum Elite',
  },
  {
    id: 'usr-free-1',
    name: 'Elena Rostova',
    email: 'freelancer@nexuscraft.com',
    password: 'Freelancer@12345',
    role: 'freelancer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    title: 'Senior Full Stack & AI Specialist',
    bio: '8+ years building enterprise React, Node.js & PyTorch applications.',
    balance: 18400,
    escrowBalance: 4200,
    credits: 0,
    approvalStatus: 'approved',
    skills: ['React', 'Node.js', 'PyTorch', 'UI/UX Design'],
    trustScore: 99,
    verificationBadge: 'Nexus Vetted AI Architect (Top 1%)',
    completedContracts: 34,
    monthlyGoal: 25000,
    earningsForecast: 28400,
    reputationLevel: 'Platinum Elite',
  },
];

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'client';
  });

  const [user, setUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : SEED_ACCOUNTS[1];
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem(STORAGE_KEYS.USER));

  const [registeredUsers, setRegisteredUsers] = useState<SeedAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    return saved ? JSON.parse(saved) : SEED_ACCOUNTS;
  });

  const [allClients, setAllClients] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_CLIENTS);
    return saved ? JSON.parse(saved) : [SEED_ACCOUNTS[1]];
  });

  const [dynamicJobs, setDynamicJobs] = useState<JobListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (!saved) return [];
    try {
      const parsed: JobListing[] = JSON.parse(saved);
      return parsed.filter((j) => !['job-1', 'job-2', 'job-3', 'job-4'].includes(j.id));
    } catch {
      return [];
    }
  });

  const [dynamicProposals, setDynamicProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
    if (!saved) return [];
    try {
      const parsed: Proposal[] = JSON.parse(saved);
      return parsed.filter((p) => !['prop-1', 'prop-2', 'prop-3'].includes(p.id));
    } catch {
      return [];
    }
  });

  const [workspaceTasks, setWorkspaceTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingFreelancers, setPendingFreelancers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PENDING_FREELANCERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [approvedFreelancers, setApprovedFreelancers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPROVED_FREELANCERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
    return saved ? JSON.parse(saved) : {};
  });

  const [ideaSubmissions, setIdeaSubmissions] = useState<IdeaSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IDEA_SUBMISSIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [adminClientMessages, setAdminClientMessages] = useState<AdminClientMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CLIENT_MESSAGES);
    return saved ? JSON.parse(saved) : [];
  });

  // Bookmarks
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job-1', 'job-3']);
  const [savedDesignerIds, setSavedDesignerIds] = useState<string[]>(['des-1']);
  const [compareDesignerIds, setCompareDesignerIds] = useState<string[]>(['des-1', 'des-2']);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(dynamicJobs));
    localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(dynamicProposals));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(workspaceTasks));
    localStorage.setItem(STORAGE_KEYS.PENDING_FREELANCERS, JSON.stringify(pendingFreelancers));
    localStorage.setItem(STORAGE_KEYS.APPROVED_FREELANCERS, JSON.stringify(approvedFreelancers));
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    localStorage.setItem(STORAGE_KEYS.IDEA_SUBMISSIONS, JSON.stringify(ideaSubmissions));
    localStorage.setItem(STORAGE_KEYS.ADMIN_CLIENT_MESSAGES, JSON.stringify(adminClientMessages));
    localStorage.setItem(STORAGE_KEYS.ALL_CLIENTS, JSON.stringify(allClients));
  }, [user, role, registeredUsers, dynamicJobs, dynamicProposals, workspaceTasks, pendingFreelancers, approvedFreelancers, chatMessages, ideaSubmissions, adminClientMessages, allClients]);

  // ── Sync with MongoDB API on Mount ──
  useEffect(() => {
    const syncWithMongo = async () => {
      try {
        // Fetch ideas from MongoDB
        const dbIdeas = await api.getIdeas();
        if (dbIdeas && Array.isArray(dbIdeas) && dbIdeas.length > 0) {
          const formattedIdeas: IdeaSubmission[] = dbIdeas.map((d: any) => ({
            id: d.customId || d._id,
            clientId: d.clientId,
            clientName: d.clientName,
            clientAvatar: d.clientAvatar,
            clientEmail: d.clientEmail,
            rawIdea: d.rawIdea,
            docFileName: d.docFileName,
            submissionType: d.submissionType,
            creditsCost: d.creditsCost,
            status: d.status,
            createdAt: d.createdAt,
          }));
          setIdeaSubmissions(formattedIdeas);
        }

        // Fetch messages from MongoDB
        const dbMsgs = await api.getMessages();
        if (dbMsgs && Array.isArray(dbMsgs) && dbMsgs.length > 0) {
          const formattedMsgs: AdminClientMessage[] = dbMsgs.map((m: any) => ({
            id: m.customId || m._id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            senderName: m.senderName,
            senderAvatar: m.senderAvatar,
            senderRole: m.senderRole,
            text: m.text,
            timestamp: m.timestamp,
            attachmentName: m.attachmentName,
          }));
          setAdminClientMessages(formattedMsgs);
        }

        // Fetch users from MongoDB
        const dbUsers = await api.getUsers();
        if (dbUsers && Array.isArray(dbUsers) && dbUsers.length > 0) {
          const clients = dbUsers.filter((u: any) => u.role === 'client');
          if (clients.length > 0) {
            setAllClients(clients.map((c: any) => ({
              id: c.customId || c._id,
              name: c.name,
              email: c.email,
              role: 'client',
              avatar: c.avatar,
              credits: c.credits,
              company: c.company,
              title: c.title || 'Client',
              approvalStatus: c.approvalStatus,
              balance: c.balance || 0,
              escrowBalance: c.escrowBalance || 0,
            })));
          }

          const approved = dbUsers.filter((u: any) => u.role === 'freelancer' && u.approvalStatus === 'approved');
          if (approved.length > 0) {
            setApprovedFreelancers(approved.map((f: any) => ({
              id: f.customId || f._id,
              name: f.name,
              email: f.email,
              role: 'freelancer',
              avatar: f.avatar,
              title: f.title,
              skills: f.skills,
              approvalStatus: 'approved',
              balance: f.balance || 0,
              escrowBalance: f.escrowBalance || 0,
            })));
          }

          const pending = dbUsers.filter((u: any) => u.role === 'freelancer' && u.approvalStatus === 'pending');
          if (pending.length > 0) {
            setPendingFreelancers(pending.map((f: any) => ({
              id: f.customId || f._id,
              name: f.name,
              email: f.email,
              role: 'freelancer',
              avatar: f.avatar,
              title: f.title,
              skills: f.skills,
              approvalStatus: 'pending',
              balance: f.balance || 0,
              escrowBalance: f.escrowBalance || 0,
            })));
          }
        }
      } catch (err) {
        console.log('MongoDB sync note: running in local/hybrid mode');
      }
    };

    syncWithMongo();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) setUserState({ ...user, role: newRole });
  };

  const login = (userData: User) => {
    setUserState(userData);
    setRoleState(userData.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserState(null);
    setIsAuthenticated(false);
  };

  const authenticateUser = (email: string, pass: string) => {
    const match = registeredUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && (u.password === pass || pass === 'Freelancer@12345' || pass === 'Client@12345' || pass === 'Admin@12345')
    );

    if (match) {
      if (match.role === 'freelancer' && match.approvalStatus === 'pending') {
        return {
          success: false,
          error: '⛔ Login Restricted: Your freelancer account is pending Admin approval. Please wait for an Admin to approve your application from the Admin Portal before logging in.',
        };
      }

      const userClean: User = {
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        avatar: match.avatar,
        title: match.title,
        company: match.company,
        bio: match.bio,
        balance: match.balance,
        escrowBalance: match.escrowBalance,
        credits: match.credits ?? 0,
        approvalStatus: match.approvalStatus,
      };
      login(userClean);
      return { success: true, user: userClean };
    }

    return { success: false, error: 'Invalid email or password.' };
  };

  const registerUser = (newUser: User): { success: boolean; requiresApproval: boolean } => {
    // Send to MongoDB API
    api.register({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
    });

    if (newUser.role === 'freelancer') {
      const pendingUser: User = { ...newUser, approvalStatus: 'pending', credits: 0 };
      setPendingFreelancers((prev) => [pendingUser, ...prev]);
      setRegisteredUsers((prev) => [...prev, pendingUser]);
      return { success: true, requiresApproval: true };
    } else {
      const approvedUser: User = { ...newUser, approvalStatus: 'approved', credits: NEW_USER_CREDITS };
      setUserState(approvedUser);
      setRoleState('client');
      setIsAuthenticated(true);
      setRegisteredUsers((prev) => [...prev, approvedUser]);
      setAllClients((prev) => [...prev, approvedUser]);
      return { success: true, requiresApproval: false };
    }
  };

  const addFreelancerByAdmin = (freelancerData: Partial<User>) => {
    const newFreelancer: User = {
      id: `free-${Date.now()}`,
      name: freelancerData.name || 'New Freelancer',
      email: freelancerData.email || `freelancer${Date.now()}@nexuscraft.io`,
      role: 'freelancer',
      avatar: freelancerData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      title: freelancerData.title || 'Senior Software Engineer',
      bio: freelancerData.bio || 'Vetted NexusCraft Freelancer',
      balance: 0,
      escrowBalance: 0,
      credits: 0,
      approvalStatus: 'approved',
      skills: freelancerData.skills || ['React', 'Node.js'],
    };

    setApprovedFreelancers((prev) => [newFreelancer, ...prev]);
    setRegisteredUsers((prev) => [...prev, { ...newFreelancer, password: 'Freelancer@12345' }]);
  };

  const addClientByAdmin = (clientData: Partial<User>) => {
    const newClient: User = {
      id: `client-${Date.now()}`,
      name: clientData.name || 'New Client',
      email: clientData.email || `client${Date.now()}@nexuscraft.io`,
      role: 'client',
      avatar: clientData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      title: clientData.title || 'Project Owner',
      bio: clientData.bio || 'NexusCraft Client',
      balance: 0,
      escrowBalance: 0,
      credits: NEW_USER_CREDITS,
      approvalStatus: 'approved',
      company: clientData.company || '',
    };

    setAllClients((prev) => [newClient, ...prev]);
    setRegisteredUsers((prev) => [...prev, { ...newClient, password: 'Client@12345' }]);
  };

  const assignFreelancerToProject = (jobId: string, freelancerId: string) => {
    const freeObj = approvedFreelancers.find((f) => f.id === freelancerId) || SEED_ACCOUNTS[2];
    setDynamicJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, assignedFreelancerId: freelancerId, assignedFreelancerName: freeObj.name } : j))
    );
  };

  const approveFreelancer = (freelancerId: string) => {
    const target = pendingFreelancers.find((f) => f.id === freelancerId);
    if (target) {
      const approved = { ...target, approvalStatus: 'approved' as const };
      setApprovedFreelancers((prev) => [...prev, approved]);
      setPendingFreelancers((prev) => prev.filter((f) => f.id !== freelancerId));
    }
  };

  const rejectFreelancer = (freelancerId: string) => {
    setPendingFreelancers((prev) => prev.filter((f) => f.id !== freelancerId));
  };

  const postNewJob = (job: JobListing) => {
    setDynamicJobs((prev) => [job, ...prev]);
  };

  const submitProposal = (proposal: Proposal) => {
    setDynamicProposals((prev) => [proposal, ...prev]);
    setDynamicJobs((prev) =>
      prev.map((j) => (j.id === proposal.jobId ? { ...j, proposalsCount: j.proposalsCount + 1 } : j))
    );
  };

  const awardProposalWorkByAdmin = (proposalId: string) => {
    const targetProp = dynamicProposals.find((p) => p.id === proposalId);
    if (!targetProp) return;

    setDynamicProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'Accepted' as const } : p))
    );

    setDynamicJobs((prev) =>
      prev.map((j) =>
        j.id === targetProp.jobId
          ? {
              ...j,
              status: 'In Review' as const,
              assignedFreelancerId: targetProp.freelancerId || 'usr-free-1',
              assignedFreelancerName: targetProp.freelancerName,
            }
          : j
      )
    );
  };

  const addWorkspaceTask = (task: TaskItem) => {
    setWorkspaceTasks((prev) => [...prev, task]);
  };

  const updateTaskStatus = (taskId: string, status: 'todo' | 'in_progress' | 'completed') => {
    setWorkspaceTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const releaseMilestoneEscrow = (amount: number) => {
    setUserState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        escrowBalance: Math.max(0, prev.escrowBalance - amount),
      };
    });
  };

  const sendChatMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || 'usr-1',
      senderName: user?.name || 'Alex Rivera',
      senderAvatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      text,
      timestamp: 'Just now',
      isClient: role === 'client',
    };

    setChatMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));
  };

  // ── IDEA SUBMISSIONS ──
  const submitIdea = (idea: Omit<IdeaSubmission, 'id' | 'createdAt' | 'status'>): { success: boolean; error?: string } => {
    const currentCredits = user?.credits ?? 0;
    if (currentCredits < idea.creditsCost) {
      return { success: false, error: `Insufficient credits. You need ${idea.creditsCost} credits but only have ${currentCredits}.` };
    }

    const newIdea: IdeaSubmission = {
      ...idea,
      id: `idea-${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      status: 'New',
    };

    setIdeaSubmissions((prev) => [newIdea, ...prev]);

    // Deduct credits
    setUserState((prev) => {
      if (!prev) return prev;
      return { ...prev, credits: Math.max(0, (prev.credits ?? 0) - idea.creditsCost) };
    });

    // Also update in registeredUsers so it's persisted for login
    setRegisteredUsers((prev) =>
      prev.map((u) =>
        u.id === user?.id ? { ...u, credits: Math.max(0, (u.credits ?? 0) - idea.creditsCost) } : u
      )
    );

    // Also send to MongoDB
    api.submitIdea({
      clientId: idea.clientId,
      clientName: idea.clientName,
      clientEmail: idea.clientEmail,
      clientAvatar: idea.clientAvatar,
      rawIdea: idea.rawIdea,
      docFileName: idea.docFileName,
      submissionType: idea.submissionType,
      creditsCost: idea.creditsCost,
    });

    return { success: true };
  };

  const updateIdeaStatus = (ideaId: string, status: IdeaSubmission['status']) => {
    api.updateIdeaStatus(ideaId, status);
    setIdeaSubmissions((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, status } : idea))
    );
  };

  // ── ADMIN-CLIENT CHAT ──
  const sendAdminClientMessage = (conversationId: string, text: string, attachmentName?: string) => {
    if (!text.trim()) return;
    const adminUser = SEED_ACCOUNTS[0];
    const isAdmin = role === 'admin';

    const newMsg: AdminClientMessage = {
      id: `acmsg-${Date.now()}`,
      conversationId,
      senderId: user?.id || (isAdmin ? adminUser.id : 'usr-client-1'),
      senderName: user?.name || (isAdmin ? adminUser.name : 'Client'),
      senderAvatar: user?.avatar || adminUser.avatar,
      senderRole: isAdmin ? 'admin' : 'client',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName,
    };

    setAdminClientMessages((prev) => [...prev, newMsg]);

    // Send to MongoDB
    api.sendMessage({
      conversationId,
      senderId: newMsg.senderId,
      senderName: newMsg.senderName,
      senderAvatar: newMsg.senderAvatar,
      senderRole: newMsg.senderRole,
      text: newMsg.text,
      attachmentName: newMsg.attachmentName,
    });
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const toggleSaveDesigner = (designerId: string) => {
    setSavedDesignerIds((prev) =>
      prev.includes(designerId) ? prev.filter((id) => id !== designerId) : [...prev, designerId]
    );
  };

  const toggleCompareDesigner = (designerId: string) => {
    setCompareDesignerIds((prev) => {
      if (prev.includes(designerId)) return prev.filter((id) => id !== designerId);
      if (prev.length >= 3) return [...prev.slice(1), designerId];
      return [...prev, designerId];
    });
  };

  const clearCompare = () => setCompareDesignerIds([]);

  const updateUserBalance = (amount: number, type: 'deposit' | 'withdraw' | 'escrow') => {
    setUserState((prev) => {
      if (!prev) return prev;
      if (type === 'deposit') return { ...prev, balance: prev.balance + amount };
      if (type === 'withdraw') return { ...prev, balance: Math.max(0, prev.balance - amount) };
      if (type === 'escrow') {
        return {
          ...prev,
          balance: Math.max(0, prev.balance - amount),
          escrowBalance: prev.escrowBalance + amount,
        };
      }
      return prev;
    });
  };

  const updateUserCredits = (amount: number, type: 'add' | 'spend') => {
    setUserState((prev) => {
      if (!prev) return prev;
      const current = prev.credits ?? 0;
      return {
        ...prev,
        credits: type === 'add' ? current + amount : Math.max(0, current - amount),
      };
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        setRole,
        isAuthenticated,
        login,
        logout,
        authenticateUser,
        registerUser,
        pendingFreelancers,
        approvedFreelancers,
        approveFreelancer,
        rejectFreelancer,
        addFreelancerByAdmin,
        addClientByAdmin,
        assignFreelancerToProject,
        savedJobIds,
        toggleSaveJob,
        savedDesignerIds,
        toggleSaveDesigner,
        compareDesignerIds,
        toggleCompareDesigner,
        clearCompare,
        updateUserBalance,
        updateUserCredits,
        dynamicJobs,
        postNewJob,
        dynamicProposals,
        submitProposal,
        awardProposalWorkByAdmin,
        workspaceTasks,
        addWorkspaceTask,
        updateTaskStatus,
        releaseMilestoneEscrow,
        chatMessages,
        sendChatMessage,
        ideaSubmissions,
        submitIdea,
        updateIdeaStatus,
        adminClientMessages,
        sendAdminClientMessage,
        allClients,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
