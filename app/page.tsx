import { Nav } from "@/components/Nav";
import MediaInput from "@/components/MediaInput";

export default function Home() {
  return (
    <main className="flex h-screen flex-col p-4 md:p-8 relative overflow-hidden bg-[hsl(var(--background))]">
      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--primary))/0.15] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--accent))/0.1] blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full gap-4">
        <Nav />
        <MediaInput />
      </div>
    </main>
  );
}
