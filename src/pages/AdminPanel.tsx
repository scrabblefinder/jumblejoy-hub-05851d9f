import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminAuth from '@/components/admin/AdminAuth';
import PuzzleForm from '@/components/admin/PuzzleForm';
import PuzzleList from '@/components/admin/PuzzleList';

const AdminPanel = () => {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.id);
    });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return <AdminAuth />;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage daily jumble puzzles</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <PuzzleForm />
        </div>
        <div>
          <PuzzleList />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;