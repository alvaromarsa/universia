import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'homeComponent',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
