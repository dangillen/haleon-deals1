import { useState, useEffect } from 'react';
import { collection, getDocs, writeBatch, doc, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';
import { Package2, Upload } from 'lucide-react';
import { read, utils } from 'xlsx';
import { db, storage } from '../lib/firebase';

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

interface Bid {
  id: string;
  userId: string;
  userEmail: string;
  productId: string;
  productName: string;
  bidPrice: number;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  discountPercent: number;
  totalValue: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'bids'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsSnapshot, bidsSnapshot] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'bids'))
      ]);

      const fetchedProducts = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      // Sort products by category
      setProducts(fetchedProducts.sort((a, b) => a.category.localeCompare(b.category)));
      setBids(bidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Bid[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      // Clear existing products first
      const batch = writeBatch(db);
      const productsSnapshot = await getDocs(collection(db, 'products'));
      productsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Add new products
      for (const row of jsonData) {
        const maxDiscount = parseFloat(row['Maximum Discount']);
        await addDoc(collection(db, 'products'), {
          category: row['Product Category'],
          brand: row['Brand'],
          upc: row['UPC'],
          description: row['Description'],
          regularPrice: parseFloat(row['Regular price']),
          expiryDate: row['Expiry date'],
          caseQuantity: parseInt(row['case quantity']),
          closeBidDate: row['close of bid date'],
          quantityAvailable: parseInt(row['quantity available']),
          lotNumber: row['Lot #'],
          maxDiscount: maxDiscount // Store as a number (e.g., 65 for 65%)
        });
      }

      toast.success('Products imported successfully');
      await fetchData();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import products');
    }
  };

  const handleImageUpload = async (productId: string, file: File) => {
    try {
      const loadingToast = toast.loading('Uploading image...');
      
      const imageRef = ref(storage, `products/${productId}/${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      
      await updateDoc(doc(db, 'products', productId), {
        imageUrl: imageUrl
      });

      toast.dismiss(loadingToast);
      toast.success('Image uploaded successfully');
      await fetchData();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleBidAction = async (bidId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'bids', bidId), { status });
      toast.success(`Bid ${status} successfully`);
      await fetchData();
    } catch (error) {
      toast.error('Failed to update bid status');
    }
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

  const categories = [...new Set(products.map(p => p.category))].sort();

  return (
    <div className="space-y-6">
      <div className="border-b border-haleon-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-haleon-lime text-haleon-black'
                : 'border-transparent text-haleon-gray-500 hover:text-haleon-gray-700 hover:border-haleon-gray-300'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bids'
                ? 'border-haleon-lime text-haleon-black'
                : 'border-transparent text-haleon-gray-500 hover:text-haleon-gray-700 hover:border-haleon-gray-300'
            }`}
          >
            Bids
          </button>
        </nav>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-haleon-black">Products Management</h2>
            <label className="cursor-pointer bg-haleon-lime text-haleon-black py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-haleon-lime focus:ring-offset-2 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              Import Products
            </label>
          </div>

          {categories.map((category) => (
            <div key={category} className="space-y-4">
              <h3 className="text-xl font-display font-bold text-haleon-black">{category}</h3>
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
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-haleon-gray-600">Brand: {product.brand}</p>
                            <p className="text-sm text-haleon-gray-600">UPC: {product.upc}</p>
                            <p className="text-sm text-haleon-gray-600">Price: {formatCurrency(product.regularPrice)}</p>
                            <p className="text-sm text-haleon-gray-600">Available: {product.quantityAvailable}</p>
                            <p className="text-sm text-haleon-gray-600">Max Discount: {product.maxDiscount}%</p>
                          </div>
                          <label className="mt-4 cursor-pointer flex items-center justify-center w-full py-2 px-4 border border-haleon-gray-300 rounded-md shadow-sm text-sm font-medium text-haleon-gray-700 bg-white hover:bg-haleon-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-haleon-lime transition-colors">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(product.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-haleon-black">Bids Management</h2>
          <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg border border-haleon-gray-300">
            <ul className="divide-y divide-haleon-gray-200">
              {bids.map((bid) => (
                <li key={bid.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-haleon-black">
                        Product: {bid.productName}
                      </p>
                      <p className="text-sm text-haleon-gray-500">
                        Bid by: {bid.userEmail}
                      </p>
                      <p className="text-sm text-haleon-gray-500">
                        Amount: {formatCurrency(bid.bidPrice)} | Quantity: {bid.quantity}
                      </p>
                      <p className="text-sm text-haleon-gray-500">
                        Total Value: {formatCurrency(bid.totalValue)}
                      </p>
                      <p className="text-sm text-haleon-gray-500">
                        Discount: {bid.discountPercent?.toFixed(1)}%
                      </p>
                      <p className="text-sm text-haleon-gray-500">
                        Date: {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {bid.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleBidAction(bid.id, 'approved')}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleBidAction(bid.id, 'rejected')}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {bid.status !== 'pending' && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        bid.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}