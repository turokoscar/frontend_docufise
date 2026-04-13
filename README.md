# DOCUFISE - Frontend

Sistema Integrado de Gestión de Expedientes y Firmas (SIGEF) - Frontend construido con Angular 18+.

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| Angular | 18.x | Framework principal |
| TypeScript | 5.x | Lenguaje tipado |
| Tailwind CSS | 3.x | Framework de estilos |
| Angular Signals | 18.x | Estado reactivo |
| NG Icons | - | Sistema de iconos |
| SweetAlert2 | - | Alertas y confirmaciones |
| XLSX | - | Exportación a Excel |

## Requisitos

- **Node.js** 18.x o superior
- **npm** 9.x o superior (o pnpm/yarn)
- **Angular CLI** 18.x

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configuración del entorno

El archivo de configuración se encuentra en:

```
src/environments/
├── environment.ts        # Desarrollo
└── environment.prod.ts  # Producción
```

Para desarrollo local, crear `config.js` en `public/assets/config/`:

```javascript
window.__ENV__ = {
  apiUrl: 'http://localhost:8080/api/v1'
};
```

## Ejecución

### Desarrollo

```bash
npm start
# o
ng serve
```

Navegar a `http://localhost:4200/`. La aplicación recargará automáticamente al cambiar archivos.

### Producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/`.

## Estructura del Proyecto

```
frontend_docufise/
├── src/
│   ├── app/
│   │   ├── core/                    # Módulo central
│   │   │   ├── constants/           # Constantes globales
│   │   │   ├── guards/              # Guards de rutas
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── models/             # Interfaces/Modelos TypeScript
│   │   │   └── services/            # Servicios singletons
│   │   │
│   │   ├── pages/                  # Páginas/Módulos principales
│   │   │   ├── admin/              # Módulos administrativos
│   │   │   │   ├── areas/
│   │   │   │   ├── menus/
│   │   │   │   ├── roles/
│   │   │   │   └── usuarios/
│   │   │   ├── expedientes/         # Gestión de expedientes
│   │   │   ├── firmas/             # Firmas digitales
│   │   │   ├── reportes/           # Reportes
│   │   │   └── auth/               # Autenticación
│   │   │
│   │   └── shared/                 # Módulo compartido
│   │       └── components/         # Componentes reutilizables
│   │           └── ui/             # Biblioteca de componentes UI
│   │               ├── button/
│   │               ├── modal/
│   │               ├── table/
│   │               ├── input/
│   │               ├── select/
│   │               ├── badge/
│   │               ├── dropdown/
│   │               ├── kpi-card/
│   │               ├── page-header/
│   │               ├── section-label/
│   │               └── filter-panel/
│   │
│   ├── assets/                     # Recursos estáticos
│   └── styles/                     # Estilos globales
│       └── styles.css
│
├── angular.json                    # Configuración de Angular CLI
├── tailwind.config.js              # Configuración de Tailwind
└── tsconfig.json                   # Configuración de TypeScript
```

## Patrones y Convenciones

### Componentes

Los componentes siguen la estructura de **standalone components** de Angular:

```
mi-componente/
├── mi-componente.component.ts      # Lógica
├── mi-componente.component.html    # Template
└── mi-componente.component.css     # Estilos (opcional)
```

### Formularios

- Usar **Angular Signals** para estado reactivo
- Usar **model()** para two-way binding en formularios
- Usar **@if** para control de flujo en templates

```typescript
// Ejemplo de formulario con model()
export class MiFormComponent {
  nombre = model('');
  email = model('');

  guardar(): void {
    // lógica
  }
}
```

```html
<!-- Template -->
<app-ui-input [(ngModel)]="nombre" label="Nombre"></app-ui-input>
<app-ui-button (onClick)="guardar()">Guardar</app-ui-button>
```

### Componentes Reutilizables UI

La biblioteca de componentes está en `shared/components/ui/`:

