import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'celsius',
  standalone: true
})
export class CelsiusPipe implements PipeTransform {
  transform(value: number | null | undefined, decimals: number = 1): string {
    if (typeof value !== 'number') return '';
    const celsius = value - 273.15;
    return celsius.toFixed(decimals) + ' °C';
  }
}
