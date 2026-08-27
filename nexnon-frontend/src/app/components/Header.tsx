import { Search, Menu, User, LogOut, Bell, HelpCircle, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  variant?: "default" | "light";
}

export default function Header({ variant = "default" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const forceLight = variant === "light";
  const showWhiteBg = forceLight || isScrolled;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      showWhiteBg ? "bg-white border-b border-black/10 shadow-sm" : "bg-black/5 backdrop-blur-sm"
    }`}>
      <div className="w-[90vw] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 -ml-8">
            <Link to="/" className="group flex items-center">
              <div className="relative">
                <span className="text-2xl font-bold tracking-tight flex items-center">
                  <span className={showWhiteBg ? "text-black" : "text-white"}>Nexnoon</span>
                </span>
                <div className={`absolute -bottom-0.5 right-0 w-4 h-0.5 ${showWhiteBg ? "bg-black" : "bg-white"} group-hover:w-full transition-all duration-300`}></div>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          {showWhiteBg && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="What do you want to learn?"
                  onFocus={() => navigate('/browse')}
                  className="w-full pl-4 pr-11 py-3.5 text-sm rounded-full border border-gray-200 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none transition-colors bg-white text-black h-auto cursor-pointer"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black z-10" />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/browse" className={`${showWhiteBg ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"} transition-colors text-sm font-medium`}>
              Browse
            </Link>
            <Link to="/categories" className={`${showWhiteBg ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"} transition-colors text-sm font-medium`}>
              Categories
            </Link>
            <Link to="/teach" className={`${showWhiteBg ? "text-black/70 hover:text-black" : "text-white/70 hover:text-white"} transition-colors text-sm font-medium`}>
              Teach
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0 -mr-8">
            {isAuthenticated ? (
              <>
                {/* Help Icon */}
                <Link to="/help">
                  <Button variant="ghost" size="icon" className={`hidden sm:flex ${showWhiteBg ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}>
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Notifications Icon */}
                <Link to="/notifications">
                  <Button variant="ghost" size="icon" className={`hidden sm:flex ${showWhiteBg ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10"} relative`}>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </Link>

                <Link to="/my-classes">
                  <Button variant="ghost" className={`hidden sm:flex ${showWhiteBg ? "text-black hover:bg-black/5" : "text-white hover:bg-white/10"}`}>
                    My Classes
                  </Button>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-[#889dd1] to-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/my-classes"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Search className="h-4 w-4" />
                        My Classes
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <SettingsIcon className="h-4 w-4" />
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="hidden sm:flex border-black text-black hover:bg-black hover:text-white">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className={showWhiteBg ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"}>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            <Button variant="ghost" size="icon" className={`md:hidden ${showWhiteBg ? "hover:bg-black/5" : "hover:bg-white/10"}`}>
              <Menu className={`h-5 w-5 ${showWhiteBg ? "text-black" : "text-white"}`} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}