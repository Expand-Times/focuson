import React, { createContext, useState, useEffect, useContext } from 'react';
import Launcher from '../../modules/launcher';
import { AppItem } from '../../modules/launcher/src/Launcher.types';

type AppContextType = {
  apps: AppItem[];
  loading: boolean;
  refreshApps: () => Promise<void>;
};

const AppContext = createContext<AppContextType>({
  apps: [],
  loading: true,
  refreshApps: async () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    try {
      const installedApps = Launcher.getInstalledApps();
      setApps(installedApps);
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const refreshApps = async () => {
    setLoading(true);
    await fetchApps();
  };

  return (
    <AppContext.Provider value={{ apps, loading, refreshApps }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