| Componente | Selector | Props |
|------------|----------|-------|
| Botón | `app-ui-button` | `variant`, `size`, `loading`, `disabled` |
| Modal | `app-ui-modal` | `isOpen`, `maxWidth`, `onClose` |
| Tabla | `app-ui-table` | Slots: `headers`, `rows`, `footer` |
| Input | `app-ui-input` | `label`, `value`, `onValueChange` |
| Select | `app-ui-select` | `label`, `value`, `onValueChange` |
| Badge | `app-ui-badge` | `variant` |

### Estados de Componentes

Usar **signals** para estado:

```typescript
// Estado simple
loading = signal(false);

// Estado derivado
totalPages = computed(() => Math.ceil(this.items().length / this.pageSize()));

// Efectos
effect(() => {
  console.log('Estado cambió:', this.someSignal());
});
```

## Comandos Útiles

```bash
# Servidor de desarrollo
npm start

# Build de producción
npm run build

# Build con análisis
npm run build -- --source-map

# Tests unitarios
npm test

# Tests e2e
ng e2e

# Linting
npm run lint

# Formateo de código
npm run format

# Generar componente
ng generate component pages/mi-pagina

# Generar servicio
ng generate service core/services/mi-servicio

# Generar interface
ng generate interface core/models/mi-modelo
```

## Variantes de Botones

