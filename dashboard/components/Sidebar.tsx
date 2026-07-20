'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Activity, Settings, BarChart3, PlusCircle, Users } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Brands', icon: LayoutGrid },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/monitor', label: 'Monitor', icon: Activity },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-slate-900 text-slate-300 flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-slate-800">
        <h1 className="text-base font-black bg-gradient-to-r from-slate-200 via-amber-400 to-slate-200 bg-clip-text text-transparent">
          YVON
        </h1>
        <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-[0.1em]">
          Master Control Plane
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-all border-l-[3px] ${
                active
                  ? 'text-amber-400 bg-slate-800/30 border-amber-400 font-semibold'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/20'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}

        <div className="border-t border-slate-800 mx-4 my-3" />

        <Link
          href="/add-brand"
          className={`flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-all ${
            pathname === '/add-brand'
              ? 'text-amber-400 bg-slate-800/30 border-l-[3px] border-amber-400'
              : 'text-slate-500 border-l-[3px] border-transparent hover:text-emerald-400 hover:bg-slate-800/20'
          }`}
        >
          <PlusCircle size={16} />
          Add Brand
        </Link>
      </nav>

      {/* Status */}
      <div className="px-5 py-4 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-600">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        All systems active
      </div>
    </aside>
  );
}
