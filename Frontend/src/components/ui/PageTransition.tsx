import { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { Loader } from './Loader';

// Content-level Loader — centers within its parent container
export function ContentLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div
            className="flex flex-col items-center justify-center w-full animate-in fade-in duration-500"
            style={{
                minHeight: 'calc(100vh - 120px)', // Centering in content area (viewport - header - some buffer)
            }}
        >
            <Loader size="md" variant="indigo" text={text} />
        </div>
    );
}

// Global Loader — perfectly centered in the viewport, but intended for full-page states
// Keeping it for cases where we DO want a full-screen overlay (like initial auth check)
export function GlobalLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
            }}
        >
            <Loader size="md" variant="indigo" text={text} />
        </div>
    );
}

// Universal Page Loader for Suspense fallback
export function PageLoader() {
    return null;
}

// Page Transition Wrapper
interface PageTransitionProps {
    children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
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
