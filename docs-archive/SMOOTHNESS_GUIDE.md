# 🎨 UI Smoothness & Animation Guide

Complete guide for creating smooth, delightful user interactions with animations and transitions.

## Overview

The smoothness module (`lib/ui/smoothness.ts`) provides:
- **Animation Hooks** for React components
- **Smooth Transitions** and fade effects
- **Scroll-based Animations** for engaging UX
- **Gesture Animations** for interactive elements
- **Skeleton Loading** states
- **Easing Functions** for natural motion
- **CSS Animations** with Tailwind integration
- **Accessibility** with prefers-reduced-motion support

## Quick Start

### 1. Fade In on Mount

```typescript
// components/greeting.tsx
'use client';

import { useSmoothFadeIn } from '@/lib/ui/smoothness';

export function Greeting() {
  const { ref, isVisible } = useSmoothFadeIn();

  return (
    <div ref={ref} className={isVisible ? 'animate-fade-in-up' : ''}>
      <h1>Welcome to BillBook</h1>
    </div>
  );
}
```

### 2. Slide In from Side

```typescript
// components/sidebar.tsx
'use client';

import { useSmoothSlideIn } from '@/lib/ui/smoothness';

export function Sidebar() {
  const { ref, isVisible } = useSmoothSlideIn('right', 300);

  return (
    <aside
      ref={ref}
      className={`transition-all ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Sidebar content */}
    </aside>
  );
}
```

### 3. Animate When Scroll Into View

```typescript
// components/stats-section.tsx
'use client';

import { useIntersectionAnimation } from '@/lib/ui/smoothness';

export function StatsSection() {
  const { ref, isVisible } = useIntersectionAnimation({
    threshold: 0.3,
  });

  return (
    <section ref={ref} className={isVisible ? 'animate-fade-in-up' : ''}>
      <div>
        <h2>Your Statistics</h2>
        {/* Stats content */}
      </div>
    </section>
  );
}
```

### 4. Smooth Height Expansion

```typescript
// components/expandable-section.tsx
'use client';

import { useSmoothHeight } from '@/lib/ui/smoothness';
import { useState } from 'react';

export function ExpandableSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { ref, height } = useSmoothHeight(isOpen);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Hide' : 'Show'} Details
      </button>
      <div
        ref={ref}
        style={{ maxHeight: isOpen ? height : 0 }}
        className="overflow-hidden transition-all duration-300"
      >
        <div className="p-4">
          {/* Expandable content */}
        </div>
      </div>
    </div>
  );
}
```

### 5. Ripple Effect on Click

```typescript
// components/ripple-button.tsx
'use client';

import { useRippleEffect } from '@/lib/ui/smoothness';

export function RippleButton() {
  const { ref, handleClick } = useRippleEffect();

  return (
    <button
      ref={ref}
      onClick={handleClick}
      className="relative overflow-hidden rounded-lg bg-blue-500 px-4 py-2 text-white"
    >
      Click Me
    </button>
  );
}
```

### 6. Count Up Animation

```typescript
// components/counter.tsx
'use client';

import { useSmoothCountUp } from '@/lib/ui/smoothness';

export function InvoiceCounter({ target }: { target: number }) {
  const count = useSmoothCountUp(target, 1000);

  return <span>{Math.round(count)}</span>;
}
```

### 7. Page Transition Animation

```typescript
// components/page-with-transition.tsx
'use client';

import { useSmoothPageTransition } from '@/lib/ui/smoothness';

export function PageWithTransition() {
  const { ref } = useSmoothPageTransition();

  return (
    <div ref={ref} className="page-container">
      {/* Page content */}
    </div>
  );
}
```

### 8. Scroll-based Animation

```typescript
// components/parallax-section.tsx
'use client';

import { useScrollAnimation } from '@/lib/ui/smoothness';

export function ParallaxSection() {
  const { ref, progress } = useScrollAnimation();

  return (
    <section ref={ref}>
      <div
        style={{
          transform: `translateY(${progress * 50}px)`,
          opacity: 1 - progress * 0.5,
        }}
      >
        <h2>Parallax Effect</h2>
      </div>
    </section>
  );
}
```

### 9. Gesture Animation (Hover Effect)

```typescript
// components/interactive-card.tsx
'use client';

import { useGestureAnimation } from '@/lib/ui/smoothness';

export function InteractiveCard() {
  const { ref, handleMouseEnter, handleMouseLeave, style } = useGestureAnimation({
    scale: 1.05,
  });

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className="rounded-lg bg-white p-4 shadow-md transition-all"
    >
      Hover over me!
    </div>
  );
}
```

### 10. Skeleton Loading Animation

```typescript
// components/invoice-list-skeleton.tsx
'use client';

