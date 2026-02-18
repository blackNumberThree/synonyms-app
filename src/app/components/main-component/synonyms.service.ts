export interface SynonymResult {
    word: string;
    score: number;
}

export function normalizeSelectedText(value: string): string {
    const processedText = value
        .trim()
        .replace(/^[.,!?;:"'()]+|[.,!?;:"'()]+$/g, '')
        .split(' ')
        .join('+');

    return processedText;
}

export async function loadSynonyms(
    term: string,
): Promise<SynonymResult[] | null> {
    const response = await fetch(
        `https://api.datamuse.com/words?ml=${term}&max=10`,
    );
    console.log(`https://api.datamuse.com/words?ml=${term}&max=10`);

    const data: SynonymResult[] = await response.json();

    if (!data.length) {
        return null;
    }

    return data
        .slice(0, 50)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        .slice(0, 20);
}
