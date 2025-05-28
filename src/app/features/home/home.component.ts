import { Component, signal, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; 
import { PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Benefit {
  text: string;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  private platformId = inject(PLATFORM_ID);
  router = inject(Router)

  features = signal<Feature[]>([
    {
      icon: 'assets/icons/feature1.svg',
      title: 'Analytica Avanzados',
      description: 'Obtén insights profundos sobre el rendimiento de tu equipo con métricas detalladas, tasas de finalización y análisis de flujo de trabajo..'
    },
    {
      icon: 'assets/icons/feature2.svg',
      title: 'Insights con IA',
      description: 'Aprovecha la inteligencia artificial para identificar cuellos de botella, sugerir mejoras en el flujo de trabajo y priorizar tareas automáticamente.'
    },
    {
      icon: 'assets/icons/feature3.svg',
      title: 'Visualización Mejorada',
      description: 'nterfaz hermosa y responsiva con funcionalidad drag-and-drop y actualizaciones en tiempo real para mejor visibilidad del proyecto.'
    }
  ]);

  testimonials = signal<Testimonial[]>([
    {
      name: 'John Doe',
      role: 'CEO',
      company: 'Example Corp',
      content: 'This is an amazing product! It has transformed the way we work.',
      rating: 5 // Example rating
    }]);

    benefits = signal<Benefit[]>([
    { text: 'Valor agregado a tu planificación' },
    { text: 'Agilización de procesos' }, ]);
    
  selectTestimonial(testimonial: Testimonial) {
    console.log('Selected testimonial:', testimonial);
  }

  getStars(rating: number): string[] {
    return Array(rating).fill('★'); // Returns an array of stars based on the rating
  }

  getInitials(name: string): string {
    const parts = name.split(' ');  
    return parts.map(part => part.charAt(0).toUpperCase()).join(''); 
  }

  selectFeature(feature: Feature) {
    console.log('Selected feature:', feature);
  }

  

  connectTrelloNow() {
    this.router.navigate(["/login"]);
  }

  userCount(): number {
    return 1000; // Example user count
  }

  startFreeWithTrello() {
    console.log('ok');
  } 

  startWithTrello() {
    console.log('ok');
  }

  toggleMenu() {
    if (isPlatformBrowser(this.platformId)) {
      const menu = document.querySelector('.menu');
      if (menu) {
        menu.classList.toggle('hidden');
      }
    }
  }

  isMenuOpen(): boolean {
    if (isPlatformBrowser(this.platformId)) { 
      const menu = document.querySelector('.menu');
      return menu ? !menu.classList.contains('hidden') : false;
    }
    return false; // Default to false if not in browser context
  }

  beginWithTrello() {
    console.log('Begin with Trello');
  }

  showDemo() {
    console.log('Show demo');
  }

}