import { useSkeletonLoading } from '@/lib/ui/smoothness';

export function InvoiceListSkeleton() {
  const skeletons = useSkeletonLoading(5);

  return (
    <div>
      {skeletons.map((skeleton) => (
        <div key={skeleton.id} className="skeleton-loading mb-4 h-16 w-full rounded" />
      ))}
    </div>
  );
}
```

## CSS Animation Classes

All animations are available as Tailwind classes:

```html
<!-- Fade animations -->
<div class="animate-fade-in-up">Fades in and slides up</div>
<div class="animate-fade-in-down">Fades in and slides down</div>
<div class="animate-fade-in-left">Fades in from left</div>
<div class="animate-fade-in-right">Fades in from right</div>

<!-- Scale animations -->
<div class="animate-scale-in">Scales in with fade</div>
<div class="animate-scale-out">Scales out with fade</div>

<!-- Rotation animations -->
<div class="animate-spin">Continuous rotation</div>
<div class="animate-spin-slow">Slow rotation</div>

<!-- Pulsing animations -->
<div class="animate-pulse">Pulsing effect</div>
<div class="animate-pulse-slow">Slow pulse</div>

<!-- Bounce animations -->
<div class="animate-bounce">Bouncing effect</div>
<div class="animate-bounce-soft">Soft bounce</div>

<!-- Glow animations -->
<div class="animate-glow">Glowing text effect</div>

<!-- Slide animations -->
<div class="animate-slide-down">Slides down</div>
<div class="animate-slide-up">Slides up</div>
<div class="animate-slide-in">Slides in from left</div>

<!-- Skeleton loading -->
<div class="skeleton-loading h-8 w-full rounded">Loading...</div>
```

## Smooth Transitions

```html
<!-- Fast transition (150ms) -->
<div class="transition-fast hover:bg-blue-500">Fast transition</div>

<!-- Smooth transition (300ms) -->
<div class="transition-smooth hover:scale-105">Smooth scale on hover</div>

<!-- Bounce transition (overshoot effect) -->
<div class="transition-bounce active:scale-95">Click for bounce</div>

<!-- Hover effects -->
<div class="hover-lift">Lifts on hover with shadow</div>
<div class="hover-glow">Glows on hover</div>
```

## Complex Animation Examples

### Form Validation with Animation

```typescript
// components/animated-form.tsx
'use client';

import { useState } from 'react';
import { useSmoothFadeIn } from '@/lib/ui/smoothness';
import { validateEmail } from '@/lib/validation/auth';

export function AnimatedForm() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { ref: formRef } = useSmoothFadeIn();

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const validation = validateEmail(value);
    setIsValid(validation.isValid ? true : false);
  };

  return (
    <form ref={formRef} className="space-y-4 animate-fade-in-up">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={`input-focus-scale w-full rounded border-2 px-4 py-2 transition-colors ${
            isValid === null
              ? 'border-gray-300'
              : isValid
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
          }`}
          placeholder="Enter email"
        />
        {isValid === false && (
          <p className="mt-2 animate-fade-in-down text-sm text-red-500">
            Please enter a valid email
          </p>
        )}
        {isValid === true && (
          <p className="mt-2 animate-fade-in-down text-sm text-green-500">
            Email looks good!
          </p>
        )}
      </div>
    </form>
  );
}
```

### Staggered List Animation

```typescript
// components/animated-invoice-list.tsx
'use client';

import { Invoice } from '@/types';
import { useSmoothFadeIn } from '@/lib/ui/smoothness';

export function AnimatedInvoiceList({ invoices }: { invoices: Invoice[] }) {
  const { ref } = useSmoothFadeIn();

  return (
    <div ref={ref} className="stagger-children space-y-2">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="rounded-lg bg-white p-4 shadow-md animate-fade-in-up"
        >
          <h3 className="font-semibold">{invoice.number}</h3>
          <p className="text-gray-600">${invoice.amount}</p>
        </div>
      ))}
    </div>
  );
}
```

### Animated Modal

```typescript
// components/animated-modal.tsx
'use client';

import { useState } from 'react';
import { useSmoothFadeIn } from '@/lib/ui/smoothness';

