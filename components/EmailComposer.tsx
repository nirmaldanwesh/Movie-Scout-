import React, { useState, useEffect } from 'react';
import { EmailDraft } from '../types';
import { Button } from './Button';
import { Copy, Mail, Check, X } from 'lucide-react';

interface EmailComposerProps {
  draft: EmailDraft;
  onClose: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({ draft, onClose }) => {
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSubject(draft.subject);
    setBody(draft.body);
  }, [draft]);

  const handleCopy = () => {
    const fullText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMail = () => {
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-2xl mx-4 relative">
      <div className="bg-slate-100 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h3 className="text-slate-800 font-bold text-lg">Draft Email</h3>
        <div className="flex items-center space-x-2">
           <Button 
            variant="secondary" 
            size="sm" 
            className="!py-1 !px-3 !text-sm !bg-white !text-slate-600 hover:!bg-slate-50"
            onClick={handleCopy}
            icon={copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Message Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-sans"
          />
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
        <Button onClick={handleOpenMail} icon={<Mail className="w-4 h-4" />}>
          Open in Default Mail App
        </Button>
      </div>
    </div>
  );
};