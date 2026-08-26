# Class dictionary

Many of the classes you will see in the JSX **do not exist in Tailwind** — we invented them
here, in `theme.css` and `index.css`. Searching Google for `text-label-secondary` will turn up
nothing. This is the list of the ones we use.

All of it comes from two files, and there is no `tailwind.config.js`: in Tailwind v4 the
configuration lives in the CSS.

- **`theme.css`** — the values (colours, text sizes, radii, timings).
- **`index.css`** — the invented classes (`material-regular`, `hairline-b`, `eyebrow`…) and the
  document's base styles.

---

## Three traps before you start

**1. `text-` means two different things.**

```html
<p class="text-subheadline text-label-secondary">
       <!-- ↑ size            ↑ colour -->
```

`text-subheadline` is a font **size**. `text-label-secondary` is a **colour**. They share a
prefix but come from two different places in the theme. You will almost always want one of each.

This is also why `lib/cn.js` has to tell `twMerge` which `text-*` classes are sizes and which
are colours. Without that it treats them as one group and silently drops one of the pair.
**If you add a token here, add it to those lists too.**

**2. The odd numbers really are valid.** `w-17`, `px-3.75`, `size-4.5`, `w-62` are standard
Tailwind: in v4 the scale is dynamic (`n × 4px`) and accepts fractions. They do not appear in
the v3 documentation, which is what comes up first when you search.

| Class | Pixels | | Class | Pixels |
| --- | --- | --- | --- | --- |
| `size-4.5` | 18px | | `w-17` | 68px (collapsed sidebar) |
| `px-3.75` | 15px | | `w-62` | 248px (expanded sidebar) |
| `pl-4.5` | 18px | | `w-68` | 272px (mobile drawer) |

**3. Dark mode is automatic.** Never write `dark:` if you are using these tokens. The class
emits `var(--label)`, and when `<html>` carries the `dark` class that variable changes value on
its own. Writing `dark:text-white` breaks that mechanism.

---

## Colours

Colours are not named after how they look (`gray-500`) but after **what they are for**. That way
the same name works in light and in dark.

### Text

| Class | What for |
| --- | --- |
| `text-label` | Primary text. Black in light, white in dark. |
| `text-label-secondary` | Supporting text, inactive items. |
| `text-label-tertiary` | Placeholders, separators, the dimmest thing that is still readable. |
| `text-label-quaternary` | Disabled. Almost invisible on purpose. |

### Backgrounds

| Class | What for |
| --- | --- |
| `bg-base` | The app's background. Used once, in `AppShell`. |
| `bg-elevated` | Cards and surfaces "above" the background. |
| `bg-fill-tertiary` | A control's background (the active item's highlight, button hover). |
| `bg-fill-secondary` | Hover on something that already sits on `bg-fill-tertiary` — the row toggles and the expanded selects. |
| `bg-separator` | Only for drawing a line with a `<span>`. For borders use `hairline-*`. |
| `bg-scrim` | The dark layer behind the mobile drawer. |

`bg-grouped`, `bg-sunken`, `bg-fill` and `bg-fill-quaternary` also exist but are unused today.

### Accents

`text-blue` / `bg-blue` and the same for `green`, `red`, `orange`, `yellow`, `purple`, `pink`,
`teal`, `indigo`, `mint`. Plus the `gray`, `gray2` … `gray6` scale.

They are **flat, with no number**: write `text-red`, not `text-red-500`. Careful — Tailwind's
numbered classes (`text-blue-500`) also work because we never reset the palette, but they do not
respect dark mode. Do not use them.

All ten accents are in play: `Badge` maps each one to a tone (`bg-blue/12 text-blue` and so on),
`ACCENT_COLORS` in `lib/epicOptions.js` uses them for the epic swatches, and the buttons written
inline across the app use `bg-blue` for the primary action, `bg-red` for a destructive one and
`bg-green` for confirming something (`ConfirmModal`).

---

## Typography

