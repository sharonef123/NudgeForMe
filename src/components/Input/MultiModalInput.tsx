import { useState, useRef, KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, Image, Paperclip, X, Loader2 } from 'lucide-react';

interface MultiModalInputProps {
  onSendMessage: (text: string, attachments?: File[]) => void;
  onVoiceClick: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const MultiModalInput = ({ 
  onSendMessage, 
  onVoiceClick, 
  disabled = false,
  placeholder 
}: MultiModalInputProps) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || disabled) return;

    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        window.notify?.error(t('multimodal.fileTooBig', { name: file.name }));
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = \\px\;
    setText(target.value);
  };

  return (
    <div className="space-y-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="relative group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
            >
              {file.type.startsWith('image/') ? (
                <Image className="w-4 h-4 text-emerald-400" />
              ) : (
                <Paperclip className="w-4 h-4 text-blue-400" />
              )}
              <span className="text-sm text-white truncate max-w-[150px]">
                {file.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-red-400 hover:text-red-300" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        className={\elative rounded-2xl border-2 transition-all \\}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={autoResize}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('chat.placeholder')}
          disabled={disabled}
          className="w-full px-4 py-4 bg-transparent text-white placeholder-gray-500 
                   resize-none outline-none min-h-[56px] max-h-[200px]"
          rows={1}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            {/* Voice Button */}
            <button
              onClick={onVoiceClick}
              disabled={disabled}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-emerald-400 
                       transition-colors disabled:opacity-50"
              title={t('voice.voiceMode')}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Image Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-blue-400 
                       transition-colors disabled:opacity-50"
              title={t('multimodal.attachImage')}
            >
              <Image className="w-5 h-5" />
            </button>

            {/* File Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-purple-400 
                       transition-colors disabled:opacity-50"
              title={t('multimodal.attachFile')}
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || (!text.trim() && attachments.length === 0)}
            className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 
                     hover:shadow-lg hover:shadow-emerald-500/50 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {disabled ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Hint */}
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-500">
            {t('multimodal.enterToSend')} • {t('multimodal.shiftEnterNewLine')}
          </p>
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-2xl pointer-events-none">
          <p className="text-emerald-300 text-lg font-medium">
            📁 {t('multimodal.uploading')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MultiModalInput;