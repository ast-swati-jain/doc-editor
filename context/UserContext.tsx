'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SEEDED_USERS } from '@/lib/types';

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserByEmail: (email: string, name?: string) => void;
  allUsers: User[];
}

const UserContext = createContext<UserContextType>({
  currentUser: SEEDED_USERS[0],
  setCurrentUser: () => {},
  switchUserByEmail: () => {},
  allUsers: SEEDED_USERS
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [allUsers, setAllUsers] = useState<User[]>(SEEDED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEEDED_USERS[0]);

  useEffect(() => {
    // Load custom users from localStorage
    const savedCustomUsers = localStorage.getItem('ajaia_custom_users');
    let mergedUsers = [...SEEDED_USERS];
    if (savedCustomUsers) {
      try {
        const parsed = JSON.parse(savedCustomUsers);
        if (Array.isArray(parsed)) {
          parsed.forEach((customU: User) => {
            if (!mergedUsers.some(u => u.email.toLowerCase() === customU.email.toLowerCase())) {
              mergedUsers.push(customU);
            }
          });
        }
      } catch (err) {
        console.error("Error loading custom users:", err);
      }
    }
    setAllUsers(mergedUsers);

    // Load active user
    const savedActive = localStorage.getItem('ajaia_current_user_email');
    if (savedActive) {
      const match = mergedUsers.find(u => u.email.toLowerCase() === savedActive.toLowerCase());
      if (match) {
        setCurrentUser(match);
      } else {
        const newUser: User = {
          id: `usr_${savedActive.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: savedActive.split('@')[0],
          email: savedActive.toLowerCase(),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${savedActive.split('@')[0]}`,
          title: "Invited Collaborator"
        };
        mergedUsers.push(newUser);
        setAllUsers(mergedUsers);
        setCurrentUser(newUser);
      }
    }
  }, []);

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ajaia_current_user_email', user.email.toLowerCase());
    }
  };

  const switchUserByEmail = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    let match = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!match) {
      match = {
        id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanEmail.split('@')[0]}`,
        title: "Invited Collaborator"
      };
      const updated = [...allUsers, match];
      setAllUsers(updated);
      if (typeof window !== 'undefined') {
        const customOnly = updated.filter(u => !SEEDED_USERS.some(su => su.id === u.id));
        localStorage.setItem('ajaia_custom_users', JSON.stringify(customOnly));
      }
    }

    handleSetUser(match);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, switchUserByEmail, allUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
