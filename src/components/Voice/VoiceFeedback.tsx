import { CheckCircle2, AlertCircle, Loader2, Mic, MicOff } from 'lucide-react';

export type FeedbackStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'success' | 'error';

interface VoiceFeedbackProps {
  status: FeedbackStatus;
  message?: string;
  className?: string;
}

const VoiceFeedback = ({ status, message, className = '' }: VoiceFeedbackProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'listening':
        return {
          icon: <Mic className="w-6 h-6" />,
          text: message || 'מאזין...',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          animation: 'animate-pulse'
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          text: message || 'מעבד...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          animation: ''
        };
      case 'speaking':
        return {
          icon: <Mic className="w-6 h-6" />,
          text: message || 'מדבר...',
          color: 'text-purple-400',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          animation: 'animate-pulse'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6" />,
          text: message || 'הושלם!',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          animation: ''
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: message || 'שגיאה',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          animation: ''
        };
      case 'idle':
      default:
        return {
          icon: <MicOff className="w-6 h-6" />,
          text: message || 'מוכן',
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
          animation: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        border backdrop-blur-xl
        ${config.bgColor} ${config.borderColor} ${config.animation}
        transition-all duration-300
        ${className}
      `}
      role="status"
      aria-live="polite"
    >
      <div className={`${config.color}`}>
        {config.icon}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};

export default VoiceFeedback;