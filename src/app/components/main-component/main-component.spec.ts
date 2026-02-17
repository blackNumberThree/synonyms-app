import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { MainComponent } from './main-component';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Этап 1: поле вводу та статистика', () => {
    it('1.1 рендерить textarea', () => {
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea).toBeTruthy();
    });

    it('1.2 textarea має maxlength 100000', () => {
      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.getAttribute('maxlength')).toBe('100000');
    });

    it('1.3 після введення "abc" показує 3 символи', () => {
      vi.useFakeTimers();
      component.textControl.setValue('abc');
      vi.advanceTimersByTime(150);
      fixture.detectChanges();
      expect(component.charCount).toBe(3);
      const el = fixture.nativeElement.querySelector('.stats');
      expect(el.textContent).toContain('3');
      vi.useRealTimers();
    });

    it('1.4 підрахунок слів: "one two  three" → 3 слова', () => {
      vi.useFakeTimers();
      component.textControl.setValue('one two  three');
      vi.advanceTimersByTime(150);
      fixture.detectChanges();
      expect(component.wordCount).toBe(3);
      vi.useRealTimers();
    });

    it('1.5 пустий текст або лише пробіли → 0 слів', () => {
      component.updateStats('');
      expect(component.wordCount).toBe(0);
      component.updateStats('   ');
      expect(component.wordCount).toBe(0);
    });

    it('1.6 debounce 150ms: статистика оновлюється після 150ms', () => {
      vi.useFakeTimers();
      component.textControl.setValue('hello');
      expect(component.charCount).toBe(0);
      vi.advanceTimersByTime(149);
      expect(component.charCount).toBe(0);
      vi.advanceTimersByTime(1);
      expect(component.charCount).toBe(5);
      vi.useRealTimers();
    });
  });
});
