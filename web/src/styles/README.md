# Diccionario de clases

Muchas de las clases que vas a ver en el JSX **no existen en Tailwind** — las inventamos acá,
en `theme.css` e `index.css`. Si buscás `text-label-secondary` en Google no vas a encontrar
nada. Esta es la lista de las que usamos.

Todo esto sale de dos archivos, y no hay `tailwind.config.js`: en Tailwind v4 la configuración
vive en el CSS.

- **`theme.css`** — los valores (colores, tamaños de texto, radios, tiempos).
- **`index.css`** — las clases inventadas (`material-regular`, `hairline-b`, `eyebrow`…) y los
  estilos base del documento.

---

## Tres trampas antes de empezar

**1. `text-` significa dos cosas distintas.**

```html
<p class="text-subheadline text-label-secondary">
       <!-- ↑ tamaño         ↑ color -->
```

`text-subheadline` es un **tamaño** de fuente. `text-label-secondary` es un **color**. Comparten
prefijo pero vienen de dos lugares distintos del theme. Casi siempre vas a querer una de cada.

**2. Los números raros sí son válidos.** `w-17`, `px-3.75`, `size-4.5`, `w-62` son Tailwind
estándar: en v4 la escala es dinámica (`n × 4px`) y acepta fracciones. No aparecen en la
documentación de la v3, que es la que sale primero al buscar.

| Clase | Píxeles | | Clase | Píxeles |
| --- | --- | --- | --- | --- |
| `size-4.5` | 18px | | `w-17` | 68px (barra colapsada) |
| `px-3.75` | 15px | | `w-62` | 248px (barra expandida) |
| `pl-4.5` | 18px | | `w-68` | 272px (menú móvil) |

**3. El modo oscuro es automático.** No escribas `dark:` nunca si usás estos tokens. La clase
emite `var(--label)`, y cuando `<html>` tiene la clase `dark` esa variable cambia de valor sola.
Escribir `dark:text-white` rompe ese mecanismo.

---

## Colores

Los colores no se nombran por cómo se ven (`gray-500`) sino por **para qué sirven**. Así el
mismo nombre funciona en claro y en oscuro.

### Texto

| Clase | Para qué |
| --- | --- |
| `text-label` | Texto principal. Negro en claro, blanco en oscuro. |
| `text-label-secondary` | Texto de apoyo, ítems no activos. |
| `text-label-tertiary` | Placeholders, separadores, lo más apagado que se sigue leyendo. |
| `text-label-quaternary` | Deshabilitado. Casi invisible a propósito. |

### Fondos

| Clase | Para qué |
| --- | --- |
| `bg-base` | El fondo de la app. Va una sola vez, en `AppShell`. |
| `bg-elevated` | Tarjetas y superficies "por encima" del fondo. |
| `bg-fill-tertiary` | Fondo de un control (el resaltado del ítem activo, hover de botones). |
| `bg-separator` | Solo para dibujar una línea con un `<span>`. Para bordes usá `hairline-*`. |
| `bg-scrim` | La capa oscura detrás del menú móvil. |

También existen `bg-grouped` y `bg-sunken`, y los fills `bg-fill`, `bg-fill-secondary`,
`bg-fill-quaternary`, hoy sin uso.

### Acentos

`text-blue` / `bg-blue` y lo mismo con `green`, `red`, `orange`, `yellow`, `purple`, `pink`,
`teal`, `indigo`, `mint`. Más la escala `gray`, `gray2` … `gray6`.

Son **planos, sin número**: se escribe `text-red`, no `text-red-500`. Ojo que las clases con
número de Tailwind (`text-blue-500`) también funcionan porque no reseteamos la paleta — pero no
respetan el modo oscuro. No las uses.

Hoy el proyecto usa `text-blue` (ítem activo) y `text-red` (errores de formulario).

---

## Tipografía

| Clase | Tamaño | Uso |
| --- | --- | --- |
| `text-caption2` | 10px | |
| `text-caption` | 11px | El "R2" del logo. |
| `text-footnote` | 12px | Notas al pie, ayudas. |
| `text-subheadline` | 13px | Ítems del menú, breadcrumb. |
| `text-body` | 14px | **El default del `<body>`.** No hace falta escribirlo. |
| `text-callout` | 14px | |
| `text-headline` | 14px | Igual que body pero con peso 600. |
| `text-title3` | 16px | El wordmark "Req2Ticket". |
| `text-title2` | 19px | |
| `text-title1` | 24px | El `<h1>` de cada página. |
| `text-largetitle` | 30px | |

