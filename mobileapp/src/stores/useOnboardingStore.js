import { create } from 'zustand';
import { KEYS, getJson, setJson } from '../utils/storage';

const useOnboardingStore = create((set) => ({
  ready: false,
  complete: false,

  check: async () => {
    const complete = !!(await getJson(KEYS.onboarding, false));
    set({ complete, ready: true });
  },

  finish: async () => {
    await setJson(KEYS.onboarding, true);
    set({ complete: true });
  },
}));

export default useOnboardingStore;
