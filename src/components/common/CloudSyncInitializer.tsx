'use client';

import { useEffect } from 'react';
import { DBStore } from '@/lib/store';

export const CloudSyncInitializer: React.FC = () => {
  useEffect(() => {
    DBStore.initCloudSync();
  }, []);

  return null;
};

export default CloudSyncInitializer;
