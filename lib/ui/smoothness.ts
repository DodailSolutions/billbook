'use client'

/**
 * UI Smoothness and Animation Utilities
 * Provides smooth transitions, animations, and performance optimizations
 */

import { useEffect, useRef, useCallback, useState } from 'react'

// ============================================================================
// SMOOTH SCROLL
// ============================================================================

export function scrollToElement(elementId: string, behavior: 'smooth' | 'auto' = 'smooth') {
    const element = document.getElementById(elementId)
    if (element) {
        element.scrollIntoView({ behavior, block: 'start' })
    }
}

export function scrollToTop(behavior: 'smooth' | 'auto' = 'smooth') {
    window.scrollTo({ top: 0, behavior })
}

// ============================================================================
// SMOOTH VISIBILITY TRANSITIONS
// ============================================================================

export function useSmootFadeIn(options = { duration: 300, delay: 0 }) {
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const element = ref.current
        if (!element) return
        
        element.style.opacity = '0'
        element.style.transition = `opacity ${options.duration}ms ease-in-out`
        
        const timer = setTimeout(() => {
            element.style.opacity = '1'
        }, options.delay)
        
        return () => clearTimeout(timer)
    }, [options.duration, options.delay])
    
    return ref
}

export function useSmoothSlideIn(
    direction: 'up' | 'down' | 'left' | 'right' = 'up',
    options = { duration: 300, delay: 0, distance: 20 }
) {
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const element = ref.current
        if (!element) return
        
        const transforms: Record<string, string> = {
            up: `translateY(${options.distance}px)`,
            down: `translateY(-${options.distance}px)`,
            left: `translateX(${options.distance}px)`,
            right: `translateX(-${options.distance}px)`,
        }
        
        element.style.opacity = '0'
        element.style.transform = transforms[direction]
        element.style.transition = `all ${options.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
        
        const timer = setTimeout(() => {
            element.style.opacity = '1'
            element.style.transform = 'translateX(0) translateY(0)'
        }, options.delay)
        
        return () => clearTimeout(timer)
    }, [direction, options.duration, options.delay, options.distance])
    
    return ref
}

// ============================================================================
// INTERSECTION OBSERVER FOR LAZY ANIMATIONS
// ============================================================================

export function useIntersectionAnimation(options = { threshold: 0.1 }) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true)
                observer.unobserve(entry.target)
            }
        }, options)
        
        const node = ref.current
        if (node) {
            observer.observe(node)
        }
        
        return () => {
            if (node) {
                observer.unobserve(node)
            }
        }
    }, [options])
    
    return { ref, isVisible }
}

// ============================================================================
// SMOOTH HEIGHT TRANSITION
// ============================================================================

export function useSmoothHeight() {
    const ref = useRef<HTMLDivElement>(null)
    
    const setHeight = useCallback((height: number | 'auto') => {
        if (!ref.current) return
        
        ref.current.style.height = typeof height === 'number' ? `${height}px` : height
    }, [])
    
    const measureAndSetHeight = useCallback(() => {
        if (!ref.current) return
        
        ref.current.style.height = 'auto'
        const height = ref.current.clientHeight
        ref.current.style.height = `${height}px`
    }, [])
    
    useEffect(() => {
        const element = ref.current
        if (!element) return
        
        element.style.transition = 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)'
    }, [])
    
    return { ref, setHeight, measureAndSetHeight }
}

// ============================================================================
// RIPPLE EFFECT
// ============================================================================

export function useRippleEffect() {
    const ref = useRef<HTMLDivElement>(null)
    
    const createRipple = useCallback((event: React.MouseEvent) => {
        const button = ref.current
        if (!button) return
        
        const circle = document.createElement('span')
        const diameter = Math.max(button.clientWidth, button.clientHeight)
        const radius = diameter / 2
        
        circle.style.width = circle.style.height = `${diameter}px`
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`
        circle.classList.add('ripple')
        
        button.appendChild(circle)
        
        setTimeout(() => {
            circle.remove()
        }, 600)
    }, [])
    
    return { ref, createRipple }
}

// ============================================================================
// SMOOTH NUMBER ANIMATION
// ============================================================================

