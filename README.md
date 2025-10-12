# MediSupply Frontend

Sistema de gestión de suministros médicos - Aplicación Frontend desarrollada con Angular 20.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Construcción](#construcción)
- [Despliegue](#despliegue)
- [Internacionalización](#internacionalización)
- [Arquitectura](#arquitectura)

## 📖 Descripción

MediSupply es una aplicación web moderna para la gestión eficiente de suministros médicos. Permite a los usuarios administrar productos, proveedores, inventarios y más, con soporte completo para múltiples idiomas (Español e Inglés).

## 🚀 Tecnologías

- **Framework:** Angular 20.3.0 (Zoneless)
- **UI/UX:** 
  - Angular Material 20.2.7
  - TailwindCSS 3.4.17
- **Internacionalización:** Transloco 6.0.4
- **Estado:** Angular Signals
- **Testing:** Jasmine + Karma
- **Estilos:** SCSS + Tailwind
- **Build:** Angular CLI 20.3.4

## 📁 Estructura del Proyecto

```
Frontend-MediSupply/
├── src/
│   ├── app/
│   │   ├── core/                      # Funcionalidades core
│   │   │   ├── guards/               # Guards de autenticación
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── guest.guard.ts
│   │   │   ├── init/                 # Inicializadores de la app
│   │   │   │   ├── icon-init.ts
│   │   │   │   ├── locale-initializer.ts
│   │   │   │   └── transloco-init.ts
│   │   │   ├── layout/               # Componentes de layout
│   │   │   │   └── header/
│   │   │   ├── services/             # Servicios core
│   │   │   │   ├── api-client.service.ts
│   │   │   │   ├── icon-service.ts
│   │   │   │   ├── locale-route.service.ts
│   │   │   │   └── i18n-title-strategy.ts
│   │   │   └── state/                # Estado global
│   │   │       └── app.store.ts
│   │   │
│   │   ├── features/                  # Módulos de funcionalidad
│   │   │   ├── auth/                 # Autenticación
│   │   │   │   ├── pages/
│   │   │   │   │   └── login/
│   │   │   │   ├── services/
│   │   │   │   ├── state/
│   │   │   │   │   └── auth.store.ts
│   │   │   │   └── ui/
│   │   │   │       └── login-form/
│   │   │   │
│   │   │   ├── dashboard/            # Panel principal
│   │   │   │   ├── pages/
│   │   │   │   └── state/
│   │   │   │       └── dashboard.state.ts
│   │   │   │
│   │   │   └── products/             # Gestión de productos
│   │   │       ├── services/
│   │   │       │   └── products.service.ts
│   │   │       ├── shell/
│   │   │       └── ui/
│   │   │           └── add-product/
│   │   │
│   │   ├── shared/                    # Componentes compartidos
│   │   │   ├── DTOs/                 # Data Transfer Objects
│   │   │   │   ├── category.dto.ts
│   │   │   │   ├── product.dto.ts
│   │   │   │   └── provider.dto.ts
│   │   │   └── models/               # Modelos de datos
│   │   │       ├── category.model.ts
│   │   │       ├── product.model.ts
│   │   │       └── provider.model.ts
│   │   │
│   │   ├── app.config.ts             # Configuración principal
│   │   ├── app.routes.ts             # Rutas de la aplicación
│   │   └── app.ts                    # Componente raíz
│   │
│   ├── assets/                        # Recursos estáticos
│   │   ├── i18n/                     # Archivos de traducción
│   │   │   ├── en.json               # Inglés
│   │   │   └── es.json               # Español
│   │   ├── icons/                    # Iconos SVG
│   │   │   └── logo-header.svg
│   │   └── images/                   # Imágenes
│   │       └── MediSupplyLogo.png
│   │
│   ├── environments/                  # Variables de entorno
│   │   ├── environment.ts            # Desarrollo
│   │   └── environment.prod.ts       # Producción
│   │
│   ├── styles/                        # Estilos globales
│   │   ├── colors.scss               # Paleta de colores
│   │   ├── forms.scss                # Estilos de formularios
│   │   ├── mat.override.scss         # Overrides de Material
│   │   ├── mixins.scss               # Mixins de SCSS
│   │   ├── spacing.scss              # Sistema de espaciado
│   │   ├── typography.scss           # Tipografía
│   │   └── variables.scss            # Variables globales
│   │
│   ├── index.html                     # HTML principal
│   ├── main.ts                        # Punto de entrada
│   └── styles.scss                    # Estilos principales
│
├── docs/                              # Documentación
│   └── I18N_ROUTES.md                # Documentación de i18n
│
├── angular.json                       # Configuración de Angular
├── package.json                       # Dependencias
├── tailwind.config.js                # Configuración de Tailwind
├── transloco.config.js               # Configuración de i18n
├── tsconfig.json                      # Configuración de TypeScript
└── README.md                          # Este archivo
```

## 📋 Requisitos Previos

- Node.js 18+ o superior
- npm 9+ o superior
- Angular CLI 20+

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd Frontend-MediSupply
```

2. Instalar dependencias:
```bash
npm install
```

## 💻 Desarrollo

### Servidor de Desarrollo

Iniciar el servidor de desarrollo:

```bash
npm start
# o
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modifiques los archivos fuente.

### Servidor con Idioma Específico

```bash
ng serve --configuration=es    # Para español
ng serve --configuration=en    # Para inglés
```

## 🧪 Testing

### Pruebas Unitarias

Ejecutar las pruebas unitarias con Karma:

```bash
npm test
```

Para ejecutar pruebas en modo CI (sin watch):

```bash
npm test -- --no-watch --browsers=ChromeHeadless
```

### Cobertura de Código

```bash
ng test --code-coverage
```

Los reportes se generarán en el directorio `coverage/`.

## 🏗️ Construcción

### Build de Desarrollo

```bash
ng build
```

### Build de Producción

```bash
ng build --configuration=production
```

Los artefactos de construcción se almacenarán en el directorio `dist/`.

### Características del Build de Producción:
- ✅ Optimización de código
- ✅ Minificación
- ✅ Tree-shaking
- ✅ Lazy loading
- ✅ AOT (Ahead-of-Time) compilation

## 🚀 Despliegue

### Despliegue Continuo (CD)

La aplicación está configurada para despliegue automático en **Firebase Hosting**.

#### URL de Producción
🌐 **[URL_DE_FIREBASE]** *(Por configurar)*

#### Proceso de Despliegue

1. **Automático (CI/CD):**
   - Los cambios en la rama `main` desencadenan automáticamente el proceso de despliegue
   - El pipeline de CI ejecuta las pruebas
   - Si las pruebas pasan, se genera el build de producción
   - El build se despliega automáticamente a Firebase Hosting

2. **Manual:**
   ```bash
   # Build de producción
   npm run build -- --configuration=production
   
   # Desplegar a Firebase
   firebase deploy --only hosting
   ```

### Integración Continua (CI)

El proyecto utiliza un pipeline de CI/CD que incluye:

#### Pipeline de CI:
1. **Validación de Código:**
   - Verificación de sintaxis TypeScript
   - Linting de código
   - Validación de estilos

2. **Testing:**
   - Ejecución de pruebas unitarias
   - Generación de reporte de cobertura
   - Validación de umbral de cobertura mínimo

3. **Build:**
   - Construcción de la aplicación
   - Verificación de que no hay errores de compilación
   - Optimización de assets

4. **Despliegue (CD):**
   - Despliegue automático a Firebase Hosting
   - Generación de URL de preview para PRs
   - Despliegue a producción desde la rama main

### Entornos

| Entorno | URL | Rama | Despliegue |
|---------|-----|------|------------|
| Producción | [URL_DE_FIREBASE] | `main` | Automático |
| Preview | Dinámico | Pull Requests | Automático |

## 🌍 Internacionalización

La aplicación soporta múltiples idiomas usando **Transloco**:

### Idiomas Disponibles
- 🇪🇸 Español (es) - Por defecto
- 🇬🇧 Inglés (en)

### Estructura de Traducciones

```
src/assets/i18n/
├── es.json    # Traducciones en español
└── en.json    # Traducciones en inglés
```

### Uso en Componentes

```typescript
// En el template
<div *transloco="let t">
  <h1>{{ t('dashboard.welcome') }}</h1>
</div>

// En el código TypeScript
import { TranslocoService } from '@ngneat/transloco';

constructor(private translocoService: TranslocoService) {}

changeLanguage(lang: string) {
  this.translocoService.setActiveLang(lang);
}
```

### Rutas Localizadas

Las rutas están configuradas para incluir el prefijo de idioma:
- `/es/products` - Productos en español
- `/en/products` - Products in English

Ver documentación completa en: [docs/I18N_ROUTES.md](docs/I18N_ROUTES.md)

## 🏛️ Arquitectura

### Patrón de Arquitectura

El proyecto sigue una **arquitectura basada en features** con separación clara de responsabilidades:

#### Core
- Servicios compartidos
- Guards de autenticación
- Interceptors
- Estado global de la aplicación

#### Features
Cada feature es auto-contenido con:
- **Pages**: Componentes de página (smart components)
- **UI**: Componentes de presentación (dumb components)
- **Services**: Lógica de negocio específica del feature
- **State**: Gestión de estado usando Angular Signals
- **Routes**: Configuración de rutas del feature

#### Shared
- Componentes reutilizables
- DTOs y Models
- Utilidades compartidas

### Gestión de Estado

- **Angular Signals**: Para estado reactivo
- **Computed signals**: Para valores derivados
- **Stores separados**: Un store por feature cuando es necesario

### Estrategia de Estilos

1. **Global**: Variables, colores, tipografía en `src/styles/`
2. **Component-scoped**: Estilos específicos de componentes
3. **Utility-first**: Clases de utilidad de TailwindCSS
4. **Material Overrides**: Personalización de componentes Material en `mat.override.scss`

### Sistema de Colores

```scss
// src/styles/colors.scss
$primary-color: #646116;    // Verde oliva
$bg-color: #f5f5f0;        // Beige claro
$bg-input: #E6E2D5;        // Crema
$input-color: #49473A;     // Marrón oscuro
```

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (`LoginForm`, `ProductsList`)
- **Servicios**: PascalCase + Service (`ProductsService`)
- **Archivos**: kebab-case (`login-form.ts`, `products.service.ts`)
- **Selectores**: kebab-case con prefijo `app-` (`app-login-form`)

### Estructura de Componentes
```typescript
@Component({
  selector: 'app-component-name',
  imports: [...],
  templateUrl: './component-name.html',
  styleUrl: './component-name.scss'
})
export class ComponentName {
  // Signals y computed
  // Constructor con inject
  // Lifecycle hooks
  // Métodos públicos
  // Métodos privados
}
```

## 🤝 Contribución

1. Crear una rama desde `develop`
2. Realizar cambios siguiendo las convenciones
3. Ejecutar tests: `npm test`
4. Crear Pull Request hacia `develop`
5. El CI ejecutará automáticamente las validaciones

## 📄 Licencia

[Especificar licencia]

## 👥 Equipo

[Información del equipo de desarrollo]

## 📞 Contacto

[Información de contacto]

---

**Versión:** 0.0.0  
**Última actualización:** Octubre 2025  
**Angular:** 20.3.0
