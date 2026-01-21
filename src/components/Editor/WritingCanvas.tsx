import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export const WritingCanvas: React.FC = () => {
    const { content, setContent, layoutMode } = useEditorStore();

    return (
        <div className={`w-full h-full p-8 overflow-auto ${layoutMode === 'vertical' ? 'bg-[#fdfbf7]' : 'bg-white'}`}>
            <textarea
                className={`w-full h-full p-4 resize-none focus:outline-none bg-transparent text-lg leading-loose
          ${layoutMode === 'vertical' ? 'vertical-rl' : ''}
          font-serif text-gray-800
        `}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ここから執筆を開始..."
                style={{
                    minHeight: '80vh',
                    // Tailwind "vertical-rl" class sets "writing-mode: vertical-rl", 
                    // but we might need explicit style if Tailwind class is not working as expected yet.
                    // We rely on standard Tailwind 'vertical-rl' or 'writing-vertical-rl' class?
                    // Actually standard class is 'vertical-rl' for writing-mode utility in some versions, 
                    // but let's check docs. Actually it is 'writing-vertical-rl' in Tailwind v3?
                    // 'vertical-rl' is valid too? 
                    // Let's use inline style for safety for writing-mode to be 100% sure in MVP.
                    writingMode: layoutMode === 'vertical' ? 'vertical-rl' : 'horizontal-tb'
                }}
            />
        </div>
    );
};
