'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const USER_ID_KEY = 'research_user_id';

export function useUser() {
  const [userID, setUserID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      let storedUserID = localStorage.getItem(USER_ID_KEY);

      if (!storedUserID) {
        const uuid = crypto.randomUUID();

        const { error } = await supabase
          .from('users')
          .insert({ id: uuid });

        if (!error) {
          localStorage.setItem(USER_ID_KEY, uuid);
          storedUserID = uuid;
        }
      }

      setUserID(storedUserID);
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  return { userID, isLoading };
}
