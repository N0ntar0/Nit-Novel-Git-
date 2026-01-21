import React, { useRef, useEffect, useState } from 'react';
import { LineRuler } from '../Editor/LineRuler';

interface SplitPaneProps {
    layoutMode: 'vertical' | 'horizontal';
    children: [React.ReactNode, React.ReactNode | null]; // Allow null second child
    diffs?: any[]; // diff-lines Change objects
}

export const SplitPane: React.FC<SplitPaneProps> = ({ layoutMode, children, diffs }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const pane1Ref = useRef<HTMLDivElement>(null);
    const pane2Ref = useRef<HTMLDivElement>(null);

    // Per-pane scroll state
    const [scrollPos1, setScrollPos1] = useState(0);
    const [viewportSize1, setViewportSize1] = useState(0);
    const [scrollPos2, setScrollPos2] = useState(0);
    const [viewportSize2, setViewportSize2] = useState(0);

    // Constants: Rigid Grid
    const LINE_HEIGHT = 36;

    // Sync Logic
    useEffect(() => {
        const p1 = pane1Ref.current;
        const p2 = pane2Ref.current;

        if (!p1) return;

        let isSyncingP1 = false;
        let isSyncingP2 = false;

        // Helper to estimate height of a chunk
        const getChunkHeight = (text: string) => {
            // Estimate based on newlines. 
            // Note: This matches LineRuler logic if ruler assumes 1 line = 36px.
            // This ignores wrapping (1 logical line = 1 visual line assumption).
            if (!text) return 0;
            // Count newlines? 
            // If text is "A\nB", split is length 2. Height is 2 * 36.
            // If text is "A", split is length 1. Height is 36.
            // Standard: text.split('\n').length
            // Beware: trailing newline? diffLines usually preserves them.
            const lines = text.split('\n').length;
            // Often diffLines results might yield slightly different counts than visual, but it's the best proxy.
            // Adjust: split creates one extra if ends with \n? 
            // "foo\n".split('\n') -> ["foo", ""]. Length 2.
            // "foo".split('\n') -> ["foo"]. Length 1.
            // It seems correct.
            return (lines - 1) * LINE_HEIGHT; // Approximate? No, keep strictly proportional.
            // Actually, let's just use lines * LINE_HEIGHT for safety.
            // If "foo\n" counts as 2 lines visually (foo + empty line), then correct.
            return lines * LINE_HEIGHT;
        };

        // Calculate Target Scroll
        const calculateTargetScroll = (sourceScroll: number, fromPane: 1 | 2) => {
            if (!diffs || diffs.length === 0) return sourceScroll; // Fallback to linear

            // We traverse the diff chunks and map "Pixel Position in P1" to "Pixel Position in P2".
            let p1Offset = 0;
            let p2Offset = 0;

            let targetOffset = -1;

            // Simplify: Scroll is usually absolute distance from start
            const currentAbsScroll = Math.abs(sourceScroll);

            for (const part of diffs) {
                const h = getChunkHeight(part.value);

                let p1ChunkH = 0;
                let p2ChunkH = 0;

                if (part.added) {
                    // Exists in New (P1), not Old (P2)
                    p1ChunkH = h;
                    // p2ChunkH = 0;
                } else if (part.removed) {
                    // Not in New (P1), exists in Old (P2)
                    p2ChunkH = h;
                    // p1ChunkH = 0;
                } else {
                    // Unchanged
                    p1ChunkH = h;
                    p2ChunkH = h;
                }

                // Check if our current scroll falls within this chunk
                if (fromPane === 1) {
                    if (currentAbsScroll < p1Offset + p1ChunkH) {
                        // We are inside this chunk in P1
                        const progress = currentAbsScroll - p1Offset;

                        if (part.added) {
                            // Scrolling in Added block. P2 should stay at insertion point.
                            targetOffset = p2Offset;
                        } else {
                            // Unchanged block. Map linearly.
                            targetOffset = p2Offset + progress;
                        }
                        break;
                    }
                } else { // fromPane === 2
                    if (currentAbsScroll < p2Offset + p2ChunkH) {
                        const progress = currentAbsScroll - p2Offset;
                        if (part.removed) {
                            // Scrolling in Deleted block. P1 stays.
                            targetOffset = p1Offset;
                        } else {
                            targetOffset = p1Offset + progress;
                        }
                        break;
                    }
                }

                p1Offset += p1ChunkH;
                p2Offset += p2ChunkH;
            }

            // If we exhausted diffs (scrolled past end), project linearly from last known point
            if (targetOffset === -1) {
                if (fromPane === 1) {
                    const remaining = currentAbsScroll - p1Offset;
                    targetOffset = p2Offset + remaining;
                } else {
                    const remaining = currentAbsScroll - p2Offset;
                    targetOffset = p1Offset + remaining;
                }
            }

            return layoutMode === 'vertical' ? -Math.abs(targetOffset) : targetOffset;
        };

        const updateScrollStates = () => {
            if (layoutMode === 'vertical') {
                setScrollPos1(p1.scrollLeft);
                setViewportSize1(p1.clientWidth);
                if (p2) {
                    setScrollPos2(p2.scrollLeft);
                    setViewportSize2(p2.clientWidth);
                }
            } else {
                setScrollPos1(p1.scrollTop);
                setViewportSize1(p1.clientHeight);
                if (p2) {
                    setScrollPos2(p2.scrollTop);
                    setViewportSize2(p2.clientHeight);
                }
            }
        };

        // Init
        updateScrollStates();

        const handleScrollP1 = () => {
            if (isSyncingP1) return;
            if (p2) {
                isSyncingP2 = true;
                // Smart Sync
                const target = calculateTargetScroll(layoutMode === 'vertical' ? p1.scrollLeft : p1.scrollTop, 1);

                if (layoutMode === 'vertical') {
                    p2.scrollLeft = target;
                } else {
                    p2.scrollTop = target;
                }
            }
            updateScrollStates();
            if (p2) requestAnimationFrame(() => { isSyncingP2 = false; });
        };

        const handleScrollP2 = () => {
            if (!p2) return;
            if (isSyncingP2) return;
            isSyncingP1 = true;

            const target = calculateTargetScroll(layoutMode === 'vertical' ? p2.scrollLeft : p2.scrollTop, 2);

            if (layoutMode === 'vertical') {
                p1.scrollLeft = target;
            } else {
                p1.scrollTop = target;
            }

            updateScrollStates();
            requestAnimationFrame(() => { isSyncingP1 = false; });
        };

        p1.addEventListener('scroll', handleScrollP1);
        if (p2) p2.addEventListener('scroll', handleScrollP2);

        const resizeObserver = new ResizeObserver(() => updateScrollStates());
        resizeObserver.observe(p1);

        return () => {
            p1.removeEventListener('scroll', handleScrollP1);
            if (p2) p2.removeEventListener('scroll', handleScrollP2);
            resizeObserver.disconnect();
        };
    }, [layoutMode, children, diffs]);

    return (
        <div
            className={`flex w-full h-full relative ${layoutMode === 'vertical' ? 'flex-row' : 'flex-col'}`}
            ref={containerRef}
        >
            {/* Pane 1 Wrapper */}
            <div className={`flex-1 relative overflow-hidden flex flex-col ${children[1] ? (layoutMode === 'vertical' ? 'border-r border-gray-300' : 'border-b border-gray-300') : ''}`}>
                {/* Ruler Layer */}
                <div className={`absolute z-10 pointers-events-none ${layoutMode === 'vertical' ? 'top-0 left-0 w-full h-6 bg-white/90 border-b' : 'top-0 left-0 h-full w-8 bg-white/90 border-r'}`}>
                    <LineRuler layoutMode={layoutMode} scrollPos={scrollPos1} viewportSize={viewportSize1} />
                </div>

                {/* Scroll Content */}
                <div
                    ref={pane1Ref}
                    className="flex-1 w-full h-full overflow-auto no-scrollbar relative"
                >
                    {/* 
                   Correction: If we add margin, we reduce viewport space. 
                   But we want the text to scroll *under* the ruler? 
                   User said "faintly... all numbers".
                   If transparent overlay, no margin needed.
                   But if User wants them readable, background is better.
                   "bg-white/90" suggests overlay.
                   If overlay, we don't need margin, just `z-index`.
                   BUT current CSS in Ruler used `h-6` or `w-8`.
                   If we overwrite `LineRuler` CSS in `SplitPane`, we should remove it from `LineRuler.tsx` or control it.
                   `LineRuler` renders a `canvas`.
                   Let's remove margin and let it float over?
                   Or add padding to Content?
                   If `WritingCanvas` has standard padding, Ruler might overlap text.
                   User said "at the top".
                   If at top, it definitely overlaps.
                   Let's add padding to the scroll view container relative to ruler size.
                */}
                    <div style={layoutMode === 'vertical' ? { paddingTop: '24px' } : { paddingLeft: '32px', minHeight: '100%' }}>
                        {children[0]}
                    </div>
                </div>
            </div>

            {/* Pane 2 Wrapper (Diff) */}
            {children[1] && (
                <div className="flex-1 relative overflow-hidden flex flex-col bg-gray-50">
                    {/* Ruler Layer */}
                    <div className={`absolute z-10 pointers-events-none ${layoutMode === 'vertical' ? 'top-0 left-0 w-full h-6 bg-gray-50/90 border-b' : 'top-0 left-0 h-full w-8 bg-gray-50/90 border-r'}`}>
                        <LineRuler layoutMode={layoutMode} scrollPos={scrollPos2} viewportSize={viewportSize2} />
                    </div>

                    <div
                        ref={pane2Ref}
                        className="flex-1 w-full h-full overflow-auto no-scrollbar relative"
                    >
                        <div style={layoutMode === 'vertical' ? { paddingTop: '24px' } : { paddingLeft: '32px', minHeight: '100%' }}>
                            {children[1]}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
