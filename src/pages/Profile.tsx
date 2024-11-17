import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';

interface ProfileForm {
  name: string;
  company: string;
  phone: string;
}

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          reset({
            name: userData.name || '',
            company: userData.company || '',
            phone: userData.phone || ''
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!currentUser) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: data.name,
        company: data.company,
        phone: data.phone,
        updatedAt: new Date().toISOString()
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-haleon-lime"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border border-haleon-gray-300">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-6">
            <User className="h-8 w-8 text-haleon-lime mr-3" />
            <h2 className="text-2xl font-display font-bold text-haleon-black">
              Profile Settings
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-haleon-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm bg-haleon-gray-50 text-haleon-gray-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-haleon-gray-500">
                Email address cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-haleon-black mb-1">
                Full Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm focus:ring-haleon-lime focus:border-haleon-lime sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-haleon-black mb-1">
                Company Name
              </label>
              <input
                {...register('company', { required: 'Company name is required' })}
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm focus:ring-haleon-lime focus:border-haleon-lime sm:text-sm"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-haleon-black mb-1">
                Phone Number
              </label>
              <input
                {...register('phone', { required: 'Phone number is required' })}
                type="tel"
                className="mt-1 block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm focus:ring-haleon-lime focus:border-haleon-lime sm:text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-haleon-black bg-haleon-lime hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-haleon-lime disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}