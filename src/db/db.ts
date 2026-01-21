import Dexie, { Table } from 'dexie';

export interface Snapshot {
    id?: number;
    timestamp: number;
    message: string;
    content: string;
    layoutMode: 'vertical' | 'horizontal';
}

export class NovelGitDB extends Dexie {
    snapshots!: Table<Snapshot>;

    constructor() {
        super('NovelGitDB');
        this.version(1).stores({
            snapshots: '++id, timestamp' // Primary key and indexed props
        });
    }
}

export const db = new NovelGitDB();
