import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import HeaderBar from '../components/HeaderBar';

interface AuthenticatedLayoutProps {
  supabase: SupabaseClient;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ supabase }) => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [supabase, navigate]);

  if (!session) return null;

  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const response = await fetch("http://localhost:3000/api/liveblocks-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ room }),
        });
        if (!response.ok) throw new Error('Failed to authenticate with Liveblocks');
        return response.json();
      }}

      resolveUsers={async ({ userIds }) => {
        // ["marc@example.com", ...]
        console.log(userIds);

        // Return a list of users
        return [
          {
            name: "Marc",
            avatar: "https://example.com/marc.png",

            // Your custom metadata
            // ...
          },
          // ...
        ];
      }}
    >
      <RoomProvider id={import.meta.env.VITE_LIVEBLOCKS_ROOM as string}>
        <div className="flex flex-col">
          <HeaderBar />
          <div className="flex-grow overflow-hidden bg-ghost-white">
            <Outlet />
          </div>
        </div>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default AuthenticatedLayout;
