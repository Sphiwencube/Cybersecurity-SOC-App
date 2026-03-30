import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/interceptors/jwt.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { cacheInterceptor } from './app/interceptors/cache.interceptor'; // NEW

bootstrapApplication(AppComponent, {
  providers: [
    // UPDATED: Add preloading strategy for lazy-loaded modules
    provideRouter(routes, withPreloading(PreloadAllModules)),
    
    // UPDATED: Add cache interceptor to existing interceptors
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor, cacheInterceptor])
    )
  ]
}).catch(err => console.error(err));