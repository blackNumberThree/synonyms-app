import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { loadSynonyms, normalizeSelectedText } from './synonyms.service';

@Component({
    selector: 'app-main-component',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './main-component.html',
    styleUrl: './main-component.scss',
})
export class MainComponent implements OnInit {
    readonly textControl = new FormControl<string>('', { nonNullable: true });

    charCount = 0;
    wordCount = 0;
    selectedText: string | null = null;
    normalizedSelectedText: string | null = null;

    synonyms: Array<{ word: string; score: number }> = [];
    isLoadingSynonyms = false;
    synonymsError: string | null = null;

    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.updateStats(this.textControl.value);
        this.textControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => this.updateStats(value));
    }

    onSelectionChange(event: Event): void {
        const target = event.target as HTMLTextAreaElement | null;
        if (!target) {
            this.selectedText = null;
            return;
        }

        const { selectionStart, selectionEnd, value } = target;
        if (
            selectionStart == null ||
            selectionEnd == null ||
            selectionStart === selectionEnd
        ) {
            this.selectedText = null;
            return;
        }

        this.selectedText = value.substring(selectionStart, selectionEnd);
    }

    onGetSynonymsClick(): void {
        if (!this.selectedText) {
            return;
        }

        const normalized = normalizeSelectedText(this.selectedText);
        if (!normalized) {
            return;
        }

        this.normalizedSelectedText = normalized;
        this.loadSynonyms(normalized);
    }

    updateStats(value: string): void {
        this.charCount = value.length;
        this.wordCount = this.getWordCount(value);
    }

    getWordCount(value: string): number {
        return value.trim().split(/\s+/).filter(Boolean).length;
    }

    private async loadSynonyms(term: string): Promise<void> {
        console.log('loadSynonyms', term);

        this.isLoadingSynonyms = true;
        this.synonymsError = null;
        this.synonyms = [];

        try {
            const result = await loadSynonyms(term);

            if (result === null) {
                this.synonymsError = 'Для цього слова не знайдено синонімів';
                return;
            }

            this.synonyms = result;
        } catch (error) {
            this.synonymsError =
                error instanceof Error
                    ? error.message
                    : 'Помилка підключення до сервера. Спробуйте пізніше.';
        } finally {
            this.isLoadingSynonyms = false;
        }
        console.log(this.synonyms);
    }
}
