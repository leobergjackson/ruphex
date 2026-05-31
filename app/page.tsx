import MediaInput from "@/components/MediaInput";
import { Bot } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 relative overflow-hidden bg-[hsl(var(--background))]">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--primary))/0.15] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--accent))/0.1] blur-[100px] pointer-events-none" />

      {/* Header Area */}
      <div className="z-10 w-full max-w-5xl flex flex-col items-center text-center gap-6 mt-12 mb-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-purple-600 flex items-center justify-center shadow-lg shadow-[hsl(var(--primary))/0.25]">
          <Bot size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Welcome to Recibo
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-3 max-w-xl mx-auto text-lg">
            Interact with your agent using text, voice, photos, or files. The ultimate multimodal experience.
          </p>
        </div>
      </div>

      {/* Input Area anchored to bottom */}
      <div className="z-10 w-full mb-8">
        <MediaInput />
      </div>
    </main>
  );
}
