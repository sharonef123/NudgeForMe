import { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  fallback?: React.ReactNode;
}

// Default loading component
const DefaultLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      <p className="text-sm text-gray-400">טוען...</p>
    </div>
  </div>
);

// Lazy load wrapper with error boundary
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={fallback || <DefaultLoader />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Image lazy loading component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

export const LazyImage = ({ src, alt, className = '', onLoad }: LazyImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onLoad={onLoad}
    />
  );
};

// Intersection Observer based lazy load
interface IntersectionLazyLoadProps {
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

export const IntersectionLazyLoad = ({
  children,
  className = '',
  rootMargin = '50px',
  threshold = 0.1,
}: IntersectionLazyLoadProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : <DefaultLoader />}
    </div>
  );
};

export default lazyLoad;