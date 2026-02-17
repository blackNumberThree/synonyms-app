export interface SynonymResult {
    word: string;
    score: number;
}

/**
 * Нормалізує виділений текст: обрізає пробіли та видаляє пунктуацію на краях
 */
export function normalizeSelectedText(value: string): string {
    const trimmed = value.trim();
    // Видаляємо пунктуацію на краях: . , ! ? ; : " ' ( )
    return trimmed.replace(/^[.,!?;:"'()]+|[.,!?;:"'()]+$/g, '');
}

/**
 * Завантажує синоніми з Datamuse API
 * Повертає Promise з масивом синонімів або null у разі помилки/пустого результату
 */
export async function loadSynonyms(
    term: string,
): Promise<SynonymResult[] | null> {
    try {
        const response = await fetch(
            `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(term)}`,
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data: SynonymResult[] = await response.json();

        if (!data.length) {
            return null;
        }

        // Сортуємо за score (з більшого до меншого) та обмежуємо до 20 результатів
        return data
            .slice(0, 50)
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, 20);
    } catch {
        throw new Error('Помилка підключення до сервера. Спробуйте пізніше.');
    }
}
