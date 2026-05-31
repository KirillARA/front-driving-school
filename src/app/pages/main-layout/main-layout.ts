import { Component } from '@angular/core';

import { Header }
from '../../components/header/header';

import { SidebarMenu }
from '../../components/sidebar-menu/sidebar-menu';

import { DataTable }
from '../../components/data-table/data-table';

@Component({
  selector: 'app-main-layout',

  standalone: true,

  imports: [
    Header,
    SidebarMenu,
    DataTable
  ],

  templateUrl:
    './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {}