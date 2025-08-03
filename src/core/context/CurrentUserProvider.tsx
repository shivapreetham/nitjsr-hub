'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { User } from '@prisma/client';

interface CurrentUserContextValue {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const CurrentUserProvider = ({
  children,
  currentUser,
}: {
  children: ReactNode;
  currentUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(currentUser);
  return (
    <CurrentUserContext.Provider value={{ currentUser: user, setCurrentUser: setUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUserContext = () => useContext(CurrentUserContext);
