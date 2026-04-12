import { AreaSistema } from './area.model';
import { RolSistema } from './rol.model';

export interface UsuarioSistema {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  correo: string;
  areaId?: number;
  area?: AreaSistema;
  rolId?: number;
  rol?: RolSistema;
  ultimoLogin?: string;
  intentosFallo?: number;
  bloqueoHasta?: string;
  activo: boolean;
}
