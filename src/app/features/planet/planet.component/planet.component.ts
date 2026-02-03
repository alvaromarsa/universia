import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-planet.component',
  standalone: true,
  imports: [],
  templateUrl: './planet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanetComponent { }
