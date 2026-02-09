import { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { Loader } from './Loader';

// Universal Page Loader Component
export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
            <Loader size="md" text="Loading..." />
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

