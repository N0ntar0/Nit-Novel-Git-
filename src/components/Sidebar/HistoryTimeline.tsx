import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { snapshotService } from '../../services/snapshotService';
import type { Snapshot } from '../../db/db';

export const HistoryTimeline: React.FC = () => {
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const { setContent } = useEditorStore();

    const loadSnapshots = async () => {
        const data = await snapshotService.getAllSnapshots();
        setSnapshots(data);
    };

    useEffect(() => {
        loadSnapshots();
        // Subscribe to DB changes if needed, but for MVP simple reload on action interaction
        // Or we can expose a reload trigger. For now simple Polling or event based?
        // Let's rely on parent trigger or simple mount.
        // Actually, LiveQuery is better with Dexie, but keeping it simple for now.
        const interval = setInterval(loadSnapshots, 2000); // Poll for updates for MVP simplicity
        return () => clearInterval(interval);
    }, []);

    const handleLoadSnapshot = (snapshot: Snapshot) => {
        if (confirm('現在の内容を上書きして、この時点の状態に戻しますか？')) {
            setContent(snapshot.content);
        }
    };

    return (
        <div className="flex flex-col gap-4 mt-4 overflow-y-auto max-h-[calc(100vh-200px)]">
            {snapshots.map((snap) => (
                <div key={snap.id} className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition cursor-pointer group" onClick={() => handleLoadSnapshot(snap)}>
                    <div className="text-xs text-gray-400 mb-1">
                        {new Date(snap.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-white truncate max-w-full">
                        {snap.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                        {snap.content.substring(0, 20)}...
                    </div>
                </div>
            ))}
            {snapshots.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">履歴なし</div>
            )}
        </div>
    );
};
