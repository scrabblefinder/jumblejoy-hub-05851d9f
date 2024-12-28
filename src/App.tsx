import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminPanel from './pages/AdminPanel';
import JumbleAnswer from './pages/JumbleAnswer';
import HomePage from './pages/HomePage';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const App = () => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    setIsAdmin(!!adminData);
    setLoading(false);
  };

  // Protected Route component
  const ProtectedAdminRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (!session) {
      return (
        <div className="container mx-auto p-4 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          <Auth 
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
          />
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="container mx-auto p-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>You need admin privileges to access this page.</p>
            <p className="text-sm mt-2">Your User ID: {session.user.id}</p>
            <p className="text-sm">Share this ID with the system administrator to get access.</p>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          } 
        />
        <Route path="/jumble/:word" element={<JumbleAnswer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
};

export default App;