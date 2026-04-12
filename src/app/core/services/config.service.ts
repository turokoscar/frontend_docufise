import { Injectable, APP_INITIALIZER } from '@angular/core';

export interface AppConfig {
  apiUrl: string;
  production: boolean;
  appTitle: string;
  version: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: AppConfig | null = null;

  loadConfig(): AppConfig {
    const config = (window as any)['__APP_CONFIG__'];
    if (!config) {
      console.warn('Configuración runtime no encontrada, usando valores por defecto');
      return {
        apiUrl: 'http://localhost:8080/api/v1',
        production: false,
        appTitle: 'DocuFISE',
        version: '1.0.0'
      };
    }
    return config;
  }

  get<T = string>(key: keyof AppConfig): T {
    if (!this.config) {
      this.config = this.loadConfig();
    }
    return this.config[key] as T;
  }

  getApiUrl(): string {
    return this.get('apiUrl');
  }

  isProduction(): boolean {
    return this.get('production');
  }
}

export function initializeConfig(configService: ConfigService) {
  return () => {
    configService.loadConfig();
    return Promise.resolve();
  };
}

export const configProvider = {
  provide: APP_INITIALIZER,
  useFactory: initializeConfig,
  deps: [ConfigService],
  multi: true
};
