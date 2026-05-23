import { useState, useEffect } from 'react';
import flagsConfig from './flags.json';

export type FeatureFlag = keyof typeof flagsConfig;

/**
 * Sync checking for a feature flag. Useful for immediate rendering checks.
 */
export function isEnabled(flag: FeatureFlag): boolean {
  return !!flagsConfig[flag];
}

/**
 * Reactive React state loader for feature flags if flags are loaded from a remote database/API.
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [enabled, setEnabled] = useState<boolean>(isEnabled(flag));

  useEffect(() => {
    // Dynamically synchronized state from local json config
    setEnabled(isEnabled(flag));
  }, [flag]);

  return enabled;
}

/**
 * Access all current settings as a single object for debug/admin dashboard panels.
 */
export function getAllFlags() {
  return { ...flagsConfig };
}
