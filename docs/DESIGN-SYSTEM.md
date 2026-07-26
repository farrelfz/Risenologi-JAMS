# Design System

## Purpose
Define the foundational design-system decisions for Risenologi JAMS before product-specific components are implemented.

## Scope
Covers design tokens, accessibility expectations, and component philosophy for future interface work. This document does not implement CSS, create UI components, or define product workflows.

## Status
Approved foundation.

## Owner
TBD.

## Last Updated
2026-07-26

## Table of Contents
- [Color Tokens](#color-tokens)
- [Typography](#typography)
- [Radius](#radius)
- [Shadows](#shadows)
- [Spacing](#spacing)
- [Motion](#motion)
- [Accessibility](#accessibility)
- [Component Philosophy](#component-philosophy)
- [TODO](#todo)

## Color Tokens
Use semantic tokens rather than raw color names in application surfaces.

- `background`: Default application canvas.
- `foreground`: Primary readable text on the application canvas.
- `card`: Elevated surface for grouped information.
- `card-foreground`: Text and icons on card surfaces.
- `popover`: Floating surface for transient disclosure.
- `popover-foreground`: Text and icons on popover surfaces.
- `primary`: Primary action and active navigation emphasis.
- `primary-foreground`: Text and icons on primary surfaces.
- `secondary`: Secondary action and low-emphasis surface.
- `secondary-foreground`: Text and icons on secondary surfaces.
- `muted`: Subtle backgrounds for supporting content.
- `muted-foreground`: Secondary text and helper copy.
- `accent`: Non-destructive highlight surface.
- `accent-foreground`: Text and icons on accent surfaces.
- `destructive`: Destructive action and error emphasis.
- `destructive-foreground`: Text and icons on destructive surfaces.
- `border`: Default separator and component boundary.
- `input`: Form control boundary.
- `ring`: Focus indication.

## Typography
Typography should prioritize readability for editorial and accreditation workflows.

- Use a system font stack until a brand typeface is approved.
- Use semantic text roles instead of visual-only naming.
- Keep line length comfortable for long evidence and review content.
- Prefer sentence case for labels and headings unless a domain term requires otherwise.

## Radius
Radius tokens should communicate hierarchy without creating inconsistent shapes.

- `sm`: Compact controls and small badges.
- `md`: Standard inputs and buttons.
- `lg`: Cards, panels, and grouped content.
- `xl`: Prominent containers used sparingly.

## Shadows
Shadows should reinforce elevation without reducing readability.

- Use borders before shadows for dense administrative interfaces.
- Reserve stronger shadows for overlays, dialogs, and popovers.
- Avoid decorative shadows that do not communicate interaction or hierarchy.

## Spacing
Spacing should follow a consistent scale and preserve scanability.

- Use compact spacing for forms, tables, and high-frequency review tasks.
- Use larger spacing for page-level grouping and onboarding content.
- Avoid one-off spacing values unless documented by a component decision.

## Motion
Motion must support comprehension and never block task completion.

- Keep transitions short and purposeful.
- Respect reduced-motion user preferences.
- Avoid motion for critical status changes unless paired with persistent text or iconography.

## Accessibility
Accessibility is a baseline requirement for all future components.

- Maintain sufficient contrast in light and dark themes.
- Provide visible focus states for interactive elements.
- Ensure keyboard access for all controls and overlays.
- Use semantic HTML before custom interaction patterns.
- Pair color with text or icon cues for status and validation.

## Component Philosophy
Components should be reusable infrastructure rather than business-specific workflows.

- Build primitive components before composed product components.
- Keep business rules outside UI primitives.
- Prefer explicit props and typed contracts.
- Document component accessibility expectations when components are introduced.
- Do not create domain-specific components without an approved task or RFC.

## TODO
- Replace provisional token descriptions with final brand values after visual identity approval.
- Add component-specific guidance when the first UI primitives are reviewed.