Familias: `font-sans` (Inter, el default), `font-display` (Manrope, para títulos y números),
`font-mono` (JetBrains Mono).

> **Los headings ya vienen configurados.** `h1`–`h4` reciben `font-display`, peso 700 y el
> tracking correcto por una regla de documento en `index.css`. No les pongas clases de fuente,
> solo de tamaño y color.

---

## Clases inventadas

Estas no son valores del theme sino clases completas, definidas con `@utility` en `index.css`.

| Clase | Qué hace |
| --- | --- |
| `material-regular` | Fondo translúcido + desenfoque. La barra lateral y la barra superior. |
| `material-thick` | Igual pero más opaco y más desenfoque. El panel del menú móvil. |
| `material-thin` | La versión más liviana. Sin uso hoy. |
| `hairline-b` `hairline-t` `hairline-r` | Un borde de **0.5px** abajo / arriba / a la derecha. Un `border` normal de 1px se ve grueso en pantallas retina. |
| `surface-highlight` | Brillo interno arriba, para que una tarjeta parezca levantada. |
| `brand-tile` | El degradado azul→violeta del logo. Es el único degradado de la app. |
| `eyebrow` | Título de sección chiquito en mayúsculas ("PROYECTO"). |
| `numeric` | Números que no bailan al actualizarse. Sin uso hoy. |
| `data` | IDs, contadores, atajos de teclado, en monoespaciada. Sin uso hoy. |

> Cuidado con `data`: es una clase que se llama literalmente así, no tiene nada que ver con los
> atributos `data-*` de HTML ni con la variante `data-[...]` de Tailwind.

---

## Formas y tiempos

| Clase | Valor | Uso |
| --- | --- | --- |
| `rounded-control` | 10px | Botones, inputs, ítems del menú. |
| `rounded-card` | 14px | Tarjetas. |
| `rounded-group` | 18px | Grupos de lista. |
| `rounded-sheet` | 20px | Modales. |
| `duration-fast` | 150ms | Cambios de color, hover, fades cortos. |
| `duration-base` | 250ms | El plegado de la barra lateral. |
| `duration-slow` | 380ms | |
| `ease-ios` | | Arranca rápido y frena largo. El default de la casa. |
| `ease-out-quad` | | Más suave, para cambios de color. |
| `ease-in-out-soft` | | |

Sombras, de menos a más elevación: `shadow-hairline`, `shadow-card`, `shadow-raised`,
`shadow-dragging`, `shadow-popover`.

Cambian solas con el tema. En claro son negros muy suaves (4–18% de opacidad); en oscuro
suben a 40–70%, porque un negro al 6% sobre un fondo casi negro no se ve. Por eso los
valores viven en `:root`/`.dark` como `--elev-*` y no dentro del `@theme`: ahí adentro el
valor se incrusta en la clase y no habría forma de cambiarlo por tema.

> Una transición necesita **las tres**: qué animar, cuánto y con qué curva.
> `transition-colors duration-fast ease-out-quad`. Si te falta `duration`, Tailwind usa su
> default y no el nuestro.

---

## Agregar un token

Los tokens viven en el bloque `@theme` de `theme.css`, y **el prefijo del nombre decide qué
clase se genera**. `--radius-*` genera `rounded-*`, `--text-*` genera `text-*`, `--color-*`
genera `text-`/`bg-`/`border-`, `--ease-*` genera `ease-*`.

El caso que ya nos mordió una vez: la utilidad `duration-*` **no** sale de `--duration-*` sino
de `--transition-duration-*`. Con el nombre equivocado el token sigue siendo una variable CSS
válida, pero la clase no existe, no genera CSS y la transición pasa a ser instantánea **sin que
el build falle**. Si agregás un token y la clase "no hace nada", es esto: buscá el prefijo
correcto en la documentación de Tailwind v4.

Para verificar que un token nuevo funciona:

```sh
pnpm build && grep -o 'transition-duration:[^;}]*' dist/assets/*.css | sort -u
```

---

## Por qué `index.css` ignora los `.md`

Tailwind escanea **todos** los archivos del proyecto buscando nombres de clases, y no
distingue código de documentación. Sin esta línea de `index.css`:

```css
@source not "**/*.md";
```

cada clase que este archivo nombra en una tabla terminaría en el CSS de producción, aunque
ningún componente la use. Medido: son ~3 kB de más, un 10% del bundle de estilos. No la saques.

