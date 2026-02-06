import { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';

// Universal Page Loader Component
export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
            <div className="relative">
                {/* Outer ring */}
                <div className="w-12 h-12 rounded-full border-2 border-teal-100" />
                {/* Spinning ring */}
                <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-teal-600 animate-spin" />
                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                </div>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-400">Loading...</p>
        </div>
    );
}

// Page Transition Wrapper - wraps page content with smooth fade/slide animation
interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
            {children}
        </div>
    );
}

// HOC to wrap components with PageTransition
export function withPageTransition<P extends object>(
    Component: ComponentType<P>
): ComponentType<P> {
    return function WrappedComponent(props: P) {
        return (
            <PageTransition>
                <Component {...props} />
            </PageTransition>
        );
    };
}

// Lazy load wrapper with built-in Suspense
export function lazyWithLoader<P extends object>(
    factory: () => Promise<{ default: ComponentType<P> }>
): ComponentType<P> {
    const LazyComponent = lazy(factory);
    return function LazyWithLoader(props: P) {
        return (
            <Suspense fallback={<PageLoader />}>
                <PageTransition>
                    <LazyComponent {...props} />
                </PageTransition>
            </Suspense>
        );
    };
}

