import { Send, Mic } from 'lucide-react';
const MultiModalInput = ({ onSendMessage, onVoiceClick, disabled, placeholder }: any) => {
  return (
    <div className="flex items-center gap-2">
      <input 
        type="text" 
        placeholder={placeholder || "הקלד הודעה..."}
        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
      />
      <button onClick={onVoiceClick} className="p-3 rounded-xl hover:bg-white/10 text-gray-400">
        <Mic className="w-5 h-5" />
      </button>
      <button className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white">
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};
export default MultiModalInput;