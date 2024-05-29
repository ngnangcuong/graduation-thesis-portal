import { Component, ElementRef, EventEmitter, Output, signal, HostListener, ViewChild } from '@angular/core';
import { CanvasComponent } from '../canvas/canvas.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CanvasComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css'
})
export class MembersComponent {
  members = signal<string[]>([]);
  isShowOptions = signal<boolean>(false);
  display = signal<string>("MembersInfo")

  @Output()
  cancel = new EventEmitter<boolean>();

  @Output()
  needToConfirm = new EventEmitter<string>();

  @ViewChild("membersInfo", {read:ElementRef})
  membersInfoComponent!:ElementRef;

  @ViewChild("addUser", {read: ElementRef})
  addUserComponent!:ElementRef;

  constructor() {
    this.members.update(val => [...val, "ngnangcuong", "nghongtham"])
  }

  onCancel() {
    this.cancel.emit(true);
  }

  removeUser(member:string) {
    this.needToConfirm.emit(member);
  } 
  addNewUser(members:string) {
    this.needToConfirm.emit(members);
  }

  confirmRemoveUser(member:string) {
    this.members.update(val => val.filter(m => m != member));
  }

  switchToAddUser() {
    this.display.set("AddUser");
  }

  backToMembersInfo() {
    this.display.set("MembersInfo");
  }
}
