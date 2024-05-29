import { Component, ElementRef, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent {
  @Input() 
  name!: string;
  initials!: string;
  backgroundColor!: string;

  ngOnInit() {
    this.initials = this.getInitials(this.name);
    this.backgroundColor = this.getRandomColor();
  }

  getInitials(name: string): string {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n.charAt(0)).join('');
    return initials.substring(0, 2); // Lấy 2 ký tự đầu tiên
  }

  getRandomColor(): string {
    const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }
}
