import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CanvasComponent],
  templateUrl: './directory.component.html',
  styleUrl: './directory.component.css'
})
export class DirectoryComponent {
  result = ["ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham", "ngnangcuong", "nghongtham"];
  page = signal(1);
  limit = signal(25);
  maxPage = signal(100);
  searchMode = signal("channel");

  @Output()
  liveChat = new EventEmitter<string>();
  searchChannels() {
    this.searchMode.set("channel");
  }

  searchUsers() {
    this.searchMode.set("user");
  }

  changeLimit(limit:number) {
    this.limit.set(limit);
  }

  changePage(page:number) {
    if (page <= 0 || page > this.maxPage()) return;
    this.page.set(page);
  }

  switchToLiveChat(conversationID:string) {
    this.liveChat.emit(conversationID);
  }
}
