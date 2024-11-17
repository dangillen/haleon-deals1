import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Package2, ShoppingCart, User, LogOut, ArrowLeft, Settings } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import Navigation from './Navigation';

export default function Layout() {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/';
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const uniqueCategories = [...new Set(
          querySnapshot.docs
            .map(doc => doc.data().category)
            .filter(Boolean)
            .sort()
        )];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const navItems = [
    { 
      icon: Package2, 
      label: 'Products', 
      href: '/products',
      dropdown: true,
      dropdownItems: categories.map(category => ({
        label: category,
        href: `/products#category-${category}`
      }))
    },
    { icon: ShoppingCart, label: 'My Bids', href: '/my-bids' },
    { icon: User, label: 'Profile', href: '/profile' },
    ...(isAdmin ? [{ icon: Settings, label: 'Admin', href: '/admin' }] : []),
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-haleon-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              {showBackButton && (
                <button
                  onClick={() => navigate(-1)}
                  className="mr-4 p-2 rounded-full text-haleon-gray-600 hover:text-haleon-black hover:bg-haleon-gray-100 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <Link 
                to="/" 
                className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Haleon.svg" 
                  alt="Haleon"
                  className="h-8"
                />
              </Link>
              <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                <Navigation items={navItems} />
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => logout()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-haleon-black bg-haleon-lime hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-haleon-lime transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="bg-haleon-black text-white mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm">
            © {new Date().getFullYear()} Haleon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}