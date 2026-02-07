export interface PlanetInterface {
  bodies: Planeta[];
}

export interface Planeta {
  id: string;               // El nombre interno (ej: 'terre')
  name: string;             // El nombre bonito (ej: 'La Terre')
  isPlanet: boolean;        // Para confirmar que es un planeta
  rel: string;              // URL relativa al API

  // Datos físicos que querías
  avgTemp: number;          // Temperatura media en Kelvin
  gravity: number;          // Gravedad (ej: 9.8)
  density: number;          // Densidad (ej: 5.513)
  meanRadius: number;       // Radio medio en km

  // Datos de masa (esto viene como un objeto)
  mass: {
    massValue: number;      // El número (ej: 5.97)
  };

  // Otros datos curiosos
  moons: { moon: string; rel: string }[] | null; // Lista de lunas
  sideralOrbit: number;     // Cuánto tarda en dar la vuelta al sol (en días terrestres)
}
