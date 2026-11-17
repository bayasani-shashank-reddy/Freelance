import { createContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

type State = {
  notifications: Notification[];
};

type Action =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_AS_READ' };

const initialState: State = {
  notifications: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return { notifications: [action.payload, ...state.notifications] };
    case 'MARK_AS_READ':
      return {
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_AS_READ':
      return { notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    default:
      return state;
  }
}

interface NotificationContextProps extends State {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextProps>(
  {} as NotificationContextProps
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Seed recent platform updates & system notifications
  useEffect(() => {
    const recentUpdates: Notification[] = [
      {
        id: 'update-ref-template',
        title: 'NEW: Official Reference Document System',
        message: 'Administrators can now edit, download, and configure the global Project Intake Specification Template required for client submissions.',
        read: false,
        timestamp: new Date(),
      },
      {
        id: 'update-freelancer-auth',
        title: 'NEW: Specialist Password & Account Creation',
        message: 'Admin Freelancer Directory now supports custom password provisioning with instant MongoDB account activation and login rights.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
      },
      {
        id: 'update-doc-requirements',
        title: 'NEW: Dynamic Document Requirements System',
        message: 'Configurable project requirements, intake file formats, and submission reviews are active across Admin and Client portals.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
      },
      {
        id: 'update-ai-studio',
        title: 'NEW: AI Intelligence Studio & Synthesis',
        message: 'Automated scoping, tech stack estimation, and architecture synthesis powered by Google Gemini are now accessible in Admin operations.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      },
      {
        id: 'welcome-nexuscraft',
        title: 'Welcome to NexusCraft Platform',
        message: 'Unified ecosystem connecting Clients, Administrators, and Delivery Specialists seamlessly.',
        read: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ];
    recentUpdates.forEach((n) => dispatch({ type: 'ADD_NOTIFICATION', payload: n }));
  }, []);

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotif });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: { id } });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
