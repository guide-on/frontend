import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BusinessInfoUI, MemberBase, MemberType, PreferenceInfo } from '@/utils/signup';

export type SignupDraft = {
  memberType: MemberType | null;
  base: Omit<MemberBase, 'memberType'> | null;
  business?: BusinessInfoUI | null;
  preference?: PreferenceInfo | null;
};

type SignupState = SignupDraft & {
  setBase: (memberType: MemberType, base: Omit<MemberBase, 'memberType'>) => void;
  setBusiness: (biz: BusinessInfoUI | null) => void;
  setPreference: (pref: PreferenceInfo | null) => void;
  clear: () => void;
};

const initial: SignupDraft = {
  memberType: null,
  base: null,
  business: null,
  preference: null,
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      ...initial,
      setBase: (memberType, base) => set({ memberType, base: { ...base } }),
      setBusiness: (biz) => set({ business: biz ? { ...biz } : null }),
      setPreference: (pref) => set({ preference: pref ? { ...pref } : null }),
      clear: () => set({ ...initial }),
    }),
    { name: 'signup-draft' },
  ),
);

export default useSignupStore;
