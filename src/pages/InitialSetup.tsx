import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Shield } from 'lucide-react';
import { setupInitialAdmin } from '../lib/firebase';

interface SetupForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function InitialSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SetupForm>();

  const onSubmit = async (data: SetupForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await setupInitialAdmin(data.email, data.password);
      toast.success('Initial admin account created successfully!');
      navigate('/login');
    } catch (error: any) {
      console.error('Setup Initial Admin Error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error(
          <div>
            <p>This email is already registered.</p>
            <p className="mt-2">Please sign in instead.</p>
          </div>
        );
        navigate('/login');
        return;
      }

      switch (error.message) {
        case 'Admin already exists':
          toast.error('An admin account already exists. Please login instead.');
          navigate('/login');
          break;
        case 'Firebase configuration error':
          toast.error('Firebase configuration error. Please check your settings.');
          break;
        case 'auth/invalid-email':
          toast.error('Invalid email address format.');
          break;
        case 'auth/weak-password':
          toast.error('Password should be at least 6 characters long.');
          break;
        default:
          toast.error('Failed to create admin account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="border-b border-haleon-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Haleon.svg" 
            alt="Haleon"
            className="h-8"
          />
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center">
              <Shield className="h-12 w-12 text-haleon-lime" />
            </div>
            <h2 className="mt-6 text-3xl font-display font-bold text-haleon-black">
              Initial Admin Setup
            </h2>
            <p className="mt-2 text-haleon-gray-600">
              Create the first admin account for Haleon Deals Portal
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-haleon-black mb-1">
                  Email address
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="appearance-none block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm placeholder-haleon-gray-400 focus:outline-none focus:ring-haleon-lime focus:border-haleon-lime sm:text-sm"
                  placeholder="admin@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-haleon-black mb-1">
                  Password
                </label>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm placeholder-haleon-gray-400 focus:outline-none focus:ring-haleon-lime focus:border-haleon-lime sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-haleon-black mb-1">
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === watch('password') || 'Passwords do not match'
                  })}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-haleon-gray-300 rounded-md shadow-sm placeholder-haleon-gray-400 focus:outline-none focus:ring-haleon-lime focus:border-haleon-lime sm:text-sm"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-haleon-black bg-haleon-lime hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-haleon-lime disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating admin account...' : 'Create admin account'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                to="/login"
                className="font-medium text-haleon-black hover:text-haleon-gray-600 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}