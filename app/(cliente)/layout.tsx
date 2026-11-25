import { Logo } from "@/components/logo";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto min-h-screen max-w-md bg-[#faf8f5] shadow-sm">
        <header className="bg-stone-900 px-5 py-4 text-white">
          <Logo size="sm" claro />
          <div className="text-xs mt-1 text-stone-300">Cocina asiática · Alcalá de Henares</div>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
