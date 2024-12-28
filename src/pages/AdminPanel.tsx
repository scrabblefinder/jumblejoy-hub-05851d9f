import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import PuzzleForm from '@/components/admin/PuzzleForm';
import PuzzleList from '@/components/admin/PuzzleList';

const AdminPanel = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      return;
    }

    setUserId(session.user.id);

    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (adminError) {
      console.error('Error checking admin status:', adminError);
      toast({
        title: "Error",
        description: "Failed to verify admin status",
        variant: "destructive"
      });
    }

    setIsAdmin(!!adminData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            {userId && (
              <div className="mb-4 p-4 bg-gray-100 rounded">
                <p>Your User ID: {userId}</p>
                <p className="text-sm text-gray-600">Use this ID to grant yourself admin access</p>
              </div>
            )}
            <Auth 
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa }}
              providers={[]}
              view="sign_in"
            />
          </CardContent>
        </Card>
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