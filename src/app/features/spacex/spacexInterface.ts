export interface SpacexInterface {
  id: string;
  name: string;
  details: string | null;
  date_utc: string;
  success: boolean | null;
  links: {
    patch: {
      small: string | null; // La miniatura del logo
    },
    webcast: string | null; // ¡Por si quieres poner un botón para ver el vídeo en YouTube!
  };
  rocket: string; // ID del cohete
}
