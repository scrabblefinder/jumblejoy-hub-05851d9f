import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import JumbleWord from './pages/JumbleWord';
import JumbleAnswer from './pages/JumbleAnswer';
import CaptionAnswer from './pages/CaptionAnswer';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminPanel from './pages/AdminPanel';
import DailyPost from './pages/DailyPost';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/jumble/:word" element={<JumbleAnswer />} />
          <Route path="/clue/:slug" element={<CaptionAnswer />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/daily-jumble/:date" element={<DailyPost />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
};

export default App;