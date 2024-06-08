import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserServiceService } from '../user-service.service';
import CreateUserRequest from '../../models/user/registerRequest';
import CustomResponse from '../../models/response';
import LoginRequest from '../../models/user/loginRequest';
import LoginResponse from '../../models/user/loginResponse';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  mode = signal<string>("Login");
  usernameLogin = new FormControl('');
  passwordLogin = new FormControl('');
  nameRegister = new FormControl('');
  emailRegister = new FormControl('');
  usernameRegister = new FormControl('')
  passwordRegister = new FormControl('');
  confirmPasswordRegister = new FormControl('');
  errorMessage = signal<string>("");

  @Output()
  successfulLogin = new EventEmitter<string>();

  constructor(public userService:UserServiceService) {
  }

  switchMode(mode:string) {
    this.mode.set(mode);
    this.errorMessage.set("");
  }

  getRandomDefaultBackgroundAvatar(): string {
    const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  register() {
    const name = this.nameRegister.value;
    const email = this.emailRegister.value;
    const username = this.emailRegister.value;
    const password = this.passwordRegister.value;
    const confirmPassword = this.confirmPasswordRegister.value;
    if (!name || !email || !username || !password || !confirmPassword) {
      this.errorMessage.set("All field are required.");
      return;
    }
    if (confirmPassword != password) {
      this.errorMessage.set("Confirm password is not identical with your password.");
      return;
    }
    const createUserRequest:CreateUserRequest = {
      username: username!,
      password: password!,
      email: email!,
      first_name: name!,
      last_name: name!,
      phone_number: "",
      avatar: this.getRandomDefaultBackgroundAvatar(),
    }
    this.userService.register(createUserRequest).subscribe(
      (val) => {
        this.errorMessage.set("Create user successfully, you can login now.");
        this.mode.set("Login");
      },
      (err:CustomResponse) => {
        this.errorMessage.set(err.error_message);
      }
    )
  }

  login() {
    const username = this.usernameLogin.value;
    const password = this.passwordLogin.value;
    const loginRequest:LoginRequest = {
      username: username!,
      password: password!,
    };
    this.userService.login(loginRequest).subscribe(
      (val) => {
        const result:LoginResponse = val.result as LoginResponse;
        localStorage.setItem("access_token", result.access_token);
        localStorage.setItem("refresh_token", result.refresh_token);
        this.successfulLogin.emit(result.user_id);
      },
      (err:CustomResponse) => {

      }
    )
  }
}
