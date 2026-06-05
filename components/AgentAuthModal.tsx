import React from 'react';
import { ShieldCheck, X, Check, Bot } from 'lucide-react';

interface AgentAuthModalProps {
  isOpen: boolean;
  onAuthorize: () => void;
  onCancel: () => void;
}

export default function AgentAuthModal({ isOpen, onAuthorize, onCancel }: AgentAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white border-2 border-stone-900 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_#2D2323] relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full border-2 border-stone-900 flex items-center justify-center mb-4 text-blue-600 shadow-[4px_4px_0px_#2D2323]">
            <Bot size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 text-center">Authorize Invoice Agent</h2>
          <p className="text-stone-500 text-center mt-2 font-medium">Terminal 3 Secure Enclave</p>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Check className="text-green-500" size={18} /> Agent Can:
            </h3>
            <ul className="text-sm text-stone-600 space-y-2 pl-6 list-disc">
              <li>Create and format invoices</li>
              <li>Monitor blockchain for payments</li>
              <li>Generate verified receipts</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <X className="text-red-500" size={18} /> Agent Cannot:
            </h3>
            <ul className="text-sm text-stone-600 space-y-2 pl-6 list-disc">
              <li>Move or withdraw funds</li>
              <li>Access wallet private keys</li>
            </ul>
          </div>
        </div>

        <button 
          onClick={onAuthorize}
          className="w-full bg-[#1E293B] hover:bg-black text-white font-bold py-3 px-4 rounded-xl border-2 border-stone-900 transition-all shadow-[4px_4px_0px_#2D2323] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#2D2323] flex items-center justify-center gap-2"
        >
          <ShieldCheck size={20} />
          Authorize Agent
        </button>
      </div>
    </div>
  );
}
