import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import type { Message } from '../contexts/ConversationContext';

export const exportToText = (messages: Message[], title: string): void => {
  const text = messages
    .map((msg) => {
      const time = format(new Date(msg.timestamp), 'HH:mm', { locale: he });
      const role = msg.role === 'user' ? 'משתמש' : 'Nudge';
      return `[${time}] ${role}: ${msg.content}`;
    })
    .join('\n\n');

  const content = `${title}\n${'='.repeat(title.length)}\n\n${text}`;
  downloadFile(content, `${title}.txt`, 'text/plain');
};

export const exportToJSON = (messages: Message[], title: string): void => {
  const data = {
    title,
    exportedAt: new Date().toISOString(),
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
    })),
  };

  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `${title}.json`, 'application/json');
};

export const exportToMarkdown = (messages: Message[], title: string): void => {
  const markdown = messages
    .map((msg) => {
      const time = format(new Date(msg.timestamp), 'dd/MM/yyyy HH:mm', { locale: he });
      const role = msg.role === 'user' ? '👤 **משתמש**' : '🤖 **Nudge**';
      return `### ${role}\n*${time}*\n\n${msg.content}\n`;
    })
    .join('\n---\n\n');

  const content = `# ${title}\n\n${markdown}`;
  downloadFile(content, `${title}.md`, 'text/markdown');
};

export const exportToHTML = (messages: Message[], title: string): void => {
  const messagesHTML = messages
    .map((msg) => {
      const time = format(new Date(msg.timestamp), 'HH:mm', { locale: he });
      const role = msg.role === 'user' ? 'משתמש' : 'Nudge';
      const bgColor = msg.role === 'user' ? '#10b981' : '#3b82f6';
      
      return `
        <div style="margin-bottom: 20px; padding: 15px; border-radius: 12px; background: ${bgColor}20; border-left: 4px solid ${bgColor};">
          <div style="font-weight: bold; color: ${bgColor}; margin-bottom: 5px;">
            ${role} <span style="font-size: 12px; color: #666;">${time}</span>
          </div>
          <div style="white-space: pre-wrap;">${msg.content}</div>
        </div>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #10b981;
      padding-bottom: 10px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p style="color: #666; font-size: 14px;">
    יוצא ב-${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: he })}
  </p>
  ${messagesHTML}
</body>
</html>
  `;

  downloadFile(html, `${title}.html`, 'text/html');
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareConversation = async (messages: Message[], title: string): Promise<void> => {
  const text = messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'משתמש' : 'Nudge';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: text,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(text);
    window.notify?.success('הועתק ללוח', 'השיחה הועתקה ללוח');
  }
};