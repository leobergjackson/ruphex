'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, ShieldCheck, CheckCircle2, Mic, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { encodeInvoice } from '@/lib/invoiceCodec';
import { saveInvoice } from '@/lib/invoiceStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import GoogleTranslate from '@/components/GoogleTranslate';
import { QRCodeSVG } from 'qrcode.react';
import PushOptIn from '@/components/PushOptIn';

export default function Landing() {
  const [invoiceText, setInvoiceText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [clientName, setClientName] = useState('');
  const [amountUSD, setAmountUSD] = useState(0);
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { address } = useAccount();

  const handleGenerate = useCallback(async () => {
    if (!invoiceText.trim()) {
      toast.error('Please paste some invoice details first.');
      return;
    }
    if (!address) {
      toast.error('Please connect your wallet first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceText }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      
      const parsedClient = data.clientName || 'Unknown Client';
      const parsedAmount = parseFloat(data.amountUSD) || 0;
      const parsedDesc = data.description || 'Invoice Payment';
      const parsedEmail = data.clientEmail || '';
      const parsedDueDate = data.dueDate || '';
      
      setClientName(parsedClient);
      setAmountUSD(parsedAmount);
      setDescription(parsedDesc);

      const id = uuidv4();
      const amountUSDC = BigInt(Math.round(parsedAmount * 1_000_000)).toString();
      
      const payload = {
        id, 
        to: address,
        amount: amountUSDC,
        amountDisplay: `$${parsedAmount.toFixed(2)}`,
        desc: parsedDesc.slice(0, 80),
        client: parsedClient,
        due: parsedDueDate,
      };
      
      const encoded = encodeInvoice(payload);
      const link = `${window.location.origin}/pay?d=${encoded}`;
      
      saveInvoice({
        id, 
        clientName: parsedClient, 
        clientEmail: parsedEmail, 
        description: parsedDesc,
        amountUSD: parsedAmount, 
        amountUSDC,
        dueDate: parsedDueDate, 
        freelancerAddress: address,
        status: 'pending', 
        createdAt: new Date().toISOString(),
        paymentURL: link,
      });
      
      setUrl(link);
      setStep(2);
      toast.success('Smart link generated successfully!');
      
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
      setAttachedFiles([]);
    }
  }, [invoiceText, address]);

  const recognitionRef = useRef<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // or allow it to use browser default
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setInvoiceText((prev) => prev + (prev ? ' ' : '') + finalTranscript.trim());
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          toast.error('Voice recording error: ' + event.error);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      toast.success('Voice recording stopped.');
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          toast.info('Recording started... Please speak.');
        } catch (e) {
          console.error(e);
        }
      } else {
        toast.error('Speech recognition is not supported in this browser.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...filesArray]);
      toast.success(`${filesArray.length} file(s) attached.`);
    }
  };

  const handleCopyLink = useCallback(async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast.success('Payment link copied to clipboard!');
  }, [url]);

  return (
    <main className="grain min-h-screen flex flex-col font-[var(--font-jakarta)] relative text-stone-900 bg-[#FFF9F0]">
      <nav className="flex items-center justify-between px-6 py-4 relative z-10 w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B6B] border-2 border-stone-900 flex items-center justify-center text-white shadow-[2px_2px_0px_#2D2323]">
            R
          </div>
          Recibo
        </Link>
        <div className="flex items-center gap-4">
          <GoogleTranslate />
          <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-3xl mx-auto text-center">
        
        <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-400 border-2 border-stone-900 text-stone-900 font-semibold text-sm mb-6 shadow-[3px_3px_0px_#2D2323]">
          AI-Powered Payments for LATAM
        </p>
        
        <h1 className="page-title mb-6 leading-tight">
          Get Paid in <span className="text-accent">USDC</span>, Instantly.
        </h1>
        
        <p className="text-stone-900/65 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Turn any client email or PDF into an instant crypto payment link. No banks, no 8% fees.
        </p>

        <div className="module-card w-full p-6 md:p-8 text-left relative overflow-hidden bg-white">
          {step === 1 ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B6B]">
                  <Bot size={18} />
                  <span>AI Invoice Parser</span>
                </div>
                {!address && (
                  <span className="text-xs font-semibold text-stone-900 bg-yellow-400 px-2 py-1 rounded-md border border-stone-900">
                    Wallet required to receive funds
                  </span>
                )}
              </div>
              
              <div className="relative">
                <textarea 
                  className="w-full h-40 p-4 pb-14 bg-amber-50 border-2 border-stone-900 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 transition-all text-stone-900"
                  placeholder="Paste invoice details, client email, or terms here..."
                  value={invoiceText}
                  onChange={(e) => setInvoiceText(e.target.value)}
                />
                
                {/* Embedded Actions */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    multiple
                  />
                  <button 
                    type="button" 
                    onClick={handleVoiceRecording}
                    className={`p-2 bg-white border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#2D2323] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#2D2323] transition-all text-stone-900 ${isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'hover:text-[#FF6B6B]'}`}
                    title={isRecording ? "Stop Recording" : "Record Voice"}
                  >
                    <Mic size={16} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#2D2323] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_#2D2323] transition-all text-stone-900 hover:text-[#FF6B6B]" 
                    title="Upload File"
                  >
                    <Paperclip size={16} />
                  </button>
                  
                  {attachedFiles.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-white border-2 border-stone-900 rounded-lg shadow-[2px_2px_0px_#2D2323] text-xs font-bold text-stone-900 ml-1">
                      {attachedFiles.length} file(s)
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !address}
                className="btn-primary w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_#2D2323]"
              >
                {isGenerating ? 'Analyzing with Groq...' : 'Generate Smart Link'}
                {!isGenerating && <ArrowRight size={20} />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b-2 border-stone-900/10 pb-4">
                <div className="flex flex-col">
                  <span className="text-sm text-stone-900/60 uppercase tracking-wider font-semibold mb-1">Receipt for</span>
                  <span className="text-xl font-bold">{clientName || 'Unknown Client'}</span>
                </div>
                <div className="badge-network">
                  Arbitrum Network
                </div>
              </div>

              <div className="flex flex-col gap-2 py-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-stone-900/70 font-medium truncate pr-4">{description || 'Invoice Payment'}</span>
                  <span className="font-semibold whitespace-nowrap">${amountUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-900/60">Platform Fee</span>
                  <span className="text-[#FF6B6B] font-semibold">0%</span>
                </div>
                <div className="h-px bg-stone-900/10 my-2" />
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total (USDC)</span>
                  <span className="text-accent">${amountUSD.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-4 mt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1 py-3 rounded-2xl font-semibold"
                >
                  Edit
                </button>
                <button 
                  className="btn-primary flex-[2] py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
                  onClick={handleCopyLink}
                >
                  Copy Payment Link
                  <CheckCircle2 size={18} />
                </button>
              </div>

              {url && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px',
                  background: 'var(--bg3)',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  marginTop: '16px',
                  border: '1px solid var(--border-accent)',
                }}>
                  <p className="label-accent" style={{ marginBottom: '12px' }}>
                    PAYMENT QR GENERATED
                  </p>
                  <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '6px' }}>
                    <QRCodeSVG
                      value={url}
                      size={140}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="label" style={{ marginTop: '10px', textAlign: 'center' }}>
                    YOUR CLIENT CAN SCAN THIS DIRECTLY
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Push Protocol opt-in — shown after wallet is connected */}
        {address && (
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-input)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginTop: '20px',
          }}>
            <div>
              <p className="label-accent" style={{ marginBottom: '4px' }}>
                PAYMENT NOTIFICATIONS
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--muted)',
                lineHeight: 1.5,
              }}>
                Get a notification in your wallet when you get paid
              </p>
            </div>
            <PushOptIn address={address} />
          </div>
        )}

        <div className="mt-16 flex items-center justify-center gap-6 md:gap-10 text-stone-900/50 text-sm font-semibold uppercase tracking-wider flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">
            <ShieldCheck size={18} className="text-[#FF6B6B]" />
            <span>Arbitrum</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">
            <ShieldCheck size={18} className="text-[#FF8A65]" />
            <span>Bitso</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 border-2 border-stone-900 shadow-[2px_2px_0px_#2D2323]">
            <ShieldCheck size={18} className="text-stone-900" />
            <span>Groq AI</span>
          </div>
        </div>

      </section>
    </main>
  );
}
