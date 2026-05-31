'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Paperclip, Send, X,
  Image as ImageIcon, FileText, Loader2, Volume2,
} from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type AttachedFile = {
  id: string;
  name: string;
  type: 'image' | 'file';
  url?: string;
};

export default function MediaInput() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send / Groq streaming ──────────────────────────────────────────────────

  const handleSend = async () => {
    const content = input.trim();
    if (!content && attachedFiles.length === 0) return;

    const userContent = attachedFiles.length > 0
      ? `${content}${content ? '\n' : ''}[Attachments: ${attachedFiles.map(f => f.name).join(', ')}]`
      : content;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: userContent };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error('Chat failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: full } : m)
        );
      }

      // Push notification (fire-and-forget)
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Recibo', body: 'Your message was processed.' }),
      }).catch(() => {});
    } catch (err) {
      console.error('[Chat]', err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, content: 'Something went wrong — please try again.' } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Voice recording → ElevenLabs STT ──────────────────────────────────────

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const form = new FormData();
          form.append('audio', blob, 'recording.webm');
          const res = await fetch('/api/transcribe', { method: 'POST', body: form });
          const { text } = await res.json();
          if (text) setInput(prev => prev ? `${prev} ${text}` : text);
        } catch (err) {
          console.error('[Transcribe]', err);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('[Mic]', err);
    }
  };

  // ── ElevenLabs TTS playback ────────────────────────────────────────────────

  const playTTS = async (messageId: string, text: string) => {
    if (playingId === messageId) return;
    setPlayingId(messageId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlayingId(null); URL.revokeObjectURL(url); };
      audio.play();
    } catch (err) {
      console.error('[TTS]', err);
      setPlayingId(null);
    }
  };

  // ── File attachment ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setTimeout(() => {
      const newFiles = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type,
        url: type === 'image' ? URL.createObjectURL(file) : undefined,
      }));
      setAttachedFiles(prev => [...prev, ...newFiles]);
      setIsUploading(false);
    }, 400);
    e.target.value = '';
  };

  const removeFile = (id: string) => setAttachedFiles(prev => prev.filter(f => f.id !== id));

  const isBusy = isLoading || isTranscribing || isUploading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 w-full max-w-3xl mx-auto gap-3 min-h-0">

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-1 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm select-none">
            Ask anything, record your voice, or attach a file.
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[hsl(var(--primary))] text-white rounded-br-sm'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-bl-sm'
              }`}
            >
              {msg.content || (
                <span className="opacity-40 animate-pulse">Thinking…</span>
              )}
              {msg.role === 'assistant' && msg.content && (
                <button
                  onClick={() => playTTS(msg.id, msg.content)}
                  title="Read aloud"
                  className={`absolute -bottom-3 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                    playingId === msg.id
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--primary))] hover:text-white'
                  }`}
                >
                  <Volume2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment previews */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 px-1"
          >
            {attachedFiles.map(file => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group flex items-center gap-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl p-2 pr-8 max-w-50"
              >
                {file.type === 'image' && file.url ? (
                  <div className="w-8 h-8 rounded-md overflow-hidden shrink-0">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-md shrink-0 bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                )}
                <span className="text-xs font-medium truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="relative glass-panel rounded-2xl p-2 flex items-end gap-2 shadow-2xl transition-all duration-300 focus-within:border-[hsl(var(--ring))/0.5] focus-within:shadow-[0_0_20px_hsl(var(--ring))/0.15]">
        <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFileChange(e, 'file')} />
        <input type="file" accept="image/*" ref={photoInputRef} className="hidden" onChange={e => handleFileChange(e, 'image')} />

        {/* Left toolbar */}
        <div className="flex flex-col gap-1 pb-1">
          <button
            onClick={() => photoInputRef.current?.click()}
            disabled={isBusy}
            className="p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors disabled:opacity-40"
            title="Upload Photo"
          >
            <ImageIcon size={20} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors disabled:opacity-40"
            title="Upload File"
          >
            <Paperclip size={20} />
          </button>
        </div>

        {/* Text area / status */}
        <div className="flex-1 min-h-13 flex items-center">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 w-full px-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium text-red-500">Recording… tap mic to stop</span>
              </motion.div>
            ) : isTranscribing ? (
              <motion.div key="transcribing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-4">
                <Loader2 size={16} className="animate-spin text-[hsl(var(--primary))]" />
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Transcribing…</span>
              </motion.div>
            ) : (
              <motion.textarea
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type a message…"
                disabled={isBusy}
                className="w-full bg-transparent border-none outline-none resize-none px-3 py-3.5 max-h-37.5 min-h-13 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] overflow-y-auto disabled:opacity-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[hsl(var(--border))] [&::-webkit-scrollbar-thumb]:rounded-full"
                rows={1}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right action button */}
        <div className="flex gap-1 pb-1">
          {isBusy ? (
            <div className="p-3"><Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" /></div>
          ) : input.trim() || attachedFiles.length > 0 ? (
            <button
              onClick={handleSend}
              className="p-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] transition-all shadow-md hover:shadow-[0_0_15px_hsl(var(--primary))/0.4]"
            >
              <Send size={20} className="translate-x-px -translate-y-px" />
            </button>
          ) : (
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                  : 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] shadow-md hover:shadow-[0_0_15px_hsl(var(--primary))/0.4]'
              }`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
