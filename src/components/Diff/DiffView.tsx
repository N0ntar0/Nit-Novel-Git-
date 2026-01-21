import React, { useEffect, useState } from 'react';
import { snapshotService } from '../../services/snapshotService';
import type { Snapshot } from '../../db/db';
import { diffLines } from 'diff';

interface DiffViewProps {
    currentContent: string;
    layoutMode: 'vertical' | 'horizontal';
    onDiffUpdate?: (diffs: any[]) => void;
}

interface RenderedLine {
    id: string;
    text: string;
    status: 'added' | 'deleted' | 'unchanged';
}

export const DiffView: React.FC<DiffViewProps> = ({ currentContent, layoutMode, onDiffUpdate }) => {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
    const [diffLinesData, setDiffLinesData] = useState<RenderedLine[]>([]);

    useEffect(() => {
        const loadSnapshots = async () => {
            const all = await snapshotService.getAllSnapshots();
            // Sort desc by timestamp
            all.sort((a, b) => b.timestamp - a.timestamp);
            setSnapshots(all);
            if (all.length > 0 && selectedSnapshotId === null) {
                // Default to latest
                setSelectedSnapshotId(all[0].id!);
            }
        };
        loadSnapshots();
    }, [selectedSnapshotId]);

    useEffect(() => {
        if (selectedSnapshotId !== null) {
            const snapshot = snapshots.find(s => s.id === selectedSnapshotId);
            if (snapshot) {
                // Calculate Diff
                const changes = diffLines(snapshot.content, currentContent);
                let counter = 0;
                const lines: RenderedLine[] = [];

                changes.forEach((change) => {
                    const status = change.added ? 'added' : change.removed ? 'deleted' : 'unchanged';
                    lines.push({
                        id: `diff-${counter++}`,
                        text: change.value,
                        status: status
                    });
                });
                setDiffLinesData(lines);

                if (onDiffUpdate) {
                    onDiffUpdate(changes);
                }
            }
        }
    }, [selectedSnapshotId, currentContent, snapshots, onDiffUpdate]);

    /* 
     * MATCHING STYLES WITH WritingCanvas.tsx
     * Font: 'Shippori Mincho', serif
     * Size: text-lg (18px)
     * Leading: strict-36px (custom) or just matching line-height
     * Padding: p-8
     */
    const baseStyle = "font-serif text-lg leading-[36px] p-8 break-words whitespace-pre-wrap";
    const baseBg = "bg-gray-50";

    return (
        <div className={`flex flex-col h-full bg-gray-50 border-l ${layoutMode === 'vertical' ? 'border-gray-200' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">比較対象:</span>
                    <select
                        value={selectedSnapshotId || ''}
                        onChange={(e) => setSelectedSnapshotId(Number(e.target.value))}
                        className="text-sm border rounded px-2 py-1"
                    >
                        {snapshots.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.message || new Date(s.timestamp).toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-red-100 border border-red-200 block"></span> 削除
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-green-100 border border-green-200 block"></span> 追加
                    </span>
                </div>
            </div>

            {/* Diff Content Area */}
            <div className={`flex-1 overflow-auto ${baseBg} relative`}>
                <div
                    className={`w-full h-full ${baseStyle} text-gray-800`}
                    style={{
                        writingMode: layoutMode === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
                        fontFamily: "'Shippori Mincho', serif"
                    }}
                >
                    {diffLinesData.map((line) => {
                        let bgClass = '';
                        if (line.status === 'added') bgClass = 'bg-green-100 decoration-green-500';
                        if (line.status === 'deleted') bgClass = 'bg-red-100 line-through decoration-red-500 text-gray-400';

                        return (
                            <span key={line.id} className={`${bgClass}`}>
                                {line.text}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
