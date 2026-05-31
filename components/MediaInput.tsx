"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, Send, X, Image as ImageIcon, FileText, Loader2 } from "lucide-react";

type AttachedFile = {
  id: string;
  name: string;
  type: "image" | "file";
  url?: string;
};

export default function MediaInput() {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
      // Logic to save/process recording would go here
    } else {
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleFileClick = () => fileInputRef.current?.click();
  const handlePhotoClick = () => photoInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newFiles = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type,
        url: type === "image" ? URL.createObjectURL(file) : undefined,
      }));
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      setIsUploading(false);
    }, 800);
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    if (!text.trim() && attachedFiles.length === 0) return;
    // Logic to send message
    setText("");
    setAttachedFiles([]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
      {/* Attachments Preview Area */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="flex flex-wrap gap-2 px-2"
          >
            {attachedFiles.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group flex items-center gap-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-xl p-2 pr-8 shadow-sm max-w-[200px]"
              >
                {file.type === "image" && file.url ? (
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-black/20">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md shrink-0 bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                )}
                <span className="text-sm font-medium truncate">{file.name}</span>
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Container */}
      <div className="relative glass-panel rounded-2xl p-2 flex items-end gap-2 shadow-2xl transition-all duration-300 focus-within:border-[hsl(var(--ring))/0.5] focus-within:shadow-[0_0_20px_hsl(var(--ring))/0.15]">
        
        {/* Hidden inputs */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => handleFileChange(e, "file")} 
        />
        <input 
          type="file" 
          accept="image/*" 
          ref={photoInputRef} 
          className="hidden" 
          onChange={(e) => handleFileChange(e, "image")} 
        />

        <div className="flex flex-col gap-1 pb-1">
          <button 
            onClick={handlePhotoClick}
            className="p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
            title="Upload Photo"
          >
            <ImageIcon size={20} />
          </button>
          <button 
            onClick={handleFileClick}
            className="p-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
            title="Upload File"
          >
            <Paperclip size={20} />
          </button>
        </div>

        <div className="flex-1 relative min-h-[52px] flex items-center">
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 w-full px-4 h-full"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 recording-pulse" />
                <span className="text-sm font-medium text-red-500">Recording audio...</span>
                <span className="text-sm font-mono ml-auto text-[hsl(var(--muted-foreground))]">{formatTime(recordingTime)}</span>
              </motion.div>
            ) : (
              <motion.textarea
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-transparent border-none outline-none resize-none px-3 py-3.5 max-h-[150px] min-h-[52px] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[hsl(var(--border))] [&::-webkit-scrollbar-thumb]:rounded-full"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 pb-1">
          {isUploading ? (
            <div className="p-3">
              <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : (
            <>
              {text.length === 0 && attachedFiles.length === 0 ? (
                <button 
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isRecording 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 recording-pulse" 
                      : "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] shadow-md hover:shadow-[0_0_15px_hsl(var(--primary))/0.4]"
                  }`}
                >
                  <Mic size={20} className={isRecording ? "animate-pulse" : ""} />
                </button>
              ) : (
                <button 
                  onClick={handleSend}
                  className="p-3 rounded-xl bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-hover))] transition-all shadow-md hover:shadow-[0_0_15px_hsl(var(--primary))/0.4]"
                >
                  <Send size={20} className="translate-x-[1px] translate-y-[-1px]" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
