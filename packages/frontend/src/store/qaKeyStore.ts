import { create } from 'zustand';

interface QaKeyStore {
  qaKey: string;
  setKey: (key: string) => void;
  clearKey: () => void;
}

function getStoredKey(): string {
  try {
    return sessionStorage.getItem('qa_key') ?? '';
  } catch {
    return '';
  }
}

export const useQaKeyStore = create<QaKeyStore>((set) => ({
  qaKey: getStoredKey(),
  setKey: (key: string) => {
    try { sessionStorage.setItem('qa_key', key); } catch {}
    set({ qaKey: key });
  },
  clearKey: () => {
    try { sessionStorage.removeItem('qa_key'); } catch {}
    set({ qaKey: '' });
  },
}));
