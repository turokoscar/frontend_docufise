export interface RolSistema {
  id: number;
  nombre: string;
  descripcion: string;
  nivelPermiso: number;
  activo: boolean;
  menus?: any[];
  menuIds?: number[];
}
