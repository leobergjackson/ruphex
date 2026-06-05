import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export interface AuditEvent {
  time: string;
  action: string;
  isCompleted: boolean;
}

interface AgentAuditTrailProps {
  events: AuditEvent[];
}

export default function AgentAuditTrail({ events }: AgentAuditTrailProps) {
  return (
    <div className="w-full mt-6 bg-white border-2 border-stone-900 rounded-xl p-4 shadow-[4px_4px_0px_#2D2323]">
      <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
        <Clock size={18} />
        Agent Audit Trail
      </h3>
      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-300 before:to-transparent">
        {events.map((event, i) => (
          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 border-stone-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_#2D2323] ${event.isCompleted ? 'bg-green-400 text-stone-900' : 'bg-stone-100 text-stone-400'}`}>
              <CheckCircle2 size={12} className={event.isCompleted ? 'opacity-100' : 'opacity-0'} />
            </div>
            <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-stone-50 border-2 border-stone-900 p-2 rounded shadow-[2px_2px_0px_#2D2323] text-left">
              <div className="flex flex-col">
                <time className="text-xs font-mono text-stone-500 mb-1">{event.time}</time>
                <div className={`text-sm font-semibold ${event.isCompleted ? 'text-stone-900' : 'text-stone-400'}`}>{event.action}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
