import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useAuth from "../auth/useAuth";
import { useTheme } from "../context/ThemeContext";
import { getCart } from "../api/cartApi";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect for navbar backdrop
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    // Set initial state
    setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart count from API
  useEffect(() => {
    if (user) {
      getCart()
        .then((cart) => {
          // Assuming cart structure has an items array
          // Adjust based on your actual API response structure if needed
          const count =
            cart?.items?.reduce(
              (acc, item) => acc + (item?.quantity || 0),
              0
            ) ||
            cart?.items?.length ||
            0;
          setCartCount(count);
        })
        .catch((err) => {
          setCartCount(0);
        });
    } else {
      setCartCount(0);
    }
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-xl"
          : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link
            to="/"
            className={`flex items-center space-x-2 text-2xl font-extrabold tracking-tight transition-colors ${
              scrolled ? "text-indigo-600 dark:text-white" : "text-white"
            }`}
            aria-label="TechBrand Home"
          >
            <img src="/logo.svg" className="w-8 h-8 text-red-500" />

            <span>
              Tech<span className="text-yellow-400">Brand</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className={`font-medium transition-all hover:scale-105 ${
                  scrolled
                    ? "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Home
              </Link>

              {user && (
                <>
                  {/* Cart with Badge */}
                  <Link
                    to="/cart"
                    className={`relative font-medium transition-all hover:scale-105 flex items-center gap-1 ${
                      scrolled
                        ? "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        : "text-white/90 hover:text-white"
                    }`}
                    aria-label={`Shopping cart with ${cartCount} items`}
                  >
                    <img src="/cart.svg" alt="cart" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/orders"
                    className={`font-medium transition-all hover:scale-105 ${
                      scrolled
                        ? "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    Orders
                  </Link>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                scrolled
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
            >
              {theme === "dark" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Auth Buttons / Profile */}
            {!user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 ${
                    scrolled
                      ? "text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-800"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105 shadow-md ${
                    scrolled
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                      : "bg-white text-indigo-600 hover:bg-gray-100"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all hover:scale-105 ${
                    scrolled
                      ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      scrolled
                        ? "bg-indigo-600 text-white"
                        : "bg-yellow-400 text-indigo-900"
                    }`}
                  >
                    {user?.name &&
                    typeof user.name === "string" &&
                    user.name.length > 0
                      ? user.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <span
                    className={`font-medium hidden xl:block ${
                      scrolled
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
                    }`}
                  >
                    {user?.name &&
                    typeof user.name === "string" &&
                    user.name.trim()
                      ? user.name.split(" ")?.[0]
                      : "User"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    } ${
                      scrolled
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-white"
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

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.name && typeof user.name === "string"
                          ? user.name
                          : "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email && typeof user.email === "string"
                          ? user.email
                          : ""}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Profile
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all ${
                scrolled
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  : "bg-white/20 text-white"
              }`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>

            {/* Hamburger Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-lg transition-all ${
                scrolled
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  : "bg-white/20 text-white"
              }`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden transition-all duration-300 ease-in-out ${
          menuOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 font-medium transition-colors"
          >
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Orders
              </Link>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-800 font-medium transition-colors"
              >
                Profile
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800 font-semibold transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-center rounded-lg text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
