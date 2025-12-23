import { Sidebar } from "@/components/Sidebar";
import { Hammer } from "lucide-react";

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen bg-gray-50/50 font-sans">
      <Sidebar />
      <main className="flex-1 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Hammer className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 max-w-md">
          This feature is currently under development. Check back later for updates!
        </p>
      </main>
    </div>
  );
}
