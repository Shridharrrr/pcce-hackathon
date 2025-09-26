"use client";

import { useState, useEffect } from "react";
// We don't need next/link or next/navigation in a standard React setup
import { useAuthContext } from "@/context/AuthContext"; // Using relative path
import {
  ChartBarIcon,
  LightBulbIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  ChartBarIcon as ChartBarSolid,
  LightBulbIcon as LightBulbSolid,
} from "@heroicons/react/24/solid";

// Updated navigation for your app
const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeSolid, activeIcon: HomeSolid },
  {
    name: "Projections",
    href: "/projections",
    icon: ChartBarIcon,
    activeIcon: ChartBarSolid,
  },
];

export default function AppSidebar({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthContext();

  // Use window.location.pathname instead of usePathname
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    // Set the initial pathname and update if it changes (for client-side routing)
    setPathname(window.location.pathname);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
    setSidebarOpen(false);
  };

  // Reusable NavLink component to replace Next.js Link
  const NavLink = ({ item }) => {
    const isActive = pathname === item.href;
    const Icon = isActive ? item.activeIcon : item.icon;
    return (
      <a
        key={item.name}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Mobile sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <a href="/" className="text-xl font-bold text-gray-900">
              EduPlanner
            </a>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Mobile user section */}
          {user && (
            <div className="border-t px-4 py-4">
              <div className="flex items-center mb-4">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User Avatar"}
                    className="h-8 w-8 rounded-full mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b">
            <a href="/" className="text-xl font-bold text-gray-900">
              EduPlanner
            </a>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Desktop user section */}
          {user && (
            <div className="border-t px-4 py-4">
              <div className="flex items-center mb-4">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User Avatar"}
                    className="h-8 w-8 rounded-full mr-3"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navbar for mobile */}
        <div className="sticky top-0 z-10 flex lg:hidden h-16 flex-shrink-0 bg-white shadow-sm border-b">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 justify-between px-4 lg:px-6">
            <div className="flex flex-1 items-center">
              <a href="/" className="lg:hidden text-xl font-bold text-gray-900">
                EduPlanner
              </a>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
