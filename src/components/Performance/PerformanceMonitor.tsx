import { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Zap } from 'lucide-react';

interface PerformanceMonitorProps {
  showDetails?: boolean;
}

const PerformanceMonitor = ({ showDetails = false }: PerformanceMonitorProps) => {
  const [fps, setFps] = useState(60);
  const [memory, setMemory] = useState(0);
  const [isVisible, setIsVisible] = useState(showDetails);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round(frameCount * 1000 / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    const measureMemory = () => {
      if ((performance as any).memory) {
        const used = (performance as any).memory.usedJSHeapSize / 1048576;
        setMemory(Math.round(used));
      }
    };

    measureFPS();
    const memoryInterval = setInterval(measureMemory, 1000);

    // Keyboard shortcut to toggle
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(memoryInterval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[90] glass-panel rounded-xl border border-white/10 shadow-2xl p-3">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-white">Performance</span>
      </div>

      <div className="space-y-2">
        {/* FPS */}
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-gray-400">FPS:</span>
          <span className={\	ext-xs font-mono font-bold \\}>
            {fps}
          </span>
        </div>

        {/* Memory */}
        <div className="flex items-center gap-2">
          <HardDrive className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-gray-400">Memory:</span>
          <span className="text-xs font-mono font-bold text-blue-400">
            {memory} MB
          </span>
        </div>

        {/* Load Time */}
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-gray-400">Load:</span>
          <span className="text-xs font-mono font-bold text-purple-400">
            {Math.round(performance.now())} ms
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-white/10">
        <p className="text-[10px] text-gray-500 text-center">
          Ctrl+Shift+P to toggle
        </p>
      </div>
    </div>
  );
};

export default PerformanceMonitor;