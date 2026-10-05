import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

// Define the 6 System Roles
export const ROLES = {
  MAIN_OFFICER: 'MAIN_OFFICER',
  TMS_OFFICER: 'TMS_OFFICER',
  SMMS_OFFICER: 'SMMS_OFFICER',
  TRD_OFFICER: 'TRD_OFFICER',
  WORKER: 'WORKER',
  BACKEND_MONITOR: 'BACKEND_MONITOR'
};

// Route Authorization Matrix
export const ROLE_PERMISSIONS = {
  MAIN_OFFICER: [
    '/', '/requests', '/maintenance', '/engineering', '/operations',
    '/ml-predictions', '/ai-planner', '/schedule', '/digital-twin',
    '/approval', '/execution', '/analytics', '/learning',
    '/system-monitor', '/assets', '/ai-assistant', '/department/TMS',
    '/department/SMMS', '/department/TRD', '/network', '/stations',
    '/zones', '/alerts', '/reports', '/settings'
  ],
  TMS_OFFICER: [
    '/requests', '/maintenance', '/engineering', '/operations',
    '/department/TMS'
  ],
  SMMS_OFFICER: [
    '/requests', '/maintenance', '/engineering', '/operations',
    '/department/SMMS'
  ],
  TRD_OFFICER: [
    '/requests', '/maintenance', '/engineering', '/operations',
    '/department/TRD'
  ],
  WORKER: [
    '/requests', '/maintenance', '/engineering', '/operations',
    '/ml-predictions', '/ai-planner', '/schedule', '/digital-twin',
    '/approval', '/execution', '/analytics', '/learning'
  ],
  BACKEND_MONITOR: [
    '/system-monitor', '/ai-assistant', '/reports', '/settings'
  ]
};

// Official Role Credentials Registry
const OFFICIAL_ACCOUNTS = [
  {
    userId: 'Thishanth@123-MAIN OFFICER',
    pass: 'Thishanth@70-MAIN OFFICER',
    role: ROLES.MAIN_OFFICER,
    name: 'Thishanth T',
    title: 'Main Officer (System Admin)',
    department: 'HQ / Executive'
  },
  {
    userId: 'TRACK@123-TMS',
    pass: 'TRACK@70-TMS',
    role: ROLES.TMS_OFFICER,
    name: 'TMS Officer',
    title: 'Senior Track Maintenance Engineer',
    department: 'TMS'
  },
  {
    userId: 'SIGNAL@123-SMMS',
    pass: 'SIGNAL@70-SMMS',
    role: ROLES.SMMS_OFFICER,
    name: 'SMMS Officer',
    title: 'Senior Signal & Telecom Inspector',
    department: 'SMMS'
  },
  {
    userId: 'TRACTION@123-TRD',
    pass: 'TRACTION@70-TRD',
    role: ROLES.TRD_OFFICER,
    name: 'TRD Officer',
    title: 'Senior Traction Distribution Officer',
    department: 'TRD'
  },
  {
    userId: 'Worker@123',
    pass: 'Worker@70',
    role: ROLES.WORKER,
    name: 'Railway Operational Worker',
    title: 'Block Planning & Workflow Worker',
    department: 'Operations'
  },
  {
    userId: 'BACKEND@123-BACKEND MONITOR',
    pass: 'BACKEND@70-BACKEND MONITOR',
    role: ROLES.BACKEND_MONITOR,
    name: 'System Monitor Operator',
    title: 'Backend Control Center Operator',
    department: 'Backend System'
  }
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial load / refresh
  useEffect(() => {
    try {
      const savedSession = sessionStorage.getItem('trackiq_auth_session') || localStorage.getItem('trackiq_auth_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed && parsed.userId && parsed.role) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (rawUserId, rawPassword, rememberMe = true) => {
    const inputId = (rawUserId || '').trim();
    const inputPass = (rawPassword || '').trim();

    if (!inputId || !inputPass) {
      throw new Error("Please enter both User ID and Password.");
    }

    // 1. Try Backend Server API Authentication
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: inputId, password: inputPass })
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.user && body.user.role) {
          const authUser = {
            userId: body.user.user_id,
            role: body.user.role,
            name: body.user.name || inputId,
            department: body.user.role.replace('_OFFICER', ''),
            loginTime: new Date().toISOString()
          };
          setUser(authUser);
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('trackiq_auth_session', JSON.stringify(authUser));
          return authUser;
        }
      }
    } catch (apiErr) {
      console.warn("Backend auth server ping unavailable, using exact local registry match.");
    }

    // 2. Strict Exact Local Registry Match (Offline fallback)
    const match = OFFICIAL_ACCOUNTS.find(acc => 
      acc.userId === inputId && acc.pass === inputPass
    );

    if (match) {
      const authUser = {
        userId: match.userId,
        role: match.role,
        name: match.name,
        title: match.title,
        department: match.department,
        loginTime: new Date().toISOString()
      };
      setUser(authUser);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('trackiq_auth_session', JSON.stringify(authUser));
      return authUser;
    }

    // 3. Reject invalid credentials cleanly
    throw new Error("Invalid User ID or Password.");
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('trackiq_auth_session');
    localStorage.removeItem('trackiq_auth_session');
  };

  // Check if a role is permitted to access a path
  const isAuthorized = (path) => {
    if (!user) return false;
    const userRole = user.role;
    if (userRole === ROLES.MAIN_OFFICER) return true;

    const allowedPaths = ROLE_PERMISSIONS[userRole] || [];
    
    // Normalize path comparison (e.g. /department/tms -> /department/TMS)
    const normPath = path.toLowerCase();
    
    return allowedPaths.some(p => {
      const normP = p.toLowerCase();
      if (normP === normPath) return true;
      if (normPath.startsWith(normP) && normP !== '/') return true;
      return false;
    });
  };

  // Get default home route for current role
  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === ROLES.BACKEND_MONITOR) return '/system-monitor';
    if (user.role === ROLES.TMS_OFFICER) return '/department/TMS';
    if (user.role === ROLES.SMMS_OFFICER) return '/department/SMMS';
    if (user.role === ROLES.TRD_OFFICER) return '/department/TRD';
    if (user.role === ROLES.WORKER) return '/requests';
    return '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      isAuthorized,
      getDefaultRoute,
      OFFICIAL_ACCOUNTS
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
