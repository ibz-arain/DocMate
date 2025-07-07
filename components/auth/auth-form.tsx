import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ArrowRight, Mail, Lock, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

type SignupStep = 'name-email' | 'email-confirm' | 'password' | 'phone' | 'complete';

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('name-email');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
  });
  const { login, register } = useAuthContext();
  const { toast } = useToast();
  
  // Reset form when mode changes
  useEffect(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone_number: '',
    });
    setSignupStep('name-email');
    setVerificationCode('');
    setConfirmPassword('');
  }, [mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNextStep = () => {
    if (signupStep === 'name-email') {
      if (formData.first_name && formData.last_name && formData.email) {
        setSignupStep('email-confirm');
      }
    } else if (signupStep === 'email-confirm') {
      if (verificationCode.length === 6) {
        setSignupStep('password');
      }
    } else if (signupStep === 'password') {
      if (formData.password && confirmPassword && formData.password === confirmPassword) {
        setSignupStep('phone');
      }
    } else if (signupStep === 'phone') {
      setSignupStep('complete');
      handleSignup();
    }
  };

  const handlePrevStep = () => {
    if (signupStep === 'email-confirm') {
      setSignupStep('name-email');
    } else if (signupStep === 'password') {
      setSignupStep('email-confirm');
    } else if (signupStep === 'phone') {
      setSignupStep('password');
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
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
        onSuccess?.();
      }
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

  const canProceed = () => {
    if (signupStep === 'name-email') {
      return formData.first_name && formData.last_name && formData.email;
    } else if (signupStep === 'email-confirm') {
      return verificationCode.length === 6;
    } else if (signupStep === 'password') {
      return formData.password && confirmPassword && formData.password === confirmPassword;
    }
    return true;
  };

  if (mode === 'signin') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-400 text-sm">
            Sign in to your account to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 pt-2"
          >
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>

            {onToggleMode && (
              <p className="text-center text-sm text-gray-400">
                Don't have an account? 
                <button
                  type="button"
                  onClick={onToggleMode}
                  disabled={loading}
                  className="font-medium text-primary hover:text-primary/80 transition-colors ml-1"
                >
                  Sign up
                </button>
              </p>
            )}
          </motion.div>
        </form>
      </motion.div>
    );
  }

  // Multi-step signup
  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Create your account
        </h2>
        <p className="text-gray-400 text-sm">
          Join us to get started
        </p>
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-4 mb-6">
          <div className="flex items-center space-x-2">
            {['name-email', 'email-confirm', 'password', 'phone'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  signupStep === step 
                    ? 'bg-primary text-white' 
                    : index < ['name-email', 'email-confirm', 'password', 'phone'].indexOf(signupStep)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-px mx-2 ${
                    index < ['name-email', 'email-confirm', 'password', 'phone'].indexOf(signupStep)
                      ? 'bg-primary'
                      : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={signupStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {signupStep === 'name-email' && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                />
              </motion.div>
            </>
          )}

          {signupStep === 'email-confirm' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-medium text-white mb-2">Verify your email</h3>
                <p className="text-gray-400 text-sm">
                  We've sent a 6-digit code to <span className="text-primary">{formData.email}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="verification_code" className="text-sm font-medium text-gray-300">
                  Verification Code
                </Label>
                <Input
                  id="verification_code"
                  type="text"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all text-center text-lg tracking-widest"
                />
              </div>
            </motion.div>
          )}

          {signupStep === 'password' && (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all ${
                    confirmPassword && formData.password !== confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                {confirmPassword && formData.password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
              </motion.div>
            </>
          )}

          {signupStep === 'phone' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <Phone className="w-12 h-12 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-medium text-white mb-2">Phone Number (Optional)</h3>
                <p className="text-gray-400 text-sm">
                  Add your phone number for additional security
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 pt-4"
          >
            {signupStep !== 'name-email' && (
              <Button
                type="button"
                onClick={handlePrevStep}
                disabled={loading}
                variant="outline"
                className="flex-1 h-12 border-gray-700 text-gray-300 hover:bg-gray-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={loading || !canProceed()}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : signupStep === 'phone' ? (
                'Create Account'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

          {onToggleMode && signupStep === 'name-email' && (
            <p className="text-center text-sm text-gray-400 mt-4">
              Already have an account? 
              <button
                type="button"
                onClick={onToggleMode}
                disabled={loading}
                className="font-medium text-primary hover:text-primary/80 transition-colors ml-1"
              >
                Sign in
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 