import { Component } from '@angular/core';

@Component({
  selector: 'homeComponent',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
})

export class HomeComponent  {
  ngafterViewInit() {
    const video = document.querySelector('video');
    if (video) {
      video.load();
    }
  }
}
