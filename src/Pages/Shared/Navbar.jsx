import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Home, LayoutDashboard, User, LogOut, Play, LogIn, UserPlus, Coins } from 'lucide-react';

// Mock hooks for demonstration - replace with your actual hooks
const useAuth = () => ({ user: { email: 'user@example.com', displayName: 'John Doe' }, logOut: () => console.log('Logged out') }); // Logged in user
const useAdmin = () => [false]; // Mock admin status (regular user)
const useTaskCreator = () => [false]; // Mock task creator status
const useAxiosSecure = () => () => Promise.resolve({ data: { coin: 250 } }); // Mock API call

const Navbar = () => {
  const { user, logOut } = useAuth();
  const [isAdmin] = useAdmin();
  const [isTaskCreator] = useTaskCreator();
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState({ coin: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    getData();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getData = async () => {
    if (user?.email) {
      const { data } = await axiosSecure(`/user/${user.email}`);
      setUsers(data);
    }
  };

  const handleLogOut = () => {
    logOut()
      .then(() => {
        setIsMenuOpen(false);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/dashboard/adminHome";
    if (isTaskCreator) return "/dashboard/authorHome";
    return "/dashboard/userHome";
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-lg border-b border-white/10 shadow-lg' 
        : 'bg-black/70 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MicroTasker
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200 group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </Link>

            {/* Dashboard Links */}
            {user && (
              <Link 
                to={getDashboardLink()} 
                className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200 group"
              >
                <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Dashboard</span>
              </Link>
            )}

            {/* Coin Display - Only for non-admin users */}
            {!isAdmin && user && (
              <div className="flex items-center space-x-2 bg-gray-900/50 px-3 py-2 rounded-xl border border-gray-700">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-semibold">{users?.coin || 0}</span>
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200 group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={handleLogOut}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a 
                  href="https://www.youtube.com/watch?v=CgkZ7MvWUAA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200 group"
                >
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Demo</span>
                </a>
                <Link 
                  to="/login" 
                  className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-blue-400 transition-colors duration-200 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-black/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            
            <Link 
              to="/" 
              onClick={closeMenu}
              className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors duration-200 p-3 rounded-xl hover:bg-white/10"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {user && (
              <Link 
                to={getDashboardLink()} 
                onClick={closeMenu}
                className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors duration-200 p-3 rounded-xl hover:bg-white/10"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            )}

            {!isAdmin && user && (
              <div className="flex items-center space-x-3 bg-gray-900/50 p-3 rounded-xl border border-gray-700">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-white font-semibold">{users?.coin || 0} Coins</span>
              </div>
            )}

            {user ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors duration-200 p-3 rounded-xl hover:bg-white/10"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={handleLogOut}
                  className="w-full flex items-center space-x-3 bg-red-600 hover:bg-red-700 p-3 rounded-xl text-white font-medium transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <a 
                  href="https://www.youtube.com/watch?v=CgkZ7MvWUAA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors duration-200 p-3 rounded-xl hover:bg-white/10"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </a>
                <Link 
                  to="/login" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 text-white hover:text-blue-400 transition-colors duration-200 p-3 rounded-xl hover:bg-white/10"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  onClick={closeMenu}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-3 rounded-xl text-white font-medium transition-colors duration-200"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;