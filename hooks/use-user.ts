"use client";

import { useEffect, useState } from "react";

const USER_ID_KEY = "research_user_id";

export function useUser() {

  const [userID, setUserID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const initializeUser = async () => {

      try {

        let storedUserID = localStorage.getItem(USER_ID_KEY);

        if (!storedUserID) {

          const uuid = crypto.randomUUID();

          const res = await fetch("/api/create-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: uuid })
          });

          const result = await res.json();

          if (result.success) {
            localStorage.setItem(USER_ID_KEY, uuid);
            storedUserID = uuid;
          }

        }

        setUserID(storedUserID);

      } catch (err) {

        console.error("User initialization failed:", err);

      } finally {

        setIsLoading(false);

      }

    };

    initializeUser();

  }, []);

  return {
    userID,
    isLoading
  };

}
