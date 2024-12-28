import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

interface JumbleData {
  Date: string;
  Clues: {
    c1: string;
    c2: string;
    c3: string;
    c4: string;
    a1: string;
    a2: string;
    a3: string;
    a4: string;
    o1: string;
    o2: string;
    o3: string;
    o4: string;
  };
  Caption: {
    v1: string;
  };
  Solution: {
    s1: string;
    k1: string;
  };
  Image: string;
}

const AdminPanel = () => {
  const [jsonInput, setJsonInput] = useState('');
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

    setUserId(session.user.id); // Store the user ID

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

  const parseJsonCallback = (input: string): JumbleData | null => {
    try {
      const jsonStr = input.replace(/^\/\*\*\/jsonCallback\((.*)\)$/, '$1');
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    const data = parseJsonCallback(jsonInput);
    if (!data) {
      toast({
        title: "Error",
        description: "Invalid JSON format",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: puzzleData, error: puzzleError } = await supabase
        .from('daily_puzzles')
        .insert({
          date: data.Date,
          caption: data.Caption.v1,
          image_url: data.Image,
          solution: data.Solution.s1
        })
        .select()
        .single();

      if (puzzleError) throw puzzleError;

      const jumbleWords = [
        { jumbled_word: data.Clues.c1, answer: data.Clues.a1, puzzle_id: puzzleData.id },
        { jumbled_word: data.Clues.c2, answer: data.Clues.a2, puzzle_id: puzzleData.id },
        { jumbled_word: data.Clues.c3, answer: data.Clues.a3, puzzle_id: puzzleData.id },
        { jumbled_word: data.Clues.c4, answer: data.Clues.a4, puzzle_id: puzzleData.id }
      ];

      const { error: wordsError } = await supabase
        .from('jumble_words')
        .insert(jumbleWords);

      if (wordsError) throw wordsError;

      toast({
        title: "Success",
        description: "Puzzle added successfully",
      });
      
      setJsonInput('');
    } catch (error) {
      console.error('Error submitting puzzle:', error);
      toast({
        title: "Error",
        description: "Failed to submit puzzle",
        variant: "destructive"
      });
    }
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
              providers={['google']}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - Add Daily Jumble</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste the JSON callback data here..."
              className="min-h-[200px] font-mono"
            />
            <Button onClick={handleSubmit}>Submit Puzzle</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;