export function AnimatedModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { ref } = useSmoothFadeIn();

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all ${
        isOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        ref={ref}
        className={`rounded-lg bg-white p-6 shadow-xl transition-all ${
          isOpen ? 'animate-scale-in' : 'animate-scale-out'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold">Dialog Title</h2>
        <p className="mb-6 text-gray-600">Dialog content goes here</p>
        <button
          onClick={onClose}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
```

### Dashboard with Multiple Animations

```typescript
// app/dashboard/page.tsx
'use client';

import { useSmoothFadeIn, useIntersectionAnimation, useSmoothCountUp } from '@/lib/ui/smoothness';

export default function Dashboard() {
  const { ref: headerRef } = useSmoothFadeIn();
  const { ref: statsRef, isVisible: statsVisible } = useIntersectionAnimation({ threshold: 0.3 });
  const invoiceCount = useSmoothCountUp(statsVisible ? 1250 : 0, 1000);
  const revenueCount = useSmoothCountUp(statsVisible ? 45000 : 0, 1500);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div ref={headerRef} className="animate-fade-in-up">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back!</p>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid gap-4 md:grid-cols-3">
        <div className={`rounded-lg bg-white p-6 shadow ${statsVisible ? 'animate-fade-in-up' : ''}`}>
          <p className="text-gray-600">Total Invoices</p>
          <p className="mt-2 text-3xl font-bold">{Math.round(invoiceCount)}</p>
        </div>

        <div className={`rounded-lg bg-white p-6 shadow ${statsVisible ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.1s' }}>
          <p className="text-gray-600">Revenue</p>
          <p className="mt-2 text-3xl font-bold">${Math.round(revenueCount)}</p>
        </div>

        <div className={`rounded-lg bg-white p-6 shadow ${statsVisible ? 'animate-fade-in-up' : ''}`} style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-600">Pending</p>
          <p className="mt-2 text-3xl font-bold">12</p>
        </div>
      </div>
    </div>
  );
}
```

## Accessibility

All animations respect the user's motion preferences:

```typescript
// Automatically respects prefers-reduced-motion
// Users with motion sensitivity will see instant transitions instead of animations

// Manual implementation:
function reduceMotionQuery() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

## Performance Tips

1. **Use CSS animations for simple effects** - Better performance than JS
2. **Lazy load heavy animations** - Use Suspense and lazy()
3. **Memoize animation components** - Use React.memo()
4. **Test on slow devices** - Ensure animations are smooth on older devices
5. **Monitor performance metrics** - Use devTools to check frame rate

## Common Patterns

### Loading State

```typescript
const [isLoading, setIsLoading] = useState(true);

return (
  <div>
    {isLoading ? (
      <div className="space-y-4 animate-pulse">
        <div className="h-12 rounded bg-gray-200" />
        <div className="h-12 rounded bg-gray-200" />
      </div>
    ) : (
      <div className="animate-fade-in-up">Content loaded</div>
    )}
  </div>
);
```

### Error Animation

```typescript
const [error, setError] = useState<string | null>(null);

return (
  <div>
    {error && (
      <div className="animate-shake rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    )}
  </div>
);
```

### Success Message

```typescript
const [success, setSuccess] = useState(false);

setTimeout(() => setSuccess(false), 3000);

return (
  <div>
    {success && (
      <div className="animate-fade-in-up rounded-lg border-l-4 border-green-500 bg-green-50 p-4 text-green-700">
        Success!
      </div>
    )}
  </div>
);
```

## Easing Functions

Available easing functions for custom animations:

- `easeLinear` - Constant speed
- `easeInQuad` - Slow start
- `easeOutQuad` - Slow end
- `easeInOutQuad` - Slow start and end
- `easeInCubic` - Fast acceleration
- `easeOutCubic` - Fast deceleration
- `easeInOutCubic` - Both
- `easeInQuart` - Very fast acceleration
- `easeOutQuart` - Very fast deceleration
- `easeInOutQuart` - Both

## Animation Duration Constants

```typescript
import { DURATIONS } from '@/lib/ui/smoothness';

// Available durations:
// DURATIONS.FAST = 150
// DURATIONS.NORMAL = 300
// DURATIONS.SLOW = 500
// DURATIONS.SLOWER = 800
// DURATIONS.SLOWEST = 1000
```

## Troubleshooting

### Animation Not Triggering

```typescript
// Make sure ref is attached to DOM element
const { ref } = useSmoothFadeIn();

// ✅ Correct
return <div ref={ref}>Content</div>;

// ❌ Wrong - ref not attached
return <div>{content}</div>;
```

### Animation Stuttering

```typescript
// Use will-change to optimize
<div className="will-change-transform animate-fade-in-up">
  Content
</div>
```

### Accessibility Issues

```typescript
// Always check prefers-reduced-motion in tests
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

## References

- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [React Animations Best Practices](https://react.dev/reference/react-dom/useTransition)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Animation Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Last Updated**: 2024
**Version**: 1.0.0
