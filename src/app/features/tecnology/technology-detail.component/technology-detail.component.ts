import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'technology-detail.component',
  standalone: true,
  imports: [],
  templateUrl: './technology-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyDetailComponent { }
