import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Check, X, ArrowLeft, Cpu } from 'lucide-react';

export default function AgentCredentialsPage() {
  return (
    <main className="grain min-h-screen flex flex-col font-[var(--font-jakarta)] relative text-stone-900 bg-[#FFF9F0]">
      <nav className="flex items-center px-6 py-6 relative z-10 w-full max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-2xl mx-auto">
        <div className="w-full bg-white border-2 border-stone-900 rounded-[2rem] p-8 md:p-12 shadow-[8px_8px_0px_#2D2323] relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b-2 border-stone-900/10 pb-8 mb-8 gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Agent Credentials</h1>
              <p className="text-stone-500 font-medium">Terminal 3 Identity Verification</p>
            </div>
            <div className="flex flex-col items-end gap-2 bg-blue-50/50 p-4 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 text-blue-700 font-bold">
                <ShieldCheck size={20} />
                Verified
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-600/80 font-mono">
                <Cpu size={14}/> TEE Verified
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6 mb-10">
            <div>
              <div className="text-sm text-stone-400 font-bold uppercase tracking-wider mb-1">Agent Name</div>
              <div className="text-xl font-bold text-stone-900">Ruphex Invoice Agent</div>
            </div>
            <div>
              <div className="text-sm text-stone-400 font-bold uppercase tracking-wider mb-1">Credential ID</div>
              <div className="font-mono text-lg font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded inline-block">
                T3-RUPHEX-001
              </div>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-200">
              <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                <Check size={20} className="text-green-600" /> Authorized Actions
              </h3>
              <ul className="space-y-3">
                {['Create invoices', 'Monitor payments', 'Generate receipts'].map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-green-800 font-medium text-sm">
                    <Check size={16} className="text-green-600 mt-0.5 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <X size={20} className="text-red-600" /> Restricted Actions
              </h3>
              <ul className="space-y-3">
                {['Move or transfer funds', 'Access private keys', 'Modify smart contracts'].map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-red-800 font-medium text-sm">
                    <X size={16} className="text-red-600 mt-0.5 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
