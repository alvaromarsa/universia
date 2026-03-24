export interface TechnologyInterface {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
 }


export interface NasaResponse {
  results: (string | number | unknown)[][]; // Un array de arrays con mezcla de datos
  count: number;
  total: number;
}
