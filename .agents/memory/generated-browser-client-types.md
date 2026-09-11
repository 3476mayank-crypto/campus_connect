---
name: Generated browser client types
description: Workspace typing requirement for generated browser API clients.
---

Generated React API clients may call `Headers.entries()`, which TypeScript does not expose with only the `dom` library.

**Why:** Code generation can succeed while the workspace library build fails on the generated client, blocking all downstream app type checks.

**How to apply:** Keep `dom.iterable` alongside `dom` in shared browser client `tsconfig` files when generated fetch clients use iterable web platform APIs.