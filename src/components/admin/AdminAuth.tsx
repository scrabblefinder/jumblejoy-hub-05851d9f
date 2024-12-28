import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

const AdminAuth = () => {
  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <Auth 
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          style: {
            button: { background: '#0284c7', color: 'white' },
            anchor: { color: '#0284c7' },
          },
        }}
        providers={[]}
        view="sign_in"
      />
    </div>
  );
};

export default AdminAuth;