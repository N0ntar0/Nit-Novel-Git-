import React, { useEffect, useRef } from 'react';

interface LineRulerProps {
    layoutMode: 'vertical' | 'horizontal';
    scrollPos: number;
    viewportSize: number;
}

export const LineRuler: React.FC<LineRulerProps> = ({ layoutMode, scrollPos, viewportSize }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Custom Line Height Configuration
    // Must match WritingCanvas and DiffView strictly
    const LINE_HEIGHT = 36;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !canvas.parentElement) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;

        // Parent is the Ruler Bar (w-full/h-6 or w-8/h-full)
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Display size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        // Calculate Scroll & Visible Range
        // Note: scrollPos passed from SplitPane is correct value from the scroller
        const startPixel = Math.abs(scrollPos);
        const endPixel = startPixel + (layoutMode === 'vertical' ? width : height);

        // Draw Ticks & Numbers
        const firstLine = Math.floor(startPixel / LINE_HEIGHT);
        const lastLine = Math.ceil(endPixel / LINE_HEIGHT);

        // Config
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = firstLine; i <= lastLine; i++) {
            if (i <= 0) continue;

            // Position relative to document start
            const posPx = (i * LINE_HEIGHT) - startPixel;

            if (layoutMode === 'vertical') {
                const x = width - posPx - (LINE_HEIGHT / 2);
                if (x > -20 && x < width + 20) {
                    ctx.fillText(i.toString(), x, height / 2);
                }
            } else {
                const y = posPx - (LINE_HEIGHT / 2);
                if (y > -20 && y < height + 20) {
                    ctx.fillText(i.toString(), width / 2, y);
                }
            }
        }
    }, [layoutMode, scrollPos, viewportSize]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
        />
    );
};
