---
name: react-layered-architecture
description: Use when working on any React project — brainstorming, planning, building, or reviewing. Provides Presentation-Domain-Data layering framework that keeps business logic out of components and ensures each layer is independently testable.
---

# React Layered Architecture

## Overview

React is a view library, not an application framework. Business logic does not belong in components. Apply Presentation/Domain/Data layering to keep concerns separated and each layer independently testable.

## When to Use

**Use this skill when:**
- Building React features or components
- Planning React project structure
- Reviewing React code
- Refactoring large or complex components
- Brainstorming architecture for a React application

**Don't use for:**
- Tooling choices (bundler, testing framework, state management library)
- Non-React projects
- Trivial components with no business logic (a styled button doesn't need three layers)

## The Three Layers

| Layer | Contains | Rules |
|---|---|---|
| Presentation | React components | Pure/near-pure. Receive domain objects as props. No business logic. No direct API calls. |
| Domain | Plain classes, pure functions, custom hooks (as bridge) | Framework-agnostic business logic. Hooks bridge domain → presentation but delegate logic to domain objects. |
| Data | Gateway functions, API clients | Isolate external APIs behind clean interfaces. Handle data conversion here (Anti-Corruption Layer). |

**The dependency rule:** Presentation → Domain → Data. Never skip layers. Never let Data depend on Presentation.

## Decision Guide

If you're unsure where code belongs, use this table:

| Code does this | It belongs in |
|---|---|
| Renders JSX | Presentation |
| Manages UI state (hover, toggle, focus, animation) | Presentation (local state) |
| Manages application state (selected item, form data) | Domain (hook bridging to domain object) |
| Evaluates business rule conditionals | Domain (class or function) |
| Calculates, validates, or formats domain data | Domain (class or function) |
| Fetches data from an API | Data (gateway) |
| Converts API response shapes to domain shapes | Data (Anti-Corruption Layer) |
| Orchestrates side effects and state for a feature | Domain (custom hook, delegating to domain objects) |

## Extraction Signals

YOU MUST extract when you see these signals:

- **Extract a hook** when a component manages state or side effects — the component should just render
- **Extract a domain class** when conditional logic appears in multiple places or a component computes derived values
- **Extract a Strategy** when the same operation varies by context (country, user type, plan tier) — replace conditionals with polymorphism
- **Extract a gateway** when data fetching is reused across features or needs independent testing
- **Extract to Anti-Corruption Layer** when API response shapes leak into components as prop types

**Domain objects must be testable without React.** If you need `renderHook` to test business logic, it's in the wrong place.

## Anti-Patterns

| Anti-pattern | What's wrong | Fix |
|---|---|---|
| Business logic in components | Logic is coupled to React, untestable without rendering | Extract to domain class or pure function |
| Direct API calls in view layer | Data fetching mixed with rendering, hard to test or reuse | Extract to gateway function |
| Fat hooks that contain domain logic | Hook does too much — it should bridge, not implement | Move logic to domain class, hook calls domain methods |
| Domain layer importing React | Domain is no longer framework-agnostic | Domain uses plain classes/functions only; hooks are the bridge |
| Raw API shapes as component props | View coupled to API contract; API changes break UI | Transform in data layer (Anti-Corruption Layer) |
| Shotgun Surgery across files for a single change | Business rule scattered across components and hooks | Consolidate into domain class, possibly with Strategy pattern |

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Just one small API call in the component" | It grows. Extract to a gateway now. |
| "The hook IS the domain logic" | Hooks bridge domain to React. They shouldn't contain business rules — delegate to domain objects. |
| "We'll refactor later" | You won't. Extract at the signal. The cost is low now and compounds later. |
| "This validation is UI-specific" | If it enforces a business rule (amount limits, format requirements), it's domain. UI validation is "is this field focused?" |
| "Adding a domain layer is over-engineering" | A plain class with methods is less engineering than debugging tangled component logic. |
| "It's just a small component" | Small components with business logic become big components with business logic. Separate concerns at the start. |

## What This Does NOT Cover

- File naming or folder structure conventions
- State management library choice (Redux, Zustand, Jotai, etc.)
- Server-side rendering or server components
- Micro-frontends
- Testing framework selection
- Bundler or build tool configuration
