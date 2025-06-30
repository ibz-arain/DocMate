import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const { login, register } = useAuthContext();
  const { toast } = useToast();
  const [typedText, setTypedText] = useState('');
  
  // Typewriter effect
  useEffect(() => {
    const text = mode === 'signin' ? 'Welcome back!' : 'Create your account';
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setTypedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [mode]);

  // Reset form when mode changes
  useEffect(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
    });
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        await login({
          email: formData.email,
          password: formData.password
        });
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      } else {
        await register({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number || undefined
        });
        toast({
          title: 'Account created!',
          description: 'Your account has been created and you are now signed in.',
        });
      }
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 opacity-10 blur-lg rounded-lg"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-background/80 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-gray-200/20"
      >
        <div className="mb-8 text-center">
          <h2 className="font-mono text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {typedText}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="font-mono text-sm font-medium">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="bg-background/50 backdrop-blur-sm border-gray-200/20 focus:border-cyan-400 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="font-mono text-sm font-medium">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="bg-background/50 backdrop-blur-sm border-gray-200/20 focus:border-cyan-400 transition-all duration-300"
                  />
                </div>
              </motion.div>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mode === 'signup' ? 0.2 : 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="email" className="font-mono text-sm font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="bg-background/50 backdrop-blur-sm border-gray-200/20 focus:border-cyan-400 transition-all duration-300"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: mode === 'signup' ? 0.3 : 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="password" className="font-mono text-sm font-medium">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="bg-background/50 backdrop-blur-sm border-gray-200/20 focus:border-cyan-400 transition-all duration-300"
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            )}
          </motion.div>

          {mode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="phone_number" className="font-mono text-sm font-medium">Phone Number (Optional)</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={loading}
                className="bg-background/50 backdrop-blur-sm border-gray-200/20 focus:border-cyan-400 transition-all duration-300"
              />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: mode === 'signup' ? 0.5 : 0.3 }}
            className="space-y-4"
          >
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-mono font-semibold transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            {onToggleMode && (
              <p className="text-center text-sm text-gray-600">
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={onToggleMode}
                  disabled={loading}
                  className="font-semibold text-cyan-500 hover:text-cyan-600 transition-colors duration-200"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
} 