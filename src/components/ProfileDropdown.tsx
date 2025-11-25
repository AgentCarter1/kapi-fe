import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Mail, LogOut, Shield } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Get user info from store
  const userEmail = useAppSelector((state) => state.auth.user?.email || "User");
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      const { logout: logoutApi } = await import(
        "../features/auth/api/authApi"
      );
      await logoutApi();
      queryClient.clear();
      dispatch(logout());
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      queryClient.clear();
      dispatch(logout());
      navigate("/auth/login");
    }
  };

  const isSuperAdmin = useAppSelector(
    (state) => state.auth.user?.isSuperAdmin ?? false
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Get initials for avatar
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 hover:bg-gray-100 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(userEmail)}
        </div>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
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
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userEmail}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Manage your account</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {isSuperAdmin &&
              location.pathname?.startsWith("/admin") === false && (
                <button
                  onClick={() => handleNavigate("/admin/dashboard")}
                  className="w-full flex items-center px-4 py-2 text-sm text-indigo-700 hover:bg-indigo-50 transition-colors"
                >
                  <Shield className="h-4 w-4 mr-3 text-indigo-600" />
                  Admin Panel
                </button>
              )}

            <button
              onClick={() => handleNavigate("/account")}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="h-4 w-4 mr-3 text-gray-500" />
              My Profile
            </button>

            <button
              onClick={() => handleNavigate("/account/invites")}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-4 w-4 mr-3 text-gray-500" />
              My Invitations
            </button>
          </div>

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
  );
};
