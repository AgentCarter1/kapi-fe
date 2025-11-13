import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Mail, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

type MenuItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  children?: { name: string; path: string }[];
};

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, isHovered, setIsHovered, isMobileOpen, setIsMobileOpen } = useSidebar();
  
  const [openMenus, setOpenMenus] = useState<string[]>(['Workspace']); // Default open

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: 'Zones',
      path: '/zones',
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      name: 'Workspace',
      path: '/workspace/members',
      icon: <Users className="w-5 h-5" />,
      children: [
        {
          name: 'Members',
          path: '/workspace/members',
        },
        {
          name: 'Invitations',
          path: '/workspace/invitations',
        },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isMenuOpen = (name: string) => openMenus.includes(name);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const shouldShowText = isExpanded || isHovered;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-y-hidden bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 duration-300 ease-linear lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          shouldShowText ? 'w-[290px]' : 'w-[90px]'
        }`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => !isExpanded && setIsHovered(false)}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-xl font-bold text-white">K</span>
            </div>
            {shouldShowText && (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                KAPI
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 lg:px-6">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.path}>
                {/* Main Menu Item */}
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleMenu(item.name);
                    } else {
                      navigate(item.path);
                      setIsMobileOpen(false);
                    }
                  }}
                  className={`group menu-item w-full ${
                    isActive(item.path) && !item.children
                      ? 'menu-item-active'
                      : 'menu-item-inactive'
                  }`}
                  title={!shouldShowText ? item.name : ''}
                >
                  <span
                    className={`flex items-center justify-center ${
                      isActive(item.path) && !item.children
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive'
                    }`}
                  >
                    {item.icon}
                  </span>
                  {shouldShowText && (
                    <>
                      <span className="flex-1 text-left">{item.name}</span>
                      {item.children && (
                        <span
                          className={`transition-transform duration-200 ${
                            isMenuOpen(item.name) ? 'rotate-180' : ''
                          } ${
                            isActive(item.path)
                              ? 'menu-item-icon-active'
                              : 'menu-item-icon-inactive'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </span>
                      )}
                    </>
                  )}
                </button>

                {/* Submenu */}
                {item.children && isMenuOpen(item.name) && shouldShowText && (
                  <div className="mt-1 space-y-1 pl-4">
                    {item.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => {
                          navigate(child.path);
                          setIsMobileOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive(child.path)
                            ? 'bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span>{child.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