export function useSmoothCountUp(target: number, options = { duration: 1000, delay: 0 }) {
    const [count, setCount] = useState(0)
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const element = ref.current
        if (!element) return
        
        // Use Intersection Observer to start animation only when visible
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                const startTime = Date.now() + options.delay
                const animationDuration = options.duration
                
                const animate = () => {
                    const now = Date.now()
                    const elapsed = Math.min(now - startTime, animationDuration)
                    const progress = elapsed / animationDuration
                    
                    // Easing function: ease-out-quad
                    const easeProgress = 1 - (1 - progress) * (1 - progress)
                    const currentCount = Math.floor(target * easeProgress)
                    
                    setCount(currentCount)
                    
                    if (elapsed < animationDuration) {
                        requestAnimationFrame(animate)
                    } else {
                        setCount(target)
                    }
                }
                
                requestAnimationFrame(animate)
                observer.unobserve(element)
            }
        })
        
        observer.observe(element)
        
        return () => {
            if (element) {
                observer.unobserve(element)
            }
        }
    }, [target, options.duration, options.delay])
    
    return { ref, count }
}

// ============================================================================
// PAGE TRANSITION
// ============================================================================

export function useSmoothPageTransition() {
    const [isTransitioning, setIsTransitioning] = useState(false)
    
    const startTransition = useCallback(() => {
        setIsTransitioning(true)
        return new Promise((resolve) => {
            setTimeout(() => {
                setIsTransitioning(false)
                resolve(null)
            }, 300)
        })
    }, [])
    
    return { isTransitioning, startTransition }
}

// ============================================================================
// SCROLL-BASED ANIMATIONS
// ============================================================================

export function useScrollAnimation(
    options = { threshold: 0, rootMargin: '0px 0px -50px 0px' }
) {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting)
        }, options)
        
        const node = ref.current
        if (node) {
            observer.observe(node)
        }
        
        return () => {
            if (node) {
                observer.unobserve(node)
            }
        }
    }, [options])
    
    return { ref, isInView }
}

// ============================================================================
// GESTURE ANIMATIONS
// ============================================================================

export function useGestureAnimation() {
    const ref = useRef<HTMLDivElement>(null)
    const [scale] = useState(1)
    
    useEffect(() => {
        const element = ref.current
        if (!element) return
        
        const handleMouseEnter = () => {
            element.style.transform = 'scale(1.05)'
            element.style.transition = 'transform 200ms ease-out'
        }
        
        const handleMouseLeave = () => {
            element.style.transform = 'scale(1)'
        }
        
        element.addEventListener('mouseenter', handleMouseEnter)
        element.addEventListener('mouseleave', handleMouseLeave)
        
        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter)
            element.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])
    
    return { ref, scale }
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export function useSkeletonLoading(isLoading: boolean, options = { duration: 1000 }) {
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        if (!isLoading || !ref.current) return
        
        const element = ref.current
        element.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
        element.style.backgroundSize = '200% 100%'
        element.style.animation = `loading ${options.duration}ms infinite`
    }, [isLoading, options.duration])
    
    return ref
}

// ============================================================================
// SMOOTH TRANSITIONS CSS
// ============================================================================

export const smoothTransitionCSS = `
    * {
        scroll-behavior: smooth;
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
    
    .animate-fade-in {
        animation: fadeIn 300ms ease-in-out;
    }
    
    .animate-slide-in-up {
        animation: slideInUp 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-slide-in-down {
        animation: slideInDown 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-slide-in-left {
        animation: slideInLeft 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-slide-in-right {
        animation: slideInRight 400ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-scale-in {
        animation: scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    .animate-bounce {
        animation: bounce 1s infinite;
    }
    
    .transition-smooth {
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: rippleEffect 600ms ease-out;
        pointer-events: none;
    }
    
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`

// ============================================================================
// RENDER OPTIMIZATION
// ============================================================================

export function useDebugRenderCount(componentName: string) {
    const renderCount = useRef(0)
    
    useEffect(() => {
        renderCount.current++
        console.debug(`${componentName} rendered ${renderCount.current} times`)
    })
}

export function useOptimizedRef<T>(value: T) {
    const ref = useRef(value)
    
    useEffect(() => {
        ref.current = value
    }, [value])
    
    return ref
}

// ============================================================================
// ANIMATION TIMING
// ============================================================================

export const easing = {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
    easeInQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
    easeOutQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
    easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
    easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
    easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
}

export const durations = {
    instant: '0ms',
    fast: '100ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
}
