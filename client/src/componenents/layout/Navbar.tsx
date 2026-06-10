import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, List, Calculator, PieChart, TrendingUp, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Universe', path: '/universe', icon: Search },
    { name: 'Screener', path: '/screener', icon: CheckSquare },
    { name: 'Watchlist', path: '/watchlist', icon: List },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Portfolio', path: '/portfolio', icon: PieChart },
    { name: 'Compounding', path: '/compounding', icon: TrendingUp },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="h-16 card sticky top-0 z-50 flex items-center justify-between px-6 border-x-0 border-t-0 border-b border-white/5">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 accent-bg rounded flex items-center justify-center">
              <span className="text-black font-black text-xl">α</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">ALPHA HARVESTER <span className="opacity-50 text-sm">V3</span></h1>
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isActive 
                      ? "text-white" 
                      : "hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-[#252525] inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#333] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-b border-[#333]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  onClick={closeMenu}
                  to={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3",
                    isActive 
                      ? "bg-[#333] text-[#00d4a3]" 
                      : "text-gray-300 hover:bg-[#252525] hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
