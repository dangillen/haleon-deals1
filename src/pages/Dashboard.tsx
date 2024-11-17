import { useAuth } from '../contexts/AuthContext';
import { Package2, ShoppingCart, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Video Section */}
      <div className="relative h-[60vh] w-full overflow-hidden rounded-xl">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://www.haleon.com/content/dam/haleon/corporate/images/2023-updates/haleon-at-a-glance-video-banner.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Welcome to Haleon Deals Portal
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Discover exclusive deals on our trusted health products
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/products"
          className="bg-white p-6 rounded-lg shadow-sm border border-haleon-gray-300 hover:border-haleon-lime transition-colors group"
        >
          <div className="flex items-center">
            <Package2 className="h-8 w-8 text-haleon-lime mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-lg font-semibold text-haleon-black">Available Products</h3>
              <p className="text-haleon-gray-600">Browse our latest offerings</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/my-bids"
          className="bg-white p-6 rounded-lg shadow-sm border border-haleon-gray-300 hover:border-haleon-lime transition-colors group"
        >
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-haleon-lime mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-lg font-semibold text-haleon-black">Active Bids</h3>
              <p className="text-haleon-gray-600">Track your current bids</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/products"
          className="bg-white p-6 rounded-lg shadow-sm border border-haleon-gray-300 hover:border-haleon-lime transition-colors group"
        >
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-haleon-lime mr-3 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-lg font-semibold text-haleon-black">Quick Actions</h3>
              <p className="text-haleon-gray-600">Place bids and view products</p>
            </div>
          </div>
        </Link>
      </div>

      {/* User Welcome Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-haleon-gray-300">
        <h2 className="text-2xl font-display font-bold text-haleon-black mb-4">
          Welcome Back
        </h2>
        <p className="text-haleon-gray-600">
          Logged in as: <span className="font-medium text-haleon-black">{currentUser?.email}</span>
        </p>
      </div>
    </div>
  );
}