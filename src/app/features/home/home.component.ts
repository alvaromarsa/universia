import { ChangeDetectionStrategy, Component, OnInit, Inject, PLATFORM_ID, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'homeComponent',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
})

export class HomeComponent  {

}
