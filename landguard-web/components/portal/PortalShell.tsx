"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
}

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface FeatureCardItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface PortalShellProps {
  portal: string;
  title: string;
  subtitle: string;
  navItems?: NavItem[];
  stats?: StatItem[];
  featureCards?: FeatureCardItem[];
  children?: ReactNode;
}

export function PortalShell({
  portal,
  title,
  subtitle,
  navItems = [],
  stats = [],
  featureCards = [],
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <Image src="/img/logo.jpg" alt="LANDGUARD Logo" width={40} height={40} className="object-contain" />
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-emerald-600 dark:text-emerald-400">LAND</span>
                <span className="text-amber-500 dark:text-amber-400">GUARD</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {portal}
            </span>
          </div>
        </div>
      </header>

      {navItems.length > 0 && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-3xl">{subtitle}</p>
          </motion.section>

          {stats.length > 0 && (
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</span>
                    <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.label}</p>
                </motion.div>
              ))}
            </section>
          )}

          {featureCards.length > 0 && (
            <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {featureCards.map((item) => (
                <div key={item.title} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
              ))}
            </section>
          )}

          {children}
        </div>
      </main>
    </div>
  );
}

export function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function ItemList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
          {item}
        </li>
      ))}
    </ul>
  );
}
