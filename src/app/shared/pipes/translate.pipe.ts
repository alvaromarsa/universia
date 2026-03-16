import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate', // Este es el nombre que usaremos en el HTML
  standalone: true        // Para que lo puedas usar fácilmente en tus componentes
})
export class TranslatePipe implements PipeTransform {

  // Nuestro pequeño diccionario privado
  private readonly diccionario: { [key: string]: string } = {
    'mercure': 'Mercurio',
    'vénus': 'Venus',
    'la terre': 'Tierra',
    'mars': 'Marte',
    'jupiter': 'Júpiter',
    'saturne': 'Saturno',
    'uranus': 'Urano',
    'neptune': 'Neptuno',

  };

  transform(value: string): string {
    if (!value) return value;

    // Convertimos a minúsculas por si acaso la API nos manda "HEAD" o "Head"
    const palabraBusqueda = value.toLowerCase();

    // Si la palabra está en nuestro diccionario, la devolvemos traducida.
    // Si no está, devolvemos la palabra original para no romper nada.
    return this.diccionario[palabraBusqueda] || value;
  }
}
