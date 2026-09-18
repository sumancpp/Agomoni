import React from 'react';
import { PwaUpdateToast } from './PwaUpdateToast';
import { PwaInstallBanner } from './PwaInstallBanner';

export const PwaManager: React.FC = () => {
  return (
    <>
      {/* Toast alert when an update is available */}
      <PwaUpdateToast />

      {/* Subtle install banner on supported mobile & desktop devices */}
      <PwaInstallBanner />
    </>
  );
};

export { PwaInstallButton } from './PwaInstallButton';
export { PwaInstallBanner } from './PwaInstallBanner';
export { PwaInstallModal } from './PwaInstallModal';
export { PwaUpdateToast } from './PwaUpdateToast';
export { usePwaInstall } from './usePwaInstall';
