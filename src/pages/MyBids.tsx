import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { Package2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Bid {
  id: string;
  productId: string;
  productName: string;
  bidPrice: number;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  discountPercent: number;
  totalValue: number;
  regularPrice: number;
  imageUrl?: string;
}

export default function MyBids() {
  const { currentUser } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBids = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, 'bids'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedBids = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Bid[];
        
        setBids(fetchedBids);
      } catch (error) {
        console.error('Error fetching bids:', error);
        toast.error('Failed to fetch bids');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [currentUser]);

  const handleCancelBid = async (bidId: string) => {
    try {
      await deleteDoc(doc(db, 'bids', bidId));
      toast.success('Bid cancelled successfully');
      setBids(bids.filter(bid => bid.id !== bidId));
    } catch (error) {
      toast.error('Failed to cancel bid');
    }
  };

  const handleReviseBid = async (bid: Bid) => {
    // Navigate to product details with bid revision mode
    // This will be implemented in the product details component
    toast.error('Bid revision functionality coming soon');
  };

  const formatCurrency = (value: number | undefined): string => {
    if (typeof value !== 'number') return '$0.00';
    return value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-haleon-lime"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-haleon-black">My Bids</h2>
      
      {bids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-haleon-gray-300 p-8 text-center">
          <Package2 className="mx-auto h-12 w-12 text-haleon-gray-400" />
          <p className="mt-4 text-haleon-gray-600">No bids placed yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bids.map((bid) => (
            <div key={bid.id} className="bg-white rounded-lg shadow-sm border border-haleon-gray-300 overflow-hidden">
              <div className="p-4">
                {bid.imageUrl ? (
                  <img
                    src={bid.imageUrl}
                    alt={bid.productName}
                    className="w-full h-48 object-contain rounded-md bg-white"
                  />
                ) : (
                  <div className="w-full h-48 bg-haleon-gray-100 flex items-center justify-center rounded-md">
                    <Package2 className="h-12 w-12 text-haleon-gray-400" />
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold text-haleon-black">{bid.productName}</h3>
                  
                  <div className="space-y-1 text-sm text-haleon-gray-600">
                    <p>Bid Price: {formatCurrency(bid.bidPrice)}</p>
                    <p>Regular Price: {formatCurrency(bid.regularPrice)}</p>
                    <p>Quantity: {bid.quantity}</p>
                    <p>Discount: {bid.discountPercent?.toFixed(1)}%</p>
                    <p>Total Value: {formatCurrency(bid.totalValue)}</p>
                    <p>Date: {new Date(bid.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bid.status === 'approved' 
                        ? 'bg-green-100 text-green-800'
                        : bid.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>

                    {bid.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleReviseBid(bid)}
                          className="px-3 py-1 text-sm font-medium text-haleon-black bg-haleon-lime bg-opacity-10 rounded-full hover:bg-opacity-20 transition-colors"
                        >
                          Revise
                        </button>
                        <button
                          onClick={() => handleCancelBid(bid.id)}
                          className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}