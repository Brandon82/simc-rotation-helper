import { create } from 'zustand';

interface QaKeyStore {
  qaKey: string;
  setKey: (key: string) => void;
  clearKey: () => void;
}

function getStoredKey(): string {
  try {
    return localStorage.getItem('qa_key') ?? '';
  } catch {
    return '';
  }
}

export const useQaKeyStore = create<QaKeyStore>((set) => ({
  qaKey: getStoredKey(),
  setKey: (key: string) => {
    try { localStorage.setItem('qa_key', key); } catch {}
    set({ qaKey: key });
  },
  clearKey: () => {
    try { localStorage.removeItem('qa_key'); } catch {}
    set({ qaKey: '' });
  },
}));
