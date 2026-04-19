# Design System

Simmer is a recipe app. Warm, cozy kitchen aesthetic — not sterile or corporate.

## Colors (defined in `app/globals.css`)

| Token         | Value     | Usage                                    |
|---------------|-----------|------------------------------------------|
| `background`  | `#FFF8F0` | Page background (warm cream)             |
| `foreground`  | `#3D2C1E` | Primary text (deep warm brown)           |
| `primary`     | `#C4572A` | Buttons, links, key actions (terracotta) |
| `primary-hover` | `#A84823` | Primary hover state                    |
| `secondary`   | `#6B7F5E` | Tags, success states, accents (sage)     |
| `secondary-hover` | `#5A6B4F` | Secondary hover state               |
| `muted`       | `#A89585` | Placeholders, secondary text, borders    |
| `surface`     | `#FFFFFF` | Card/panel backgrounds                   |
| `border`      | `#E8DDD3` | Borders, dividers                        |

## Typography

- **Headings** — `font-serif` (Lora) — warm, cookbook feel
- **Body** — `font-sans` (Inter) — clean, readable
- Use `font-serif` for recipe titles, section headers, and display text
- Use `font-sans` for body text, UI labels, form inputs

## Styling Guidelines

- Light mode only
- Rounded corners: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons/inputs
- Shadows: use `shadow-sm` with warm tones, not harsh black shadows
- Generous spacing — relaxed, not cramped
- Prefer soft borders (`border-border`) over hard lines
- No pure black (`#000`) or pure white (`#FFF`) in the UI — use the theme tokens
