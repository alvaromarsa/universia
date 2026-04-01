import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'technologyDescriptionTranslate',
  standalone: true
})
export class TechnologyDescriptionTranslatePipe implements PipeTransform {
  private readonly dictionary: Record<string, string> = {
    'MSC-TOPS-90':
      'Esta tecnología propone una nave espacial autónoma capaz de identificar y retirar residuos orbitales —satélites inactivos, etapas de cohetes y fragmentos de colisiones— para limpiar las órbitas más concurridas y garantizar la sostenibilidad a largo plazo de las operaciones espaciales.',
    'DRC-TOPS-36':
      'Un innovador diseño aerodinámico de ala que redistribuye las cargas de sustentación a lo largo del envergadura, reduciendo la resistencia inducida y los vórtices de punta de ala, lo que se traduce en un ahorro de combustible significativo y una mayor eficiencia en cualquier régimen de vuelo.',
    'LAR-TOPS-369':
      'Interfaz directa entre el cerebro humano y sistemas de visualización digital. Mediante sensores no invasivos que capturan señales electrofisiológicas, el usuario puede navegar y controlar interfaces gráficas sin necesidad de dispositivos físicos, abriendo nuevas posibilidades para la accesibilidad y el control de vehículos espaciales.',
    'MSC-TOPS-74':
      'Vehículo eléctrico de arquitectura by-wire desarrollado por la NASA Johnson Space Center junto a un socio del sector automovilístico. El MRV integra propulsión, dirección y freno totalmente electrónicos, una arquitectura redundante para operación segura y cuatro módulos de rueda independientes capaces de girar hasta 180 grados, lo que permite maniobras extremas como desplazarse lateralmente para aparcar en espacios reducidos.',
    'MSC-TOPS-85':
      'Exoesqueleto robótico ligero para el tren superior del cuerpo que amplifica la fuerza del portador y reduce la fatiga muscular en tareas de manipulación repetitiva o de alta carga. Desarrollado originalmente para astronautas, tiene aplicaciones directas en rehabilitación médica e industria manufacturera.',
    'TOP2-106':
      'Sistema avanzado de tratamiento de aguas contaminadas que combina filtración por membrana, adsorción en carbón activado y desinfección fotocatalítica. Capaz de eliminar metales pesados, microcontaminantes orgánicos y patógenos en un proceso compacto y de bajo consumo energético.',
    'GSC-TOPS-223':
      'DONKI es una base de datos para meteorología espacial que centraliza eventos observados, avisos y relaciones de causa-efecto entre fenómenos solares y geoespaciales. Sustituye registros dispersos y difíciles de buscar por una plataforma estructurada útil para investigadores y pronosticadores del clima espacial.',
    'TOP2-169':
      'Chip de nanosensores químicos sobre silicio combinado con sensores de humedad, temperatura y presión/flujo para analizar el aliento humano en tiempo real. Permite diagnósticos médicos no invasivos, de bajo coste y alta sensibilidad, con capacidad de medir concentraciones desde partes por millón hasta partes por mil millones.',
    'LAR-TOPS-194':
      'Material polimérico electroactivo que, al aplicar una corriente eléctrica de baja intensidad, acelera la proliferación celular y la regeneración del tejido en heridas crónicas. Biodegradable y biocompatible, puede integrarse en apósitos inteligentes para uso clínico.',
    'TOP2-256':
      'Proceso de bioimpresión 3D que utiliza materiales de origen biológico —como hidrogeles cargados de células o biopolímeros de origen marino— para construir estructuras tridimensionales complejas. Permite fabricar andamios tisulares personalizados para ingeniería de tejidos y medicina regenerativa.',
    'MSC-TOPS-29':
      'Membrana de nanotubos de carbono de poro ultrafino capaz de filtrar selectivamente moléculas por tamaño y carga eléctrica. Su extraordinaria relación superficie-volumen la hace idónea para desalinización de agua, separación de gases industriales y administración controlada de fármacos.',
    'MSC-TOPS-96':
      'Terapia ultrasónica focalizada de baja intensidad que estimula condrocitos y células madre mesenquimales para regenerar el cartílago articular dañado. Su naturaleza no invasiva elimina los riesgos asociados a la cirugía, con aplicaciones en el tratamiento de la osteoartritis y lesiones deportivas.',
    'LEW-TOPS-99':
      'Neumático fabricado con una aleación de níquel-titanio superelástica que mantiene su forma bajo cargas elevadas y recupera su geometría original sin deformación permanente. Diseñado para rovers planetarios, su durabilidad y resistencia a temperaturas extremas lo hacen idóneo también para vehículos terrestres de alto rendimiento.',
    'MSC-TOPS-60':
      'Instalación de simulación de gravedad reducida a escala real que combina suspensión activa, plataformas de flotación sobre aire y sistemas de contrapeso para reproducir entornos de microgravedad o gravedad lunar y marciana. Utilizada para entrenar astronautas y probar robots y equipos antes de misiones espaciales.',
    'GSC-TOPS-243':
      'Actualización del procesador SpaceCube v2.0 con memoria DDR2 para sustituir memorias DDR ya obsoletas y aumentar el ancho de banda disponible para instrumentos científicos de nueva generación. La mejora duplica aproximadamente la velocidad de acceso frente al diseño DDR1 y permite procesamiento a bordo de volúmenes mucho mayores de datos.',
    'TOP2-246':
      'Instrumento portátil de diagnóstico médico conocido como NASA Analyzer, concebido para misiones de larga duración. Integra cuatro tecnologías en un dispositivo compacto capaz de analizar aliento, saliva y pequeñas muestras de sangre para medir múltiples analitos, combinando muestreo no invasivo y mínimamente invasivo con conectividad inalámbrica.',
    'TOP2-218':
      'Proceso de fabricación de electrónica imprimible y chips biosensores mediante deposición con plasma atmosférico y aerosol a temperatura ambiente. Permite imprimir y patronar materiales funcionales de forma escalable, económica y compatible con múltiples sustratos, facilitando la producción industrial de dispositivos electrónicos y recubrimientos avanzados.',
    'MSC-TOPS-47':
      'Robonaut 2 es un robot humanoide altamente diestro desarrollado por NASA Johnson junto con General Motors y Oceaneering. Sus tecnologías patentadas permiten automatizar tareas industriales ergonómicamente difíciles, repetitivas o peligrosas, con gran flexibilidad para trabajar con herramientas y procesos pensados originalmente para operarios humanos.',
    'TOP2-299':
      'Concepto de nave espacial modular para refinar o reciclar materiales en órbita y generar gravedad artificial mediante procesos centrífugos. Está pensada para aprovechar recursos de asteroides, lunas marcianas o desechos espaciales, resolviendo los retos de operar procesos industriales que necesitan gravedad en entornos de microgravedad.',
    'KSC-TOPS-33':
      'Aerofoam es una espuma compuesta aislante con mejores propiedades térmicas y acústicas. Combina una espuma polimérica con un relleno inorgánico singular para maximizar el rendimiento térmico sin perder resistencia mecánica, resistencia química, comportamiento frente al fuego y capacidad de aislamiento acústico.',
    'LEW-TOPS-141':
      'Método para fabricar compuestos flexibles de aerogel de baja densidad destinados a aislamiento térmico en aplicaciones muy exigentes. Soportan temperaturas de hasta 1200 grados Celsius y mejoran la eficiencia térmica, el peso y la densidad frente a soluciones convencionales de aislamiento con aerogel.',
    'LAR-TOPS-122':
      'Sistema multicapa autorreparable para mitigar impactos balísticos o hiperveloces, como micrometeoritos o basura orbital. Se construye encapsulando una formulación líquida reactiva entre paneles poliméricos sólidos, de modo que el material puede reaccionar ante daños y extender la protección estructural en aplicaciones espaciales e industriales.',
    'LEW-TOPS-32':
      'Método desarrollado por la NASA Glenn para entrenar aleaciones con memoria de forma mediante ciclos mecánicos en lugar de ciclos térmicos complejos. Reduce tiempo y coste de preparación, y además facilita aplicar estas aleaciones a geometrías más complejas para actuadores y sistemas inteligentes.',
    'LAR-TOPS-212':
      'Sistema flexible, ligero y portátil de protección térmica frente al fuego, basado en mantas térmicas multicapa capaces de soportar temperaturas externas de hasta 2000 grados Fahrenheit. Puede adoptar forma de manta, tienda, cortina, barrera o envolvente para proteger personas, instalaciones y equipos frente a fuentes intensas de calor.',
    'KSC-TOPS-99':
      'Recubrimiento transparente autolimpiante basado en escudos electrodinámicos contra el polvo. Emplea electrodos y una capa protectora de sílice para retirar partículas cargadas con la mitad de voltaje y un espesor mucho menor que soluciones previas, lo que facilita su integración en celdas solares y otras superficies transparentes.',
    'LAR-TOPS-402':
      'Pinturas sensibles a presión y temperatura mejoradas con propiedades retrorreflectantes para combinar mediciones sobre la superficie con visualización schlieren del flujo desde un único acceso óptico. Mejoran la claridad óptica y la flexibilidad experimental en ensayos aerodinámicos avanzados.',
    'LEW-TOPS-50':
      'Célula solar de alta eficiencia y múltiples uniones que utiliza una fina capa intermedia de selenio como material de unión entre obleas. Esto permite combinar una célula superior multijunción con una base de silicio más robusta y económica, logrando una solución más eficiente, resistente y barata para aplicaciones espaciales y terrestres.',
    'LAR-TOPS-361':
      'Sistema de navegación para la superficie lunar basado en la técnica de efemérides inversas. En lugar de localizar satélites desde la Tierra, utiliza la órbita conocida de pequeños satélites lunares para obtener posiciones sobre la superficie, proporcionando una solución precisa y de bajo coste para rovers, minería y exploración humana.',
  };

  transform(description: string, id?: string): string {
    if (id && this.dictionary[id]) {
      return this.dictionary[id];
    }
    return description;
  }
}
