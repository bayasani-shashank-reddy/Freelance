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

  // Seed mock notifications on mount
  useEffect(() => {
    const mock: Notification[] = [
      {
        id: '1',
        title: 'Welcome to NexusCraft',
        message: 'Your account has been created successfully.',
        read: false,
        timestamp: new Date(),
      },
      {
        id: '2',
        title: 'New Designer Joined',
        message: 'Designer Alice has joined the platform.',
        read: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
    ];
    mock.forEach((n) => dispatch({ type: 'ADD_NOTIFICATION', payload: n }));
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
