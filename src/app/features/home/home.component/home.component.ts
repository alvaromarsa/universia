import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar.component/navbar.component";

@Component({
  selector: 'homeComponent',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent { }
