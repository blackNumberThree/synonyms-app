import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './components/main-component/main-component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MainComponent],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly title = signal('synonyms-app');
}
