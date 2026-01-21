import { create } from 'zustand';

interface EditorState {
    content: string;
    layoutMode: 'vertical' | 'horizontal';
    setContent: (content: string) => void;
    setLayoutMode: (mode: 'vertical' | 'horizontal') => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    content: '',
    layoutMode: 'vertical', // Default to vertical as per requirements
    setContent: (content) => set({ content }),
    setLayoutMode: (layoutMode) => set({ layoutMode }),
}));
