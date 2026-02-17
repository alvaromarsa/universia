import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';



import { Petitions } from '../../../shared/services/petitions.service';
import { Planeta } from '../../../shared/interfaces/planet.interface';

@Component({
  selector: 'planetComponent',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink],
  templateUrl: './planet.component.html',
})
export class PlanetComponent implements OnInit {

  public petitionsInject = inject(Petitions);
  public planetsName$!: Observable<Planeta[]>;

  ngOnInit(): void {
    this.planetsName$ = this.petitionsInject.getPlanetsName();
  }

 }
