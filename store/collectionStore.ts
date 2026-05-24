import { create } from 'zustand';
import { CollectionEntry } from '@/types';

interface CollectionState {
  collection: Record<string, CollectionEntry>;
  isLoading: boolean;
  setCollection: (collection: Record<string, CollectionEntry>) => void;
  updateEntry: (stickerId: string, entry: Partial<CollectionEntry>) => void;
  setLoading: (loading: boolean) => void;
  getCollected: () => string[];
  getDuplicates: () => CollectionEntry[];
  getMissing: (allIds: string[]) => string[];
  getCompletionPercentage: (total: number) => number;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  collection: {},
  isLoading: false,
  setCollection: (collection) => set({ collection }),
  updateEntry: (stickerId, entry) =>
    set((state) => ({
      collection: {
        ...state.collection,
        [stickerId]: {
          ...state.collection[stickerId],
          ...entry,
        },
      },
    })),
  setLoading: (isLoading) => set({ isLoading }),
  getCollected: () => {
    const { collection } = get();
    return Object.entries(collection)
      .filter(([, entry]) => entry.collected)
      .map(([id]) => id);
  },
  getDuplicates: () => {
    const { collection } = get();
    return Object.values(collection).filter((entry) => entry.duplicates > 0);
  },
  getMissing: (allIds) => {
    const { collection } = get();
    return allIds.filter((id) => !collection[id]?.collected);
  },
  getCompletionPercentage: (total) => {
    const collected = get().getCollected().length;
    return total > 0 ? Math.round((collected / total) * 100) : 0;
  },
}));
