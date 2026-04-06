import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spacexDescriptionTranslate',
  standalone: true,
})
export class SpacexDescriptionTranslatePipe implements PipeTransform {
  private readonly dictionary: Record<string, string> = {
    '61eefaa89eb1064137a1bd73':
      'Axiom Mission 1 fue una mision tripulada privada de SpaceX y Axiom Space hacia la Estacion Espacial Internacional, con una estancia aproximada de ocho dias para una tripulacion de cuatro personas.',
    '6161d32d6db1a92bfba85359':
      'La mision CSG-2 llevo un Falcon 9 a una orbita polar heliosincrona desde Florida, con despegue desde SLC-40, maniobra dogleg y previsión de retorno del propulsor a LZ-1.',
    '6161d2006db1a92bfba85356':
      'CRS-24 fue la vigesimocuarta mision de reabastecimiento de SpaceX a la Estacion Espacial Internacional para la NASA, transportando suministros y experimentos cientificos con una Dragon 2 de carga.',
    '5fe3afc1b3467846b3242164':
      'Turksat 5B es un satelite de comunicaciones destinado a ampliar servicios de television y datos en una amplia zona que abarca Oriente Medio, Africa y otras regiones, con una vida operativa estimada de tres decadas.',
    '61bba806437241381bf7061e':
      'Esta mision desplego 52 satelites Starlink v1.5 en la shell 4 con inclinacion de 53,2 grados, destacando porque despego desde Vandenberg en lugar de la costa este.',
    '5fe3b107b3467846b324216b':
      'DART fue la prueba de la NASA para demostrar que un impactador cinetico puede desviar la trayectoria de un asteroide, validando tecnologia de navegacion autonoma y observacion previa al impacto.',
    '5fe3b15eb3467846b324216d':
      'Crew-3 fue la tercera mision operativa de Crew Dragon dentro del programa Commercial Crew de la NASA, llevando cuatro astronautas a la Estacion Espacial Internacional con una capsula nueva y un propulsor reutilizado.',
    '607a37565a906a44023e0866':
      'Inspiration4 fue la primera mision totalmente civil a la orbita terrestre, concebida para impulsar una nueva etapa del vuelo espacial tripulado privado y recaudar fondos para causas beneficas.',
    '5fe3b11eb3467846b324216c':
      'CRS-23 fue otra mision de carga de SpaceX para la NASA hacia la Estacion Espacial Internacional, con suministros esenciales, experimentos y posterior retorno de la capsula Dragon.',
    '600f9b6d8f798e2a4d5f979f':
      'Transporter-2 fue una mision rideshare de SpaceX para pequenos satelites, colocando cerca de noventa cargas utiles en orbita mediante distintos sistemas de despliegue.',
    '5eb87d4effd86e000604b390':
      'GPS III SV05 fue el cuarto lanzamiento GPS III de SpaceX y el primero de seguridad nacional en volar con un propulsor ya utilizado, reforzando la constelacion NAVSTAR de nueva generacion.',
    '5fe3af6db3467846b3242160':
      'SXM-8 llevo a orbita de transferencia geoestacionaria un satelite de nueva generacion para SiriusXM, destinado a sustituir a XM-4 y reforzar su red de radiodifusion.',
  };

  transform(description: string | null | undefined, launchId?: string): string {
    if (!description) {
      return 'Sin descripcion disponible para este lanzamiento.';
    }

    if (launchId && this.dictionary[launchId]) {
      return this.dictionary[launchId];
    }

    return description;
  }
}
