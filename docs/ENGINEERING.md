# Engineering Guidelines

## Priorities

1. **Maintainability** — code should be easy to read, change, and delete
2. **Performance** — optimize where it matters, not everywhere

## Principles

### Single Responsibility

Every function, component, and module should do one thing. If you need the word "and" to describe what it does, split it.

### Separation of Concerns

- **Components** handle rendering and user interaction
- **Hooks** handle stateful logic and side effects
- **Utilities** handle pure data transformations
- **Server actions / API routes** handle data fetching and mutations

Don't mix these. A component should not contain business logic. A utility should not depend on React.

### Explicit Over Implicit

- Name things for what they do, not how they're used: `formatQuantity`, not `helper`
- Avoid abbreviations unless universally understood (`id`, `url`, `props` are fine)
- Prefer named exports over default exports
- Prefer explicit props over spreading or forwarding unless wrapping a primitive

### Composition Over Inheritance

Build complex behavior by composing small, focused pieces — not by extending or configuring large ones.

### Don't Repeat Yourself (With Judgment)

Extract shared logic when the duplication is **real** (same intent, same likely change path). Don't extract just because two blocks of code look similar — coincidental similarity is not duplication.

### Least Surprise

Code should behave the way its name and signature suggest. No hidden side effects, no magic. A function called `getRecipe` should not modify state.

### Fail Fast

Validate at boundaries (user input, API responses). Once data is inside the system, trust it. Don't defensively check for impossible states in internal code.

## TypeScript

- Use strict mode — no `any` unless absolutely unavoidable and commented why
- Prefer `interface` for object shapes, `type` for unions and intersections
- Co-locate types with the code that uses them; only extract to shared files when used across multiple modules
- Use discriminated unions for state that has mutually exclusive variants

## React / Next.js

- Default to Server Components; use `"use client"` only when the component needs interactivity or browser APIs
- Keep components small — if a component exceeds ~80 lines, look for extraction opportunities
- Co-locate related files (component, hook, types) in the same directory
- Use Server Actions for mutations; don't create API routes unless a non-browser client needs them

## File Organization

```
app/              → routes and layouts (Next.js App Router)
components/       → shared UI components
components/ui/    → primitive/base components (buttons, inputs, cards)
hooks/            → shared custom hooks
lib/              → utilities, helpers, constants
types/            → shared type definitions (only cross-module types)
```

## Naming Conventions

- **Files/directories** — `kebab-case` (`recipe-card.tsx`, `use-servings.ts`)
- **Components** — `PascalCase` (`RecipeCard`)
- **Functions/variables** — `camelCase` (`formatQuantity`)
- **Types/interfaces** — `PascalCase` (`Recipe`, `Ingredient`)
- **Constants** — `UPPER_SNAKE_CASE` (`MAX_SERVINGS`)

## Testing

- Test behavior, not implementation — test what the code does, not how
- Name tests as sentences describing expected behavior: `"doubles ingredient quantities when servings are doubled"`
