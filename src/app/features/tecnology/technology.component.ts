import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule} from '@angular/common';


import { TechnologyService } from './technologyService';
import { TechnologyInterface } from './technologyInterface';


@Component({
  selector: 'tecnologyComponent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './technology.component.html',
  styleUrls: ['./technology.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnologyComponent {
  constructor( private technologyService: TechnologyService, @Inject(PLATFORM_ID) private platformId: Object ) { }

  public allTechnologies: TechnologyInterface[] = []; // Las 28 tecnologias
  public visibleTechnologies: TechnologyInterface[] = []; // Las 4 tecnologias visibles

  public currentPage: number = 0;
  public pageSize: number = 4;

  ngOnInit(): void {

      this.technologyService.getFavTecnologies().subscribe({
        next: (data) => {
          this.allTechnologies = data;
          this.updatePage();
        },
        error: (error) => {
          console.error('❌ Error al obtener las tecnologías:', error);
        },
        complete: () => console.log('✅ Proceso de obtención de tecnologías completado.')
      });

  }

  updatePage(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.visibleTechnologies = this.allTechnologies.slice(start, end);
  }

  nextPage(): void {
    if ((this.currentPage + 1) * this.pageSize < this.allTechnologies.length) {
      this.currentPage++;
      this.updatePage();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePage();
    }
  }

 }
