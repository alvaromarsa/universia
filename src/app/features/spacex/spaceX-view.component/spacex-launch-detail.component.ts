import { DatePipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SpacexDescriptionTranslatePipe } from '../spacex-description-translate.pipe';
import { SpacexInterface } from '../spacexInterface';

@Component({
  selector: 'app-spacex-launch-detail',
  standalone: true,
  imports: [NgIf, DatePipe, SpacexDescriptionTranslatePipe],
  templateUrl: './spacex-launch-detail.component.html',
  styleUrls: ['../spacex.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacexLaunchDetailComponent {
  @Input({ required: true }) launch!: SpacexInterface;
  @Input({ required: true }) isFavorite = false;
  @Input({ required: true }) launchStatus = '';
  @Input({ required: true }) launchStatusClass = '';

  @Output() readonly favoriteToggled = new EventEmitter<void>();
  @Output() readonly backRequested = new EventEmitter<void>();

  toggleFavorite(): void {
    this.favoriteToggled.emit();
  }

  goBack(): void {
    this.backRequested.emit();
  }
}
