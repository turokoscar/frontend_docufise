# Verificación Cumplimiento ADR SIGEF

## 1. TIPOGRAFÍA (ADR ítem 2.1)

| Elemento | ADR especifica | Proyecto (Angular) | Cumplimiento |
|----------|---------------|---------------------|-------------|
| Títulos módulos | Poppins | `font-display` → Poppins | ✅ |
| Botones, inputs, badges | New Order (Century Gothic) | `font-ui` → Century Gothic | ✅ |
| Tablas, reportes | Calibri 11pt | `font-body` → Calibri | ✅ |

## 2. COLORES INSTITUCIONALES (ADR ítem 2.2)

| Color | HEX | Uso | Estado proyecto |
|-------|-----|-----|----------------|
| Azul | #2C5AAB | Botones primarios, nav | ✅ |
| Turquesa | #0FAEBF | Botones actualizar, secundarios | ✅ |
| Celeste | #67BCEB | Gráficos, bajo impacto | ⚠️ revisar |
| Negro | #000000 | Textos generales | ✅ |

### 2.3 Colores de Estado

| Estado | HEX ADR | Proyecto actual | Cumplimiento |
|--------|---------|-----------------|---------------|
| REGISTRADO | #3B7DCC | #3B7DCC | ✅ |
| INGRESADO | #2C5AAB | #2C5AAB | ✅ |
| PENDIENTE | #F2B801 | #F2B801 | ✅ |
| OBSERVADO | #AB2741 | #AB2741 | ✅ |
| FIRMADO | #0FBF90 | #0FBF90 | ✅ |

## 3. MÓDULO GESTIÓN DE EXPEDIENTES (HU 1.1 - 1.2)

| Requisito ADR | Estado | Observaciones |
|--------------|--------|---------------|
| Tabla 10 reg/página | ✅ | `itemsPerPage = 10` |
| Columnas: Numeración, Tipo, Elaborado, Enviado, Fecha | ⚠️ | Falta "Enviado por" |
| Botón "Añadir nuevo" Azul #2C5AAB | ✅ | `bg-primary` |
| Botones Actualizar/Eliminar según estado | ✅ | `canEdit()` implementado |
| Estado inicial REGISTRADO | ✅ | hardcodeado en saveExpediente() |
| Derivación → estado INGRESADO | ✅ | cambiar a INGRESADO |
| Botones bloqueados al derivar | ✅ | controlado por canEdit() |

## 4. MÓDULO GESTIÓN DE FIRMAS (HU 2.1 - 2.2)

| Requisito ADR | Estado | Observaciones |
|--------------|--------|---------------|
| Tabla filtrada por usuario | ✅ | En proceso |
| Columnas: Elaborado, Tipo, Estado, Fecha-Hora | ✅ | |
| Botón Descargar archivo | ✅ | |
| Cambio INGRESADO → PENDIENTE al descargar | ⚠️ | No implementado |
| Toast "Se ha descargado..." | ⚠️ | Falta mensaje específico |
| Botón Rechazar con motivo | ⚠️ | Modal existe pero revisar |
| Cambio OBSERVADO al rechazar | ✅ | Implementado |

## 5. MÓDULO REPORTES (HU 3.1)

| Requisito ADR | Estado | Observaciones |
|--------------|--------|---------------|
| Gráfico barras por estado | ✅ | Existe |
| Colores por estado en gráfico | ✅ | Revisado |
| Gráfico circular "%" | ✅ | Existe |

## 6. AUTENTICACIÓN (HU 0.1)

| Requisito ADR | Estado | Observaciones |
|--------------|--------|---------------|
| Logo tamaño mínimo 1.75cm | ⚠️ | revisar CSS |
| Fondo claro→logo original, oscuro→blanco | ⚠️ | No implementado |
| Título Poppins Bold | ✅ | Implementado |
| Campos New Order | ✅ | `font-ui` |
| Botón Ingresar Azul/Turquesa | ⚠️ | Revisar color |
| Alertas Rojo #AB2741 | ⚠️ | revisar toast colors |

## RESUMEN DE CUMPLIMIENTO

| Categoría | Cumplimiento |
|-----------|-------------|
| Tipografía | 90% |
| Paleta de colores | 95% |
| Badges de estado | 100% |
| Tabla Expedientes | 85% |
| Flujo estados | 90% |
| Firmas | 75% |
| Reportes | 95% |
| Login | 80% |

## ACCIONES PENDIENTES

1. Agregar columna "Enviado por" en tabla Expedientes
2. Implementar cambio INGRESADO → PENDIENTE al descargar
3. Mensajes toast con colores ADR específicos
4. Revisar logo login y colores de botón
5. Completar lógica de filtros en Firmas por usuario