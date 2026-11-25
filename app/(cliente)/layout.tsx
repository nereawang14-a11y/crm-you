export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto min-h-screen max-w-md bg-[#faf8f5] shadow-sm">
        <header className="bg-red-700 px-5 py-4 text-white">
          <div className="text-2xl font-black tracking-tight">YOU</div>
          <div className="text-xs text-red-100">Cocina asiática · Alcalá de Henares</div>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
