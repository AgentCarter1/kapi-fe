import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Cpu, Building2, Key, LogOut, Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout as logoutAction } from "../store/slices/authSlice";
import { logout } from "../features/auth/api/authApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccountSelf } from "../features/account/api/accountApi";
import { setUser } from "../store/slices/authSlice";
import toast from "react-hot-toast";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: Building2 },
  { path: "/admin/accounts", label: "Accounts", icon: Users },
  { path: "/admin/devices", label: "Devices", icon: Cpu },
  { path: "/admin/workspaces", label: "Workspaces", icon: Building2 },
  { path: "/admin/licenses", label: "Licenses", icon: Key },
];

export const AdminDashboardLayout = ({
  children,
}: AdminDashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((state) => state.auth.user);
  const isSuperAdmin = currentUser?.isSuperAdmin ?? false;

  // Fetch user profile
  const { data: accountData } = useQuery({
    queryKey: ["account", "self"],
    queryFn: getAccountSelf,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Update Redux state when user data is fetched
  useEffect(() => {
    if (!accountData) return;

    const nextUser = {
      id: accountData.id,
      email: accountData.email,
      firstName: accountData.parameters?.firstName || "",
      lastName: accountData.parameters?.lastName || "",
      isActive: accountData.isActive ?? false,
      verifiedAt: accountData.verifiedAt,
      isSuperAdmin: accountData.isSuperAdmin ?? false,
    };

    const shouldUpdate =
      !currentUser ||
      currentUser.id !== nextUser.id ||
      currentUser.email !== nextUser.email ||
      (currentUser.firstName || "") !== nextUser.firstName ||
      (currentUser.lastName || "") !== nextUser.lastName ||
      (currentUser.isActive ?? false) !== (nextUser.isActive ?? false) ||
      (currentUser.verifiedAt ?? null) !== (nextUser.verifiedAt ?? null) ||
      Boolean(currentUser.isSuperAdmin) !== Boolean(nextUser.isSuperAdmin);

    if (shouldUpdate) {
      dispatch(setUser(nextUser));
    }
  }, [accountData, currentUser, dispatch]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      queryClient.clear();
      dispatch(logoutAction());
      navigate("/auth/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Logout failed");
      // Still logout even if API call fails
      queryClient.clear();
      dispatch(logoutAction());
      navigate("/auth/login");
    }
  };

  const userEmail = currentUser?.email || "Admin";

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  const handleGoToAccountPanel = () => {
    setProfileDropdownOpen(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />

          {/* Profile Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(userEmail)}
              </div>
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userEmail}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Admin Account</p>
                </div>

                {isSuperAdmin && (
                  <div className="py-1">
                    <button
                      onClick={handleGoToAccountPanel}
                      className="w-full flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition-colors"
                    >
                      <Building2 className="h-4 w-4 mr-3 text-indigo-600" />
                      Account Panel
                    </button>
                  </div>
                )}

                {/* Logout */}
                <div className="border-t border-gray-200 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3 text-red-600" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
