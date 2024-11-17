import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Package2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  category: string;
  brand: string;
  upc: string;
  description: string;
  regularPrice: number;
  expiryDate: string;
  caseQuantity: number;
  closeBidDate: string;
  quantityAvailable: number;
  lotNumber: string;
  maxDiscount: number;
  imageUrl?: string;
}

export default function ProductList() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidQuantity, setBidQuantity] = useState<number>(0);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const fetchedProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        // Sort products by category
        setProducts(fetchedProducts.sort((a, b) => a.category.localeCompare(b.category)));
        
        // Check if we need to scroll to a specific category
        if (location.state?.scrollToCategory) {
          setTimeout(() => {
            const element = document.getElementById(location.state.scrollToCategory);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      } catch (error) {
        toast.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location]);

  const handleBidSubmit = async (product: Product) => {
    if (!currentUser) {
      toast.error('Please login to place a bid');
      return;
    }

    if (bidQuantity <= 0 || bidPrice <= 0) {
      toast.error('Please enter valid quantity and price');
      return;
    }

    if (bidQuantity > product.quantityAvailable) {
      toast.error('Bid quantity exceeds available quantity');
      return;
    }

    const discountPercent = ((product.regularPrice - bidPrice) / product.regularPrice) * 100;
    if (discountPercent > product.maxDiscount) {
      toast.error(`Bid exceeds maximum available discount of ${product.maxDiscount}%`);
      return;
    }

    try {
      await addDoc(collection(db, 'bids'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        productId: product.id,
        productName: product.description,
        bidPrice,
        quantity: bidQuantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        discountPercent,
        totalValue: bidPrice * bidQuantity,
        regularPrice: product.regularPrice,
        imageUrl: product.imageUrl
      });

      toast.success(
        <div className="space-y-2">
          <p>Thank you for submitting your bid.</p>
          <p>Our team will review your bid shortly, and you will be notified on decision as soon as we're able to do so.</p>
          <p>Note that successful bids will require to be rounded to the nearest case, and that all bids are on a first come, first serve basis and judged on the best offer received.</p>
          <p>You can review, cancel, or revise your bid at any time up until a decision has been made by viewing the "My Bids" section.</p>
          <p>Have a great day!</p>
          <p className="font-medium">Haleon Deals Team</p>
        </div>,
        {
          duration: 10000,
          style: {
            maxWidth: '500px',
          },
        }
      );
      
      setSelectedProduct(null);
      setBidPrice(0);
      setBidQuantity(0);
    } catch (error) {
      console.error('Bid submission error:', error);
      toast.error('Failed to submit bid');
    }
  };

  const categories = [...new Set(products.map(p => p.category))].sort();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-haleon-lime"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-haleon-black">Available Products</h1>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            const element = document.getElementById(`category-${e.target.value}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="form-select rounded-md border-haleon-gray-300 focus:border-haleon-lime focus:ring focus:ring-haleon-lime focus:ring-opacity-50"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {categories.map((category) => (
        <div key={category} id={`category-${category}`} className="space-y-4">
          <h2 className="text-xl font-display font-bold text-haleon-black sticky top-20 bg-white py-4 z-10">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products
              .filter(product => product.category === category)
              .map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-haleon-gray-300 overflow-hidden">
                  <div className="p-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.description}
                        className="w-full h-48 object-contain rounded-md bg-white"
                      />
                    ) : (
                      <div className="w-full h-48 bg-haleon-gray-100 flex items-center justify-center rounded-md">
                        <Package2 className="h-12 w-12 text-haleon-gray-400" />
                      </div>
                    )}
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-haleon-black">{product.description}</h3>
                      <p className="text-sm text-haleon-gray-500">{product.brand}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-haleon-gray-600">Category: {product.category}</p>
                        <p className="text-sm text-haleon-gray-600">UPC: {product.upc}</p>
                        <p className="text-sm text-haleon-gray-600">Regular Price: ${product.regularPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-sm text-haleon-gray-600">Case Quantity: {product.caseQuantity}</p>
                        <p className="text-sm text-haleon-gray-600">Available: {product.quantityAvailable}</p>
                        <p className="text-sm text-haleon-gray-600">Lot #: {product.lotNumber}</p>
                        <p className="text-sm text-haleon-gray-600">
                          Expires: {new Date(product.expiryDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-haleon-gray-600">
                          Bids Close: {new Date(product.closeBidDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="mt-4 w-full bg-haleon-lime text-haleon-black py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-haleon-lime focus:ring-offset-2 transition-colors"
                      >
                        Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{selectedProduct.description}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-haleon-gray-600 mb-2">
                  Regular Price: ${selectedProduct.regularPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-haleon-gray-600 mb-4">
                  Available Quantity: {selectedProduct.quantityAvailable}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-haleon-black">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.quantityAvailable}
                  value={bidQuantity}
                  onChange={(e) => setBidQuantity(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-haleon-gray-300 shadow-sm focus:border-haleon-lime focus:ring-haleon-lime sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-haleon-black">Bid Price (per unit)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-haleon-gray-300 shadow-sm focus:border-haleon-lime focus:ring-haleon-lime sm:text-sm"
                />
              </div>
              {bidPrice > 0 && (
                <div className="space-y-1">
                  <p className="text-sm text-haleon-gray-600">
                    Discount: {((selectedProduct.regularPrice - bidPrice) / selectedProduct.regularPrice * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-haleon-gray-600">
                    Total Value: ${(bidPrice * bidQuantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 text-sm font-medium text-haleon-gray-700 bg-haleon-gray-100 rounded-md hover:bg-haleon-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-haleon-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBidSubmit(selectedProduct)}
                  className="px-4 py-2 text-sm font-medium text-haleon-black bg-haleon-lime rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-haleon-lime transition-colors"
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}