| Variant | Uso |
|---------|-----|
| `primary` | Acciones principales (azul #2C5AAB) |
| `secondary` | Acciones secundarias (cyan #0FAEBF) |
| `outline` | Botones con borde |
| `ghost` | Botones transparentes |
| `destructive` | Acciones destructivas (rojo #AB2741) |
| `warning` | Acciones de advertencia (amarillo #F59E0B) |
| `white` | Botones sobre fondos oscuros |

## Integración con Backend

### Configuración de API

La URL del API se configura en tiempo de ejecución mediante `public/assets/config/config.js`.

### Interceptores

- **Request Interceptor**: Agrega headers de autenticación (JWT)
- **Response Interceptor**: Desenvuelve respuestas estandarizadas `{ exitoso: true, datos: ... }`

### Manejo de Errores

```typescript
this.apiService.getData().subscribe({
  next: (data) => this.data.set(data),
  error: (err) => {
    console.error('Error:', err);
    Swal.fire({ icon: 'error', title: 'Error', text: err.message });
  }
});
```

## Lazy Loading

Los módulos se cargan de forma lazy para optimizar el bundle:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'expedientes',
    loadComponent: () => import('./pages/expedientes/expedientes.page')
      .then(m => m.ExpedientesPage)
  }
];
```

## Despliegue en Apache Tomcat 9.0

Angular genera archivos estáticos (HTML, CSS, JS) que pueden servirse desde cualquier servidor web, incluyendo Apache Tomcat.

### 1. Build de Producción

```bash
npm run build
```

Esto genera los archivos en `dist/frontend_docufise/`.

### 2. Configurar Base HREF

Si la aplicación se accederá desde un path como `http://servidor/docufise/`, configurar el base href:

```bash
# En package.json o directamente
ng build --base-href /docufise/
```

O editar `angular.json`:

```json
{
  "projects": {
    "frontend-docufise": {
      "architect": {
        "build": {
          "options": {
            "baseHref": "/docufise/"
          }
        }
      }
    }
  }
}
```

### 3. Configurar Rutas (base href y deploy url)

En `angular.json`, ajustar `deployUrl`:

```json
{
  "projects": {
    "frontend-docufise": {
      "architect": {
        "build": {
          "options": {
            "baseHref": "/docufise/",
            "deployUrl": "/docufise/"
          }
        }
      }
    }
  }
}
```

### 4. Configurar API URL para Producción

Editar `public/assets/config/config.js` con la URL del backend:

```javascript
window.__ENV__ = {
  apiUrl: 'http://192.168.1.100:8080/api/v1'
};
```

### 5. Deploy en Tomcat

Copiar el contenido de `dist/` a la carpeta webapps de Tomcat:

```bash
# Crear carpeta en Tomcat
mkdir -p $CATALINA_HOME/webapps/docufise

# Copiar archivos
cp -r dist/frontend_docufise/* $CATALINA_HOME/webapps/docufise/

# O crear un WAR
cd dist
jar -cvf ../docufise.war *
cp ../docufise.war $CATALINA_HOME/webapps/
```

### 6. Configurar context.xml

En `$CATALINA_HOME/conf/context.xml`, agregar:

```xml
<Context path="/docufise" docBase="docufise" reloadable="true">
  <WatchedResource>WEB-INF/web.xml</WatchedResource>
</Context>
```

### 7. Configurar server.xml (Virtual Host)

En `$CATALINA_HOME/conf/server.xml`, agregar dentro de `<Host>`:

```xml
<Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="true">
  <!-- Aplicación principal -->
  <Context path="" docBase="ROOT" reloadable="true"/>
  
  <!-- DOCUFISE Frontend -->
  <Context path="/docufise" docBase="/var/lib/tomcat9/webapps/docufise" reloadable="true"/>
  
  <!-- DOCUFISE Backend (API) -->
  <Context path="/api" docBase="/opt/docufise/backend/docufise.jar" reloadable="true"/>
</Host>
```

### 8. Configurar Apache como Reverse Proxy (Opcional)

Si se usa Apache frente a Tomcat, configurar `httpd.conf` o crear archivo en `conf.d/`:

```apache
# Proxy para Backend API
ProxyPreserveHost On
ProxyPass /api/ http://localhost:8080/api/
ProxyPassReverse /api/ http://localhost:8080/api/

# Proxy para Frontend Angular
ProxyPass /docufise/ http://localhost:8080/docufise/
ProxyPassReverse /docufise/ http://localhost:8080/docufise/

# Headers de seguridad
<Location "/api/">
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</Location>
```

### 9. Configurar CORS en Backend

El backend debe permitir peticiones desde el frontend:

```properties
# application.properties
spring.web.cors.allowed-origins=http://localhost:4200,http://192.168.1.100:80,http://servidor.dominio.com
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 10. Verificación

```bash
# Verificar frontend
curl http://localhost:8080/docufise/

# Verificar API
curl http://localhost:8080/api/v1/auth/login

# Verificar health check
curl http://localhost:8080/api/v1/actuator/health
```

### Estructura Final

```
/opt/docufise/
├── backend/
│   ├── docufise.jar
│   └── config/
│       └── application-prod.properties
├── frontend/
│   └── dist/
│       └── (archivos Angular compilados)
└── tomcat/
    └── webapps/
        ├── ROOT/ (frontend en raíz)
        ├── docufise.war (frontend en /docufise)
        └── api/ (symlink o proxy al backend)
```

### Troubleshooting

**Error 404 en rutas de Angular:**
- Verificar que `baseHref` coincida con el path en Tomcat
- Asegurar que `deployUrl` esté configurado correctamente

**Error CORS:**
- Verificar que el backend tenga CORS configurado con los orígenes correctos
- Confirmar que las credenciales y headers están permitidos

**Assets no cargan:**
- Verificar que `public/assets/config/config.js` existe y tiene la URL correcta del API
- Comprobar que los paths en los archivos JS compilados son correctos

## Contribución

1. Crear branch: `git checkout -b feature/mi-feature`
2. Commit cambios: `git commit -m 'feat: descripción'`
3. Push: `git push origin feature/mi-feature`
4. Crear Pull Request

### Conventional Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formateo (sin cambio de lógica)
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Mantenimiento

## Recursos

- [Documentación Angular](https://angular.dev)
- [Angular Signals](https://angular.dev/guide/signals)
- [Tailwind CSS](https://tailwindcss.com)
- [NG Icons](https://ng-icons.github.io)

## Licencia

Propiedad de FISE - Todos los derechos reservados.
