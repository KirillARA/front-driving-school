import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';

import { MatFormFieldModule }
from '@angular/material/form-field';

import { MatInputModule }
from '@angular/material/input';

import { MatButtonModule }
from '@angular/material/button';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],

  templateUrl: './login.html',

  styleUrl: './login.css'
})
export class Login {

  login = '';

  password = '';

  hasError = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  signIn() {

    this.hasError = false;

    this.http.post(
      'http://localhost:5044/api/auth/login',
      {
        login: this.login,
        password: this.password
      }
    ).subscribe({

      next: () => {

        localStorage.setItem(
          'isAuthenticated',
          'true'
        );

        this.router.navigate(['/main']);
      },

      error: () => {

        this.hasError = true;
      }
    });
  }
}
