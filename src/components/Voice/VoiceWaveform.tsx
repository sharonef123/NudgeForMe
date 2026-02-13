import { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  isRecording: boolean;
  audioStream: MediaStream | null;
  className?: string;
}

const VoiceWaveform = ({ isRecording, audioStream, className = '' }: VoiceWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!audioStream || !isRecording) {
      // Stop animation when not recording
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    // Setup audio analysis
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    // Animation loop
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
      
      animationRef.current = requestAnimationFrame(draw);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // slate-900 with opacity
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate bar dimensions
      const barCount = 32; // Number of bars
      const barWidth = canvas.width / barCount;
      const maxBarHeight = canvas.height;

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Average multiple frequency bins for smoother visualization
        const dataIndex = Math.floor((i * bufferLength) / barCount);
        const value = dataArrayRef.current[dataIndex] || 0;
        
        // Normalize and amplify
        const normalizedValue = value / 255;
        const barHeight = normalizedValue * maxBarHeight * 0.8; // Max 80% of canvas height

        // Create gradient from emerald to blue
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#10B981'); // emerald-500
        gradient.addColorStop(0.5, '#3B82F6'); // blue-500
        gradient.addColorStop(1, '#6366F1'); // indigo-500

        // Draw bar from bottom up
        const x = i * barWidth;
        const y = canvas.height - barHeight;
        const roundedBarWidth = barWidth * 0.7; // 70% width with gaps

        // Rounded rectangle
        const radius = roundedBarWidth / 2;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
          x + (barWidth - roundedBarWidth) / 2,
          y,
          roundedBarWidth,
          barHeight,
          [radius, radius, 0, 0]
        );
        ctx.fill();

        // Add glow effect for higher values
        if (normalizedValue > 0.5) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#10B981';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    draw();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      audioContext.close();
    };
  }, [isRecording, audioStream]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-full rounded-xl"
        style={{ 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)'
        }}
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400 text-sm">מחכה להקלטה...</p>
        </div>
      )}
    </div>
  );
};

export default VoiceWaveform;