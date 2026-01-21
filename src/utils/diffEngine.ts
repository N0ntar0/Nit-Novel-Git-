import { diffLines } from 'diff';

export interface SentenceDiff {
    text: string;
    status: 'unchanged' | 'modified' | 'added' | 'deleted';
}

export interface ParagraphDiff {
    id: string; // Unique ID for key
    index: number;
    status: 'unchanged' | 'modified' | 'added' | 'deleted';
    text: string; // The full text of the paragraph (if modified, shows new version)
    oldText?: string; // If modified, shows old version
    details?: SentenceDiff[]; // Detailed diff within paragraph
}

/**
 * 2つのテキストを比較し、段落単位の差分を算出する
 * @param oldText 比較元テキスト
 * @param newText 比較先テキスト
 */
export const compareTexts = (oldText: string, newText: string): ParagraphDiff[] => {
    // 1. 段落ごとの差分を取得 (改行で判定)
    // diffLines uses newline as delimiter by default
    const changes = diffLines(oldText, newText, { newlineIsToken: true });

    let result: ParagraphDiff[] = [];
    let currentIndex = 0;

    changes.forEach((change) => {
        // split by newline because diffLines might group multiple lines into one change
        // We want to handle each visual paragraph individually if possible, or at least keep structure.
        // However, diffLines groups acts weirdly with multiple newlines sometimes.
        // Let's iterate through the 'value' and split by newline to map back to paragraphs.

        // NOTE: For a simple MVP, we treat the grouped change chunks as "regions".
        // But since the requirement is "Paragraph Unit", let's try to map it.

        // Improved logic:
        // If we just use the raw changes, we can map them directly.
        // 'value' can contain multiple lines.

        const lines = change.value.split('\n');
        // The last element might be empty if value ends with newline, standard split behavior.
        if (lines.length > 1 && lines[lines.length - 1] === '') {
            lines.pop();
        }

        lines.forEach((line) => {
            // Skip completely empty lines? No, empty lines are significant in writing (spacing).
            // But for visual diff, maybe we treat them as spacing.

            let status: 'unchanged' | 'modified' | 'added' | 'deleted' = 'unchanged';
            if (change.added) status = 'added';
            if (change.removed) status = 'deleted';

            // For 'modified', diffLines returns separate 'removed' and 'added' blocks.
            // Merging them into 'modified' is complex without a robust algorithm (like Myers on paragraphs).
            // For MVP, standard diff behavior (Delete then Add) is acceptable for "Modified" paragraphs.
            // We can visually represent this as Red block then Green block.

            result.push({
                id: Math.random().toString(36).substr(2, 9),
                index: currentIndex++,
                status: status,
                text: line
            });
        });
    });

    return result;
};
