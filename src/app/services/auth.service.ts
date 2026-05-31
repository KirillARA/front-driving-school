import { Injectable } from '@angular/core';

import { HttpClient }
from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl =
    'http://localhost:5044/api/auth';

  constructor(
    private http: HttpClient
  ) {}

  login(
    login: string,
    password: string
  ) {
    return this.http.post(
      `${this.apiUrl}/login`,
      {
        login,
        password
      }
    );
  }
}
