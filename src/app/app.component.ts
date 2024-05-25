import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LiveChatComponent } from './live-chat/live-chat.component';
import { NavigationComponent } from './navigation/navigation.component';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LiveChatComponent, NavigationComponent, EditorModule],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'graduation-thesis';
}
