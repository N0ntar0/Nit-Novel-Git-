import { db, type Snapshot } from '../db/db';

export const snapshotService = {
    async createSnapshot(content: string, message: string, layoutMode: 'vertical' | 'horizontal'): Promise<number> {
        const snapshot: Snapshot = {
            timestamp: Date.now(),
            message,
            content,
            layoutMode
        };
        return await db.snapshots.add(snapshot);
    },

    async getAllSnapshots(): Promise<Snapshot[]> {
        return await db.snapshots.orderBy('timestamp').reverse().toArray();
    },

    async getSnapshot(id: number): Promise<Snapshot | undefined> {
        return await db.snapshots.get(id);
    },

    async deleteSnapshot(id: number): Promise<void> {
        return await db.snapshots.delete(id);
    }
};