| Class | Size | Use |
| --- | --- | --- |
| `text-caption2` | 10px | |
| `text-caption` | 11px | The "R2" in the logo. |
| `text-footnote` | 12px | Footnotes, hints. |
| `text-subheadline` | 13px | Menu items, breadcrumb. |
| `text-body` | 14px | **The `<body>` default.** No need to write it. |
| `text-callout` | 14px | |
| `text-headline` | 14px | Same as body but weight 600. |
| `text-title3` | 16px | The "Req2Ticket" wordmark. |
| `text-title2` | 19px | |
| `text-title1` | 24px | Each page's `<h1>`. |
| `text-largetitle` | 30px | |

Families: `font-sans` (Inter, the default), `font-display` (Manrope, for titles and numbers),
`font-mono` (JetBrains Mono).

> **Headings are already configured.** `h1`–`h4` get `font-display`, weight 700 and the right
> tracking from a document rule in `index.css`. Do not give them font classes, only size and
> colour.

---

## Invented classes

These are not theme values but complete classes, defined with `@utility` in `index.css`.

| Class | What it does |
| --- | --- |
| `material-regular` | Translucent background + blur. The sidebar and the top bar. |
| `material-thick` | Same but more opaque and more blur. The mobile drawer panel. |
| `material-thin` | The lightest version. Unused today. |
| `hairline-b` `hairline-t` `hairline-r` | A **0.5px** border on the bottom / top / right. A normal 1px `border` looks thick on retina screens. |
| `surface-highlight` | Inner highlight along the top, so a card reads as raised. |
| `brand-tile` | The logo's blue→violet gradient. It is the app's only gradient. |
| `eyebrow` | Small uppercase section title ("PROYECTO"). |
| `numeric` | Numbers that do not jitter as they update. Unused today. |
| `mono` | IDs, counters, keyboard shortcuts, in monospace. Unused today. |

> This one used to be called `data`, which collided with HTML's `data-*` attributes and
> with Tailwind's `data-[...]` variant. If you find `data` in an old branch, it is this.

---

## Shapes and timings

| Class | Value | Use |
| --- | --- | --- |
| `rounded-control` | 10px | Buttons, inputs, menu items. |
| `rounded-card` | 14px | Cards. |
| `rounded-group` | 18px | List groups. |
| `rounded-sheet` | 20px | Modals. |
| `duration-fast` | 150ms | Colour changes, hover, short fades. |
| `duration-base` | 250ms | The sidebar collapse. |
| `duration-slow` | 380ms | |
| `ease-ios` | | Starts fast and settles slowly. The house default. |
| `ease-out-quad` | | Gentler, for colour changes. |
| `ease-in-out-soft` | | |

Shadows, from least to most elevation: `shadow-hairline`, `shadow-card`, `shadow-raised`,
`shadow-dragging`, `shadow-popover`.

They change with the theme on their own. In light they are very soft blacks (4–18% opacity); in
dark they climb to 40–70%, because black at 6% over an almost-black background is invisible.
That is why the values live in `:root`/`.dark` as `--elev-*` rather than inside `@theme`: in
there the value gets baked into the class and there would be no way to vary it per theme.

> A transition needs **all three**: what to animate, how long and with which curve.
> `transition-colors duration-fast ease-out-quad`. Miss `duration` and Tailwind uses its own
> default instead of ours.

---

## Adding a token

Tokens live in the `@theme` block of `theme.css`, and **the name's prefix decides which class is
generated**. `--radius-*` generates `rounded-*`, `--text-*` generates `text-*`, `--color-*`
generates `text-`/`bg-`/`border-`, `--ease-*` generates `ease-*`.

The case that already bit us once: the `duration-*` utility does **not** come from `--duration-*`
but from `--transition-duration-*`. With the wrong name the token is still a valid CSS variable,
but the class does not exist, generates no CSS, and the transition becomes instant **without the
build failing**. If you add a token and the class "does nothing", this is why: look up the right
prefix in the Tailwind v4 documentation.

To check that a new token works:

```sh
pnpm build && grep -o 'transition-duration:[^;}]*' dist/assets/*.css | sort -u
```

---

## Why `index.css` ignores `.md` files

Tailwind scans **every** file in the project looking for class names, and does not tell code
apart from documentation. Without this line in `index.css`:

```css
@source not "**/*.md";
```

every class this file names in a table would end up in the production CSS, even though no
component uses it. Measured: about 3 kB extra, 10% of the style bundle. Do not remove it.
