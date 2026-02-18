import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    loadSynonyms as fetchSynonyms,
    normalizeSelectedText,
} from './synonyms.service';
import { signal, computed } from '@angular/core';
@Component({
    selector: 'app-main-component',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './main-component.html',
    styleUrl: './main-component.scss',
})
export class MainComponent implements OnInit {
    textControl = new FormControl<string>('', { nonNullable: true });
    destroyRef = inject(DestroyRef);
    isLoadingSynonyms = signal(false);
    synonyms = signal<Array<{ word: string; score: number }>>([]);
    synonymsError = signal<string | null>(null);

    charCount = 0;
    wordCount = 0;
    selectedText: string | null = null;
    selectionStart: number | null = null;
    selectionEnd: number | null = null;

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
            this.selectionStart = null;
            this.selectionEnd = null;
            return;
        }

        const { selectionStart, selectionEnd, value } = target;
        if (
            selectionStart == null ||
            selectionEnd == null ||
            selectionStart === selectionEnd
        ) {
            this.selectedText = null;
            this.selectionStart = null;
            this.selectionEnd = null;
            return;
        }

        this.selectedText = value.substring(selectionStart, selectionEnd);
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
    }

    onGetSynonymsClick(): void {
        if (!this.selectedText) {
            return;
        }
        this.loadSynonyms(normalizeSelectedText(this.selectedText));
    }

    updateStats(value: string): void {
        this.charCount = value.length;
        this.wordCount = this.getWordCount(value);
    }

    getWordCount(value: string): number {
        return value.trim().split(/\s+/).filter(Boolean).length;
    }

    onSynonymClick(synonym: string): void {
        if (this.selectionStart == null || this.selectionEnd == null) {
            return;
        }

        const currentValue = this.textControl.value;
        const textBefore = currentValue.substring(0, this.selectionStart);
        const textAfter = currentValue.substring(this.selectionEnd);

        const newText = textBefore + synonym + ' ' + textAfter;
        this.textControl.setValue(newText);
        this.synonyms.set([]);
        this.synonymsError.set(null);
        this.selectedText = null;
        this.selectionStart = null;
        this.selectionEnd = null;
    }

    private async loadSynonyms(term: string): Promise<void> {
        this.isLoadingSynonyms.set(true);
        this.synonymsError.set(null);
        this.synonyms.set([]);

        try {
            const result = await fetchSynonyms(term);
            if (result === null) {
                this.synonymsError.set('Для цього слова не знайдено синонімів');
                return;
            }

            this.synonyms.set(result);
        } catch (error) {
            this.synonymsError.set(
                error instanceof Error
                    ? error.message
                    : 'Помилка підключення до сервера. Спробуйте пізніше.',
            );
        } finally {
            this.selectedText = null;
            this.isLoadingSynonyms.set(false);
        }
    }
}
