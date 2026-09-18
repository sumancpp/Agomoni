import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Search, BookHeart, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { to: '/', label: t.nav.home, icon: Home },
    { to: '/puja-date', label: t.nav.pujaDate, icon: Heart },
    { to: '/lost-found', label: t.nav.lostFound, icon: Search },
    { to: '/memories', label: t.nav.memories, icon: BookHeart },
    { to: '/profile', label: t.nav.profile, icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#180C0C]/95 backdrop-blur-2xl border-t border-gold-500/25 shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const isPujaDate = item.to === '/puja-date';
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors relative ${
                isActive
                  ? 'text-gold-400 font-semibold'
                  : isPujaDate
                  ? 'text-sindoor-400 hover:text-sindoor-300 font-semibold'
                  : 'text-cream-400 hover:text-cream-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={isPujaDate ? 22 : 20}
                  className={`${isActive ? 'stroke-[2.5]' : 'stroke-2'} ${
                    isPujaDate ? 'fill-sindoor-500/30 text-sindoor-400' : ''
                  }`}
                />
                {isPujaDate && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sindoor-500 animate-pulse" />
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[60px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
