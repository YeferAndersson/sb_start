import { create } from 'zustand';

interface HelpCenterState {
  queryText: string;
  selectedTopic: string;
  setQueryText: (text: string) => void;
  setSelectedTopic: (topic: string) => void;
}

export const useHelpCenterStore = create<HelpCenterState>((set) => ({
  queryText: '',
  selectedTopic: '',
  setQueryText: (text) => set({ queryText: text }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
}));