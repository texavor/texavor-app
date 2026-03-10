---
trigger: always_on
---

# EasyWrite Design Guide

This document outlines the design system, component patterns, and styling rules for the EasyWrite application.

## 1. Core Principles

- **Premium & Modern**: Use a warm, high-contrast palette with a focus on visual excellence.
- **Clean Layouts**: Prioritize "flat" designs with minimal borders and shadows (`border-none`, `shadow-none`).
- **Branded Icons**: Exclusively use custom SVG icons from `@/components/icons/CustomIcons.tsx`. Avoid third-party libraries like `lucide-react` for top-level UI.
- **Responsive & Alive**: Ensure smooth transitions, hover effects, and responsive layouts for all screen sizes.

## 2. Color Palette

### Base Colors

- **App Background**: `#F9F4F0` (Warm Cream)
- **Cards/Popovers**: `#FFFFFF` (White)
- **Text (Primary)**: `#09090B` (Rich Black)
- **Text (Secondary)**: `#7A7A7A` or `#6B7280` (Gray)

### Brand Colors

- **Primary (Green)**: `#104127` (Deep Forest Green)
- **Accent (Light Green)**: `#EAF9F2` or `#F9F4F0` (used for hover/active states)
- **Destructive (Red)**: `oklch(0.577 0.245 27.325)`

### Status Colors (from `lib/constants.ts`)

- **Draft**: `#FFE8A3` (BG), `#C58A00` (Text)
- **Published**: `#C9F3D3` (BG), `#1E7A33` (Text)
- **Failed**: `#FEE2E2` (BG), `#DC2626` (Text)
- **Scheduled**: `#E5D5FF` (BG), `#6A32B9` (Text)

## 3. Typography

- **Headings & Branded UI**: `Poppins` (`font-poppins`).
- **Body & Form Elements**: `Inter` (`font-inter`).
- **Mono**: `Geist Mono` or standard system mono.

## 4. Layout & Spacing

- **Border Radius**: Default is `0.625rem` (`rounded-xl` for cards, `rounded-md` for buttons/inputs).
- **Standard Heights**: Use `h-9` for buttons, inputs, and dropdown triggers to maintain consistency.
- **Spacing Scale**:
  - `gap-4` or `gap-6` for component relationships.
  - `p-4` or `p-6` for card padding.
  - `mb-6` for header-to-content separation.

## 5. Component Patterns

### Buttons

- **Primary**: `bg-[#104127] text-white hover:opacity-90`.
- **Secondary/Ghost**: `bg-white text-[#104127] hover:bg-[#EAF9F2]`.
- **Note**: Always use `rounded-md` or `rounded-xl` depending on the surrounding context.

### Cards

- Always use `border-none` and `shadow-none` (or `shadow-none` specifically as per user rules).
- Use `bg-white` and `rounded-xl`.

### Dropdowns (`CustomDropdown`)

- Should be content-aware: `min-w-[var(--radix-dropdown-menu-trigger-width)] w-fit`.
- Prevent text wrapping: `whitespace-nowrap` on menu items.
- Hover state: `bg-[#f9f4f0]`.

### Data Tables

- Use `CustomTable`.
- Row hover: Subtle transition or background change.
- Borderless look preferred.

## 6. Iconography

- All icons must be imported from `@/components/icons/CustomIcons.tsx`.
- **Naming Convention**: `Custom[Name]Icon`.
- **Standard Size**: `h-4 w-4` for navigation/inline, `h-5 w-5` for larger actions.

## 7. Development Rules

1. **No Inline Borders/Shadows**: Default to `border-none shadow-none` unless it breaks usability.
2. **Tanstack Management**: Use `useQuery` and `useMutation` for all API interactions.
3. **Global Toasts**: Do not add manual toasts in API helper files; use the global `axiosInstance` toast or explicit `toast.success/error` in component success/error handlers only if necessary.
4. **No Scrollbars**: Use `.no-scrollbar` class for horizontal/vertical overflow zones.
