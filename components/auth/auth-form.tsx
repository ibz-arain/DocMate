import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ArrowRight, Mail, Lock, User, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

type SignupStep = 'name-email' | 'email-confirm' | 'password' | 'complete';

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('name-email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const { login, register } = useAuthContext();
  const { toast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Reset form when mode changes
  useEffect(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    });
    setSignupStep('name-email');
    setVerificationCode(['', '', '', '', '', '']);
    setConfirmPassword('');
    setShowValidation(false);
    setEmailSent(false);
    setResendCooldown(0);
  }, [mode]);

  // Auto-send verification email when reaching email-confirm step
  useEffect(() => {
    if (signupStep === 'email-confirm' && !emailSent) {
      sendVerificationEmail();
    }
  }, [signupStep, emailSent]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendVerificationEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification email');
      }

      setEmailSent(true);
      toast({
        title: 'Verification email sent!',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      // If account already exists, go back to name-email step
      if (error.message.includes('already exists')) {
        setSignupStep('name-email');
        setEmailSent(false);
        toast({
          title: 'Account already exists',
          description: 'An account with this email already exists. Please use a different email or sign in.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to send verification email. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle verification code input
  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event for verification code
  const handleVerificationPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setVerificationCode(digits);
      
      // Focus the last input after pasting
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 0);
    } else if (pastedData.length > 0) {
      // Show error if pasted data is not exactly 6 digits
      toast({
        title: 'Invalid code format',
        description: 'Please paste a 6-digit verification code.',
        variant: 'destructive',
      });
    }
  };

  // Validation functions
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score, isValid: score >= 4 };
  };

  const handleNextStep = async () => {
    setShowValidation(true);
    
    if (signupStep === 'name-email') {
      // Validate name and email
      if (!formData.first_name.trim()) {
        toast({
          title: 'First name required',
          description: 'Please enter your first name.',
          variant: 'destructive',
        });
        return;
      }
      if (!formData.last_name.trim()) {
        toast({
          title: 'Last name required',
          description: 'Please enter your last name.',
          variant: 'destructive',
        });
        return;
      }
      if (!formData.email.trim()) {
        toast({
          title: 'Email required',
          description: 'Please enter your email address.',
          variant: 'destructive',
        });
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast({
          title: 'Invalid email',
          description: 'Please enter a valid email address.',
          variant: 'destructive',
        });
        return;
      }

      // Move to email confirmation step (email will be sent automatically)
      setSignupStep('email-confirm');
      setShowValidation(false);
    } else if (signupStep === 'email-confirm') {
      const codeString = verificationCode.join('');
      if (codeString.length !== 6) {
        toast({
          title: 'Invalid code',
          description: 'Please enter the 6-digit verification code.',
          variant: 'destructive',
        });
        return;
      }

      // Verify the code
      setLoading(true);
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            code: codeString,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to verify email');
        }

        toast({
          title: 'Email verified!',
          description: 'Your email has been verified successfully.',
        });

        setSignupStep('password');
        setShowValidation(false);
      } catch (error: any) {
        // Clear the verification code on error
        setVerificationCode(['', '', '', '', '', '']);
        toast({
          title: 'Error',
          description: error.message || 'Failed to verify email. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else if (signupStep === 'password') {
      const passwordStrength = getPasswordStrength(formData.password);
      if (!passwordStrength.isValid) {
        toast({
          title: 'Password too weak',
          description: 'Password must meet at least 4 of the requirements.',
          variant: 'destructive',
        });
        return;
      }
      if (formData.password !== confirmPassword) {
        toast({
          title: 'Passwords don\'t match',
          description: 'Please make sure both passwords are identical.',
          variant: 'destructive',
        });
        return;
      }
      setSignupStep('complete');
      handleSignup();
    }
  };

  const handlePrevStep = () => {
    setShowValidation(false);
    if (signupStep === 'email-confirm') {
      setSignupStep('name-email');
      // Don't reset emailSent - preserve the sent state
    } else if (signupStep === 'password') {
      setSignupStep('email-confirm');
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      // Complete registration with all user data
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.first_name,
          lastName: formData.last_name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete registration');
      }

      const { user } = await response.json();
      
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
      return formData.first_name.trim() && formData.last_name.trim() && formData.email.trim() && isValidEmail(formData.email);
    } else if (signupStep === 'email-confirm') {
      return verificationCode.join('').length === 6 && emailSent;
    } else if (signupStep === 'password') {
      const passwordStrength = getPasswordStrength(formData.password);
      return formData.password && confirmPassword && passwordStrength.isValid && formData.password === confirmPassword;
    }
    return true;
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
              className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
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
              className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
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
              className="w-full h-10 bg-primary/20 hover:bg-primary/30 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:scale-[0.98] border border-primary/30 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </>
              )}
            </Button>

            {onToggleMode && (
              <p className="text-center text-sm text-gray-400">
                Don't have an account? 
                <button
                  type="button"
                  onClick={onToggleMode}
                  disabled={loading}
                  className="font-medium text-primary hover:text-primary/80 transition-colors ml-1 hover:shadow-[0_0_10px_rgba(var(--primary),0.3)] px-1 py-0.5 rounded"
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
            {['name-email', 'email-confirm', 'password'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  signupStep === step 
                    ? 'bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                    : index < ['name-email', 'email-confirm', 'password'].indexOf(signupStep)
                    ? 'bg-primary/20'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-8 h-px mx-2 transition-all duration-300 ${
                    index < ['name-email', 'email-confirm', 'password'].indexOf(signupStep)
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
                    className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                      showValidation && formData.first_name && !formData.first_name.trim() ? 'border-red-500' : ''
                    }`}
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
                    className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                      showValidation && formData.last_name && !formData.last_name.trim() ? 'border-red-500' : ''
                    }`}
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
                  className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                    showValidation && formData.email && !isValidEmail(formData.email) ? 'border-red-500' : ''
                  }`}
                />
                {showValidation && formData.email && !isValidEmail(formData.email) && (
                  <p className="text-xs text-red-400 mt-1">Please enter a valid email address</p>
                )}
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
                <Label className="text-sm font-medium text-gray-300">
                  Verification Code
                </Label>
                <div className="flex gap-2 justify-center">
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleVerificationCodeChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                      onPaste={handleVerificationPaste}
                      className="w-12 h-12 text-center text-lg font-medium bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
                    />
                  ))}
                </div>
                {showValidation && verificationCode.join('').length > 0 && verificationCode.join('').length < 6 && (
                  <p className="text-xs text-yellow-400 mt-1 text-center">Please enter all 6 digits</p>
                )}
                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={async () => {
                      if (resendCooldown > 0) return;
                      
                      setLoading(true);
                      try {
                        const response = await fetch('/api/auth/send-verification', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            email: formData.email,
                            firstName: formData.first_name,
                            lastName: formData.last_name,
                          }),
                        });

                        if (!response.ok) {
                          const error = await response.json();
                          throw new Error(error.message || 'Failed to resend verification email');
                        }

                        setResendCooldown(60); // 60 second cooldown

                                              } catch (error: any) {
                          // If account already exists, go back to name-email step
                          if (error.message.includes('already exists')) {
                            setSignupStep('name-email');
                            setEmailSent(false);
                            toast({
                              title: 'Account already exists',
                              description: 'An account with this email already exists. Please use a different email or sign in.',
                              variant: 'destructive',
                            });
                          } else {
                            toast({
                              title: 'Error',
                              description: error.message || 'Failed to resend verification email. Please try again.',
                              variant: 'destructive',
                            });
                          }
                        } finally {
                          setLoading(false);
                        }
                    }}
                    disabled={loading || resendCooldown > 0}
                    className={`text-sm transition-colors underline ${
                      resendCooldown > 0 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-primary hover:text-primary/80'
                    }`}
                  >
                    {resendCooldown > 0 
                      ? `Resend available in ${resendCooldown}s` 
                      : "Didn't receive the code? Resend"
                    }
                  </button>
                </div>
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
                  className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
                />
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-400' : 
                        passwordStrength.score >= 2 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {passwordStrength.score}/5
                      </span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          {passed ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          <span className={passed ? 'text-green-400' : 'text-gray-400'}>
                            {key === 'length' && 'At least 8 characters'}
                            {key === 'uppercase' && 'One uppercase letter'}
                            {key === 'lowercase' && 'One lowercase letter'}
                            {key === 'number' && 'One number'}
                            {key === 'special' && 'One special character'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                    showValidation && confirmPassword && formData.password !== confirmPassword ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''
                  }`}
                />
                {showValidation && confirmPassword && formData.password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                )}
                {showValidation && confirmPassword && formData.password === confirmPassword && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
              </motion.div>
            </>
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
                className="flex-1 h-10 border-muted-foreground hover:bg-muted-foreground/10 hover:border-muted-foreground/60 hover:shadow-[0_0_15px_rgba(156,163,175,0.2)] transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                Back
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={loading || !canProceed()}
              className="flex-1 h-10 bg-primary/20 hover:bg-primary/30 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:scale-[0.98] border border-primary/30 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : signupStep === 'password' ? (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
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
              </button>
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 