'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bot } from 'lucide-react';

export function Nav() {
  return (
    <nav className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-purple-600 flex items-center justify-center shadow-lg shadow-[hsl(var(--primary))/0.25]">
          <Bot size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Recibo</span>
      </div>
      <ConnectButton />
    </nav>
  );
}
