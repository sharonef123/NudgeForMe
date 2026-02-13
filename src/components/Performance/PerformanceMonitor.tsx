import { useState, useEffect } from 'react';
import { Activity, Zap, Database, Wifi } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  loadTime: number;
  apiLatency: number;
  cacheHitRate: number;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
}

const PerformanceMonitor = ({ showDetails = false }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    loadTime: 0,
    apiLatency: 0,
    cacheHitRate: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const isDev = import.meta.env.DEV;
    const enabled = localStorage.getItem('performance-monitor-enabled') === 'true';
    setIsVisible(isDev || enabled);

    if (!isDev && !enabled) return;

    // Measure FPS
    let lastTime = performance.now();
    let frames = 0;
    let fpsInterval: number;

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const currentFPS = Math.round((frames * 1000) / elapsed);
        setMetrics(prev => ({ ...prev, fps: currentFPS }));
        frames = 0;
        lastTime = currentTime;
      }

      fpsInterval = requestAnimationFrame(measureFPS);
    };

    fpsInterval = requestAnimationFrame(measureFPS);

    // Measure memory (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        const usedMB = Math.round(mem.usedJSHeapSize / 1048576);
        setMetrics(prev => ({ ...prev, memory: usedMB }));
      }
    };

    const memoryInterval = setInterval(measureMemory, 2000);

    // Measure load time
    const loadTime = Math.round(performance.now());
    setMetrics(prev => ({ ...prev, loadTime }));

    // Monitor navigation timing
    if (performance.getEntriesByType) {
      const navTiming = performance.getEntriesByType('navigation')[0] as any;
      if (navTiming) {
        const loadTime = Math.round(navTiming.loadEventEnd - navTiming.fetchStart);
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    }

    return () => {
      cancelAnimationFrame(fpsInterval);
      clearInterval(memoryInterval);
    };
  }, []);

  // Track API latency
  useEffect(() => {
    const originalFetch = window.fetch;
    const latencies: number[] = [];

    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        latencies.push(latency);
        if (latencies.length > 10) latencies.shift();
        
        const avgLatency = Math.round(
          latencies.reduce((a, b) => a + b, 0) / latencies.length
        );
        setMetrics(prev => ({ ...prev, apiLatency: avgLatency }));
        
        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  if (!isVisible) return null;

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return 'text-red-400';
    if (value < thresholds[1]) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 glass-panel rounded-xl p-3 text-xs" dir="ltr">
      {showDetails ? (
        <div className="space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between text-white font-medium mb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Performance</span>
            </div>
            <button
              onClick={() => localStorage.setItem('performance-monitor-enabled', 'false')}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* FPS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-300">FPS</span>
            </div>
            <span className={getStatusColor(metrics.fps, [30, 50])}>
              {metrics.fps}
            </span>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-400" />
              <span className="text-gray-300">Memory</span>
            </div>
            <span className="text-gray-300">
              {metrics.memory} MB
            </span>
          </div>

          {/* Load Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-purple-400" />
              <span className="text-gray-300">Load</span>
            </div>
            <span className="text-gray-300">
              {metrics.loadTime} ms
            </span>
          </div>

          {/* API Latency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-gray-300">API</span>
            </div>
            <span className={getStatusColor(metrics.apiLatency > 0 ? 1000 - metrics.apiLatency : 1000, [200, 500])}>
              {metrics.apiLatency || '-'} ms
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className={getStatusColor(metrics.fps, [30, 50])}>
              {metrics.fps}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">{metrics.memory}MB</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;