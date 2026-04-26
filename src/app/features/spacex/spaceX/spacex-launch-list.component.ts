import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

import { SpacexInterface } from '../spacexInterface';

@Component({
  selector: 'app-spacex-launch-list',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './spacex-launch-list.component.html',
  styleUrls: ['../spacex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacexLaunchListComponent {
  @Input({ required: true }) launches: SpacexInterface[] = [];
  @Output() readonly launchSelected = new EventEmitter<SpacexInterface>();

  selectLaunch(launch: SpacexInterface): void {
    this.launchSelected.emit(launch);
  }

  trackById(_: number, launch: SpacexInterface): string {
    return launch.id;
  }
}
