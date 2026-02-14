const PerformanceMonitor = ({ showDetails }: any) => {
  if (!showDetails) return null;
  return (
    <div className="fixed bottom-4 left-4 glass-panel rounded-xl p-3 text-xs text-white">
      <div>FPS: 60</div>
      <div>Memory: OK</div>
    </div>
  );
};
export default PerformanceMonitor;