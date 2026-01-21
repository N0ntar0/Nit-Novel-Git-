import React from 'react';
import { useEditorStore } from '../../store/editorStore';

export const WritingCanvas: React.FC = () => {
    const { content, setContent, layoutMode } = useEditorStore();

    /* 
   * CRITICAL: These base styles must be IDENTICAL to DiffView.tsx and LineRuler calculation
   * Font Size: 18px
   * Line Height: 36px (Exactly double for easy calc)
   * Padding: 2rem (32px) container ?? No, padding must match Ruler offset?
   * For Ruler Sync, it's easiest if padding-top (or right) is 0 or known valid.
   * Let's set internal padding to a clean multiple or 0 for now.
   */
    const baseBg = layoutMode === 'vertical' ? 'bg-[#fdfbf7]' : 'bg-white';
    const writingModeStyle = layoutMode === 'vertical' ? 'vertical-rl' : 'horizontal-tb';

    return (
        <div className={`w-full h-full overflow-auto ${baseBg} relative no-scrollbar`}>
            <textarea
                className={`w-full h-full resize-none focus:outline-none bg-transparent 
          font-serif text-gray-800
        `}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ここから執筆を開始..."
                style={{
                    writingMode: writingModeStyle,
                    minHeight: '100%',
                    padding: '36px', // 1 line padding
                    fontSize: '18px',
                    lineHeight: '36px',
                }}
            />
        </div>
    );
};
