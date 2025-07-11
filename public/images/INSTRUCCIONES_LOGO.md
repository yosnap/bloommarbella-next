# Instrucciones para agregar el logo

## Pasos para agregar la imagen del logo:

1. **Guarda la imagen proporcionada** como `bloom-logo.png` en la carpeta:
   ```
   public/images/bloom-logo.png
   ```

2. **Características recomendadas de la imagen**:
   - Formato: PNG (con transparencia)
   - Tamaño: 512x512px o similar (cuadrado)
   - Fondo: Transparente
   - El icono de la maceta con planta debe estar centrado

3. **Optimización**:
   - Asegúrate de que la imagen esté optimizada para web
   - Peso recomendado: menos de 50KB

## El componente Logo ya está configurado para:

- ✅ Usar la imagen del logo automáticamente
- ✅ Fallback al icono SVG si la imagen no se encuentra
- ✅ Responsive en diferentes tamaños (sm, md, lg, xl)
- ✅ Implementado en todas las páginas:
  - Header principal
  - Páginas de autenticación
  - Footer
  - Páginas de error

## Tamaños disponibles:

- `sm`: 32x32px (w-8 h-8)
- `md`: 40x40px (w-10 h-10) - Por defecto
- `lg`: 48x48px (w-12 h-12)
- `xl`: 64x64px (w-16 h-16)

## Uso del componente:

```tsx
import { Logo } from '@/components/ui/logo'

// Logo básico con texto
<Logo />

// Logo grande sin texto
<Logo size="xl" showText={false} />

// Logo con clases personalizadas
<Logo size="lg" textClassName="text-white" />
```

Una vez que agregues la imagen `bloom-logo.png` en `public/images/`, el logo se mostrará automáticamente en toda la aplicación.