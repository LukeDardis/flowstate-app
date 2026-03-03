import { Outlet, Link, useLocation } from 'react-router';
import { Calendar, CheckSquare, Home, Play, FileText } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/quick-start', label: 'Quick Start', icon: Play },
    { path: '/notes', label: 'Notes', icon: FileText },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/schedule', label: 'Work Schedule', icon: Calendar },
  ];
  
  return (
    <div className="flex min-h-screen bg-[#f7f5f2]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#1a1f2e] flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl text-white font-serif">FlowState</h1>
        </div>
        
        <nav className="flex-1 px-3">
          <ul className="space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const active = isActive(path);
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'bg-[#eaedfe] bg-opacity-10 text-white'
                        : 'text-white text-opacity-55 hover:text-opacity-80 hover:bg-[#242938]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}