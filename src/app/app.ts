import { Component, signal } from '@angular/core';
import { Header } from './components/header/header';
import { SidebarMenu } from './components/sidebar-menu/sidebar-menu';
import { DataTable } from './components/data-table/data-table';
// import { RightActions } from './components/right-actions/right-actions';
// import { ViewDisplay } from './components/view-display/view-display';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, SidebarMenu, DataTable],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('front-driving-school');
}
