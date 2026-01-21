/**
 * 主应用入口
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { authApi } from './services/api';

// 页面组件
import LoginPage from './pages/Login';
import LobbyPage from './pages/Lobby';
import CommunityPage from './pages/Community';
import StorePage from './pages/Store';
import ProfilePage from './pages/Profile';
import ControlRoomPage from './pages/ControlRoom';
import BottomNav from './components/BottomNav';

console.log('==== APP.TSX LOADED ====');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// 受保护的路由
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f59e0b',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// 布局组件
const AppLayout: React.FC<{ children: React.ReactNode; showNav?: boolean }> = ({
  children,
  showNav = true
}) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1f2937', color: 'white' }}>
      <main style={{ paddingBottom: showNav ? '80px' : '0' }}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  const { setUser, logout, setLoading, token } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('==== CHECKING AUTH ====');
      if (!token) {
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        const result = await authApi.getMe();
        if (result.success && result.data) {
          setUser(result.data, token);
        } else {
          logout();
        }
      } catch (e) {
        console.error('Auth check failed:', e);
        logout();
      }
      setInitialized(true);
    };

    checkAuth();
  }, []);

  console.log('==== APP RENDERING ====');

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <LobbyPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CommunityPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/store"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <StorePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/control/:vehicleId"
            element={
              <ProtectedRoute>
                <AppLayout showNav={false}>
                  <ControlRoomPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
