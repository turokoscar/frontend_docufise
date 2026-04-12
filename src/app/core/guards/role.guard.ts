import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../constants/roles.constants';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.user();
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[] | undefined;
  
  // If no roles specified, allow access (or check against data.requiredRole)
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  const userRol = String(user.rol).toUpperCase();
  const adminRole = ROLES.ADMIN.toUpperCase();

  const hasAccess = requiredRoles.some(role => 
    userRol === role.toUpperCase() || userRol === adminRole
  );

  if (!hasAccess) {
    // Redirect to default page based on role
    const defaultRoute = authService.getDefaultRoute();
    router.navigate([defaultRoute]);
    return false;
  }

  return true;
};

// Helper function for routes that should be hidden based on role
export const hasRoleAccess = (userRole: string, allowedRoles: string[]): boolean => {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  const upperUserRole = userRole.toUpperCase();
  const adminRole = ROLES.ADMIN.toUpperCase();
  
  // Administrador has access to everything
  if (upperUserRole === adminRole) {
    return true;
  }
  
  return allowedRoles.some(role => upperUserRole === role.toUpperCase());
};