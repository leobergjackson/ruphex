import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function AgentIdentityBadge() {
  return (
    <div className="flex flex-col gap-2 p-3 bg-blue-50/50 border border-blue-200 rounded-xl mb-4 w-full">
      <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
        <ShieldCheck size={16} />
        Verified by Terminal 3
      </div>
      <div className="flex items-center gap-4 text-xs text-blue-600/80">
        <span className="flex items-center gap-1"><Cpu size={12}/> TEE Verified</span>
        <span>ID: T3-9A4B-22FX</span>
      </div>
    </div>
  );
}
