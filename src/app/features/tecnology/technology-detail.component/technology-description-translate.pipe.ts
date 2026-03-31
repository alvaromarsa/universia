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
      'Calorímetro de iones de litio de nueva generación diseñado para medir con gran precisión el calor generado durante ciclos de carga y descarga de baterías. Permite detectar reacciones térmicas peligrosas en etapas tempranas, mejorando la seguridad y el rendimiento de los sistemas de almacenamiento de energía.',
    'MSC-TOPS-85':
      'Exoesqueleto robótico ligero para el tren superior del cuerpo que amplifica la fuerza del portador y reduce la fatiga muscular en tareas de manipulación repetitiva o de alta carga. Desarrollado originalmente para astronautas, tiene aplicaciones directas en rehabilitación médica e industria manufacturera.',
    'TOP2-106':
      'Sistema avanzado de tratamiento de aguas contaminadas que combina filtración por membrana, adsorción en carbón activado y desinfección fotocatalítica. Capaz de eliminar metales pesados, microcontaminantes orgánicos y patógenos en un proceso compacto y de bajo consumo energético.',
    'GSC-TOPS-223':
      'Técnica de interferometría que utiliza formación digital de haces para obtener imágenes de alta resolución de la superficie terrestre desde satélites. La ausencia de sistemas mecánicos móviles incrementa la fiabilidad y permite reconfiguraciones del patrón de observación en tiempo real.',
    'TOP2-169':
      'Plataforma de sensores basada en nanomateriales capaz de analizar el aliento humano y detectar patrones de compuestos orgánicos volátiles (COV) asociados a enfermedades metabólicas, pulmonares u oncológicas, ofreciendo un método de diagnóstico no invasivo, rápido y de bajo coste.',
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
      'Dispositivo portátil de diagnóstico médico que integra múltiples técnicas analíticas —espectroscopía óptica, biosensores electroquímicos y microfluídica— en un instrumento de mano. Capaz de detectar biomarcadores de enfermedades infecciosas o crónicas a partir de una gota de sangre en menos de diez minutos.',
    'TOP2-246':
      'Proceso de fabricación por impresión inkjet de componentes electrónicos funcionales —semiconductores orgánicos, electrodos y chips biosensores— sobre sustratos flexibles. Reduce el coste de producción y permite crear dispositivos electrónicos desechables para monitorización de salud y diagnóstico de campo.',
    'TOP2-218':
      'Robonaut 2 (R2) es el robot humanoide más avanzado enviado al espacio. Sus manos dextrosas y sus algoritmos de control de fuerza le permiten manejar herramientas diseñadas para humanos. Esta tecnología transfiere las capacidades del robot al sector industrial para automatizar tareas peligrosas o de precisión en fábricas y hospitales.',
    'MSC-TOPS-47':
      'Concepto de nave espacial modular que genera gravedad artificial mediante rotación y actúa como refinería orbital, procesando recursos extraídos de asteroides o la Luna. Su arquitectura modular permite escalar la capacidad de producción y sirve de base para la economía espacial del futuro.',
    'TOP2-299':
      'Conectores herméticos y sellados de alta integridad para el paso de cables eléctricos y ópticos a través de paredes sometidas a entornos extremos: vacío, radiación, criogenia o altas temperaturas. Esenciales en sistemas de propulsión, reactores nucleares y equipos aeroespaciales de misión crítica.',
    'KSC-TOPS-33':
      'Material compuesto de matriz de aerogel reforzado con fibras de carbono o vidrio que combina la excepcional capacidad de aislamiento térmico del aerogel con la resistencia mecánica de los composites. Aplicable en aislamiento criogénico de depósitos de combustible de cohetes y en edificación energéticamente eficiente.',
    'LEW-TOPS-141':
      'Sistema de material estructural multicapa con microencapsulación de agentes curantes que detecta y repara automáticamente fisuras o perforaciones causadas por micrometeorito o impactos de alta velocidad. Prolonga la vida útil de estructuras aeroespaciales y reduce los costes de mantenimiento.',
    'LAR-TOPS-122':
      'Metodología de entrenamiento termomecánico para aleaciones con memoria de forma (SMA) que permite programar de forma reproducible ciclos de transformación de fase específicos. Mejora la repetibilidad y la vida en ciclos de actuadores SMA para aplicaciones aeroespaciales, biomédicas e industriales.',
    'LEW-TOPS-32':
      'Sistema de protección pasiva contra incendios formado por múltiples capas de materiales con diferentes funciones: barrera intumescente, capa ablativa y cubierta estructural. Proporciona tiempos de resistencia al fuego superiores con menor peso,. Diseñado para aeronaves y vehículos de lanzamiento.',
    'LAR-TOPS-212':
      'Recubrimientos nanoestructurados superhidrófobos y fotocatalíticos que repelen agua, polvo y agentes contaminantes y se autorregulan bajo luz ultravioleta. Mantienen superficies de paneles solares, ventanas de naves y estructuras exteriores limpias en entornos espaciales y terrestres hostiles.',
    'KSC-TOPS-99':
      'Pinturas sensibles a la presión y la temperatura que incorporan marcadores retrorreflectantes medibles por sistemas de visión remota. Permiten mapear distribuciones de presión y temperatura en superficies aerodinámicas durante pruebas en túnel de viento o vuelo real sin instrumentar físicamente cada punto.',
    'LAR-TOPS-402':
      'Célula solar de múltiple unión con capas semiconductoras de gap óptico escalonado que absorben distintas partes del espectro solar, alcanzando eficiencias de conversión superiores al 35 %. Diseñada para satélites y misiones en el espacio profundo donde la densidad de potencia es crítica.',
    'LEW-TOPS-50':
      'Sistema de navegación autónoma para la superficie lunar que fusiona datos de LIDAR, cámaras estéreo y acelerómetros con mapas de elevación digital para proporcionar localización precisa sin depender de señales GPS. Permite que rovers y astronautas naveguen de forma segura en regiones de sombra permanente o terreno irregular.',
    'LAR-TOPS-361':
      'Tecnología avanzada desarrollada por la NASA que combina materiales inteligentes y sistemas de control activo para mejorar el rendimiento estructural y aerodinámico en aplicaciones espaciales y aeronáuticas de próxima generación.',
  };

  transform(description: string, id?: string): string {
    if (id && this.dictionary[id]) {
      return this.dictionary[id];
    }
    return description;
  }
}
