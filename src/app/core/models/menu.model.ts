export interface MenuSistema {
  id: number;
  nombre: string;
  ruta: string;
  icono: string;
  orden: number;
  activo: boolean;
  permiso?: string;
}
