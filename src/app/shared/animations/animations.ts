import { animate, query, style, transition, trigger, group } from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    // Transición especial de HOME a PLANETS (El viaje al interior)
    transition('HomePage => PlanetsPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        })
      ]),
      group([
        // La Galaxia se hace gigante y desaparece (Efecto entrar en ella)
        query(':leave', [
          animate('1000ms ease-in', style({
            opacity: 0,
            transform: 'scale(5)' // <--- ¡Zoom hacia adentro!
          }))
        ]),
        // El Sistema Solar aparece suavemente desde el centro
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.5)' }),
          animate('1000ms 200ms ease-out', style({
            opacity: 1,
            transform: 'scale(1)'
          }))
        ])
      ])
    ]),

    // --- VIAJE DE VUELTA (Hacia afuera) ---
    transition('PlanetsPage => HomePage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh' })
      ]),
      group([
        // El sistema solar se aleja y se hace pequeñito
        query(':leave', [
          animate('1000ms ease-in', style({ opacity: 0, transform: 'scale(0.2)' }))
        ]),
        // La galaxia aparece siendo gigante y vuelve a su tamaño normal
        query(':enter', [
          style({ opacity: 0, transform: 'scale(3)' }),
          animate('1000ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
        ])
      ])
    ]),

    // Transición de PLANETS a PLANET DETAIL - coexistencia de componentes
    transition('PlanetsPage => PlanetDetailPage', [
      style({ position: 'relative' }),
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        })
      ], { optional: true }),
      group([
        // El componente que sale (planet) permanece visible y luego se desvanece MUY lentamente
        query(':leave', [
          style({ opacity: 1, zIndex: 1 }),
          animate('3000ms 500ms ease-out', style({ opacity: 0 }))
        ], { optional: true }),
        // El componente que entra (planet-detail) aparece inmediatamente ENCIMA
        query(':enter', [
          style({ opacity: 1, zIndex: 2 })
        ], { optional: true })
      ])
    ]),

    // Transición de PLANET DETAIL a PLANETS (volver atrás)
    transition('PlanetDetailPage => PlanetsPage', [
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        })
      ], { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ opacity: 0 }))
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 }),
          animate('300ms ease-in', style({ opacity: 1 }))
        ], { optional: true })
      ])
    ]),

    transition('* <=> *', [ // Esto significa: "de cualquier ruta a cualquier ruta"
      query(':enter, :leave', [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%'
        })
      ], { optional: true }),
      group([
        query(':leave', [
          animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-20px)' }))
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(20px)' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
        ], { optional: true })
      ])
    ])
  ]);
