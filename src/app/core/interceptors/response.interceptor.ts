import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { map, catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const responseInterceptor: HttpInterceptorFn = (req, next) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        // Skip unwrapping for blob responses (downloads)
        if (event.body instanceof Blob) {
          return event;
        }
        
        const body = event.body as any;
        // Check if the response follows the ApiResponse structure
        if (body && typeof body === 'object' && 'exitoso' in body) {
          if (!body.exitoso) {
            Toast.fire({
              icon: 'error',
              title: body.mensaje || 'Ha ocurrido un error'
            });
            throw new Error(body.mensaje);
          }
          
          // Show success toast for destructive operations if message exists
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && body.mensaje) {
             Toast.fire({
               icon: 'success',
               title: body.mensaje
             });
          }

          // Unwrap and return only data
          return event.clone({ body: body.datos });
        }
      }
      return event;
    }),
    catchError((error: HttpErrorResponse) => {
      // Don't show toast for 401 as authInterceptor handles it
      if (error.status !== 401) {
        Toast.fire({
          icon: 'error',
          title: error.error?.mensaje || error.message || 'Error de conexión'
        });
      }
      return throwError(() => error);
    })
  );
};
