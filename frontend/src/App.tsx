import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store';
import { ToastProvider } from './components/Toast';
import { useEffect } from 'react';
import { userAPI } from './services/api';

import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import PrioritiesPage from './pages/PrioritiesPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SocialPage from './pages/SocialPage';
import AnalyticsPage from './pages/AnalyticsPage';
import GroupsPage from './pages/GroupsPage';
import FriendsPage from './pages/FriendsPage';
import SchedulePage from './pages/SchedulePage';
import ChallengesPage from './pages/ChallengesPage';
import StorePage from './pages/StorePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import MyCompanionsPage from './pages/MyCompanionsPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { token, setUser } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const user = await userAPI.getProfile();
          setUser(user);
        } catch (error) {
          console.error('Failed to load user:', error);
          // Token might be invalid, clear it
          useAuthStore.getState().logout();
        }
      }
    };

    loadUser();
  }, [token, setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/priorities" element={<PrioritiesPage />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/social"
            element={
              <ProtectedRoute>
                <SocialPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/challenges"
            element={
              <ProtectedRoute>
                <ChallengesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/store"
            element={
              <ProtectedRoute>
                <StorePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/blog"
            element={
              <ProtectedRoute>
                <BlogPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/blog/:slug"
            element={
              <ProtectedRoute>
                <BlogPostPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/companions"
            element={
              <ProtectedRoute>
                <MyCompanionsPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
