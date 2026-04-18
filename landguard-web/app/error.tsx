"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 text-center shadow-lg">
          <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm mb-4">
            <AlertTriangle className="w-4 h-4" /> System Error
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">500</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">Something went wrong. You can retry safely or return to a secure route.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => reset()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition inline-flex items-center gap-2"><RotateCcw className="w-4 h-4" />Retry</button>
            <Link href="/" className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">Go Home</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
