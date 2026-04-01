import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'technologyTranslate',
  standalone: true
})
export class TechnologyTranslatePipe implements PipeTransform {
  private readonly dictionary: Record<string, string> = {
    'spacecraft to remove orbital debris': 'Nave espacial para eliminar residuos orbitales',
    'new wing design exponentially increases total aircraft efficiency': 'Nuevo diseño de ala que aumenta exponencialmente la eficiencia total de la aeronave',
    'computer-brain interface for display control': 'Interfaz cerebro-ordenador para el control de pantallas',
    'modular robotic vehicle (mrv)': 'Vehículo robótico modular (MRV)',
    'upper body robotic exoskeleton': 'Exoesqueleto robótico para la parte superior del cuerpo',
    'contaminated water treatment': 'Tratamiento de agua contaminada',
    'space weather database of notifications, knowledge, information (donki)': 'Base de datos espacial DONKI de notificaciones, conocimiento e información',
    'nanosensor array for medical diagnoses': 'Matriz de nanosensores para diagnósticos médicos',
    'electroactive material for wound healing': 'Material electroactivo para la cicatrización de heridas',
    '3d construction of biologically derived materials': 'Construcción 3D de materiales de origen biológico',
    'filtering molecules with nanotube technology': 'Filtrado de moléculas con tecnología de nanotubos',
    'noninvasive therapy for cartilage regeneration': 'Terapia no invasiva para la regeneración del cartílago',
    'superelastic tire': 'Neumático superelástico',
    'full-size reduced gravity simulator for humans, robots, and test objects': 'Simulador de gravedad reducida a escala real para humanos, robots y objetos de prueba',
    'spacecube v2.0 processor with ddr2 memory upgrade': 'Procesador SpaceCube v2.0 con actualización de memoria DDR2',
    'portable medical diagnosis instrument': 'Instrumento portátil de diagnóstico médico',
    'fabricating printable electronics and biosensor chips': 'Fabricación de electrónica imprimible y chips biosensores',
    'robonaut 2: industrial opportunities': 'Robonaut 2: oportunidades industriales',
    'modular artificial-gravity orbital refinery spacecraft': 'Nave espacial modular de refinería orbital con gravedad artificial',
    'feedthrough for severe environments and temperatures': 'Pasamuros para entornos y temperaturas extremas',
    'aerofoam': 'Aerofoam',
    'aerogel reinforced composites': 'Compuestos reforzados con aerogel',
    'multi-layered self-healing material system for impact mitigation': 'Sistema multicapa de material autorreparable para mitigación de impactos',
    'how to train shape memory alloys': 'Cómo entrenar aleaciones con memoria de forma',
    'multilayered fire protection system': 'Sistema multicapa de protección contra incendios',
    'self-cleaning coatings for space or earth': 'Recubrimientos autolimpiables para el espacio o la Tierra',
    'retroreflective temperature- and pressure-sensitive paints': 'Pinturas retrorreflectantes sensibles a la temperatura y la presión',
    'high-efficiency solar cell': 'Célula solar de alta eficiencia',
    'lunar surface navigation system': 'Sistema de navegación para la superficie lunar'
  };

  transform(value: string): string {
    if (!value) {
      return value;
    }

    return this.dictionary[value.toLowerCase()] ?? value;
  }
}
