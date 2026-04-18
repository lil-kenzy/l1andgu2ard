import Link from "next/link";
import { Compass, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 text-center shadow-lg">
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm mb-4">
          <ShieldAlert className="w-4 h-4" /> Secure Route Fallback
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">404</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">The page you are looking for is unavailable or moved to a protected path.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Go Home</Link>
          <Link href="/contact" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition inline-flex items-center gap-2"><Compass className="w-4 h-4" />Get support</Link>
        </div>
      </div>
    </div>
  );
}
