'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Table2, 
  TrendingUp, 
  Baby, 
  AlertTriangle,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/heatmap', label: 'India Heatmap', icon: Map },
  { href: '/districts', label: 'District Rankings', icon: Table2 },
  { href: '/trends', label: 'Lifecycle Trends', icon: TrendingUp },
  { href: '/child-vulnerability', label: 'Child Aadhaar', icon: Baby },
  { href: '/recommendations', label: 'Interventions', icon: AlertTriangle },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-900 font-bold text-lg">A</span>
              </div>
              <div>
                <span className="font-bold text-lg">ALIS</span>
                <span className="hidden sm:inline text-xs text-blue-200 block">Aadhaar Lifecycle Intelligence</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
            
            {user && (
              <div className="flex items-center ml-4 space-x-2">
                <div className="flex items-center px-3 py-1 bg-white/10 rounded-md text-sm">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-blue-100">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Logout
                </button>
              </div>
            )}
                  <Icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-white/10"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-blue-800 pb-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
