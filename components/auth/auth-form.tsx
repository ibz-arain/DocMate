import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ArrowRight, Mail, Lock, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

type SignupStep = 'name-email' | 'email-confirm' | 'password' | 'phone' | 'complete';
type ForgotPasswordStep = 'email' | 'code' | 'password';

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [loading, setLoading] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>('name-email');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sentVerificationCode, setSentVerificationCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  
  // Forgot password modal states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordCode, setForgotPasswordCode] = useState(['', '', '', '', '', '']);
  const [forgotPasswordNewPassword, setForgotPasswordNewPassword] = useState('');
  const [forgotPasswordConfirmPassword, setForgotPasswordConfirmPassword] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState<{ [key: string]: string }>({});
  const [forgotPasswordEmailSent, setForgotPasswordEmailSent] = useState(false);
  const [forgotPasswordResendCooldown, setForgotPasswordResendCooldown] = useState(0);
  const [forgotPasswordSentCode, setForgotPasswordSentCode] = useState('');
  const forgotPasswordInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
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
      phone_number: '',
    });
    setSignupStep('name-email');
    setVerificationCode(['', '', '', '', '', '']);
    setConfirmPassword('');
    setShowValidation(false);
    setEmailSent(false);
    setResendCooldown(0);
    setSentVerificationCode('');
    setEmailVerified(false);
    setFormErrors({});
  }, [mode]);

  // Reset forgot password modal when closed
  useEffect(() => {
    if (!showForgotPassword) {
      setForgotPasswordStep('email');
      setForgotPasswordEmail('');
      setForgotPasswordCode(['', '', '', '', '', '']);
      setForgotPasswordNewPassword('');
      setForgotPasswordConfirmPassword('');
      setForgotPasswordLoading(false);
      setForgotPasswordErrors({});
      setForgotPasswordEmailSent(false);
      setForgotPasswordResendCooldown(0);
      setForgotPasswordSentCode('');
    }
  }, [showForgotPassword]);

  // Handle forgot password resend cooldown
  useEffect(() => {
    if (forgotPasswordResendCooldown > 0) {
      const timer = setTimeout(() => setForgotPasswordResendCooldown(forgotPasswordResendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotPasswordResendCooldown]);

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
    setFormErrors({});
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

      const result = await response.json();
      // Store the verification code that was sent
      setSentVerificationCode(result.code);
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
        setFormErrors({ general: 'An account with this email already exists. Please use a different email or sign in.' });
      } else {
        setFormErrors({ general: error.message || 'Failed to send verification email. Please try again.' });
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

  const isValidPhoneNumber = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  // Forgot password helper functions
  const handleForgotPasswordCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...forgotPasswordCode];
    newCode[index] = value;
    setForgotPasswordCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      forgotPasswordInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotPasswordKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !forgotPasswordCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      forgotPasswordInputRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotPasswordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    
    if (pastedData.length === 6) {
      const digits = pastedData.split('');
      setForgotPasswordCode(digits);
      
      // Focus the last input after pasting
      setTimeout(() => {
        forgotPasswordInputRefs.current[5]?.focus();
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

  const sendForgotPasswordCode = async () => {
    setForgotPasswordLoading(true);
    setForgotPasswordErrors({});
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send reset code');
      }

      const result = await response.json();
      setForgotPasswordSentCode(result.code);
      setForgotPasswordEmailSent(true);
      setForgotPasswordStep('code');
      toast({
        title: 'Reset code sent!',
        description: 'Please check your email for the verification code.',
      });
    } catch (error: any) {
      setForgotPasswordErrors({ general: error.message || 'Failed to send reset code. Please try again.' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const verifyForgotPasswordCode = async () => {
    const codeString = forgotPasswordCode.join('');
    if (codeString.length !== 6) {
      setForgotPasswordErrors({ general: 'Please enter the 6-digit verification code.' });
      return;
    }

    // Check if the entered code matches the sent code
    if (codeString !== forgotPasswordSentCode) {
      setForgotPasswordErrors({ general: 'The verification code you entered is incorrect. Please try again.' });
      setForgotPasswordCode(['', '', '', '', '', '']);
      return;
    }

    setForgotPasswordStep('password');
    setForgotPasswordErrors({});
  };

  const resetPassword = async () => {
    setForgotPasswordLoading(true);
    setForgotPasswordErrors({});
    
    const passwordStrength = getPasswordStrength(forgotPasswordNewPassword);
    if (!passwordStrength.isValid) {
      setForgotPasswordErrors({ general: 'Password must meet at least 4 of the requirements.' });
      setForgotPasswordLoading(false);
      return;
    }
    
    if (forgotPasswordNewPassword !== forgotPasswordConfirmPassword) {
      setForgotPasswordErrors({ general: 'Please make sure both passwords are identical.' });
      setForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail,
          code: forgotPasswordCode.join(''),
          newPassword: forgotPasswordNewPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
      }

      toast({
        title: 'Password reset successful!',
        description: 'Your password has been updated. You can now sign in with your new password.',
      });
      
      setShowForgotPassword(false);
      
      // Pre-fill email in the sign-in form
      setFormData(prev => ({ ...prev, email: forgotPasswordEmail }));
    } catch (error: any) {
      setForgotPasswordErrors({ general: error.message || 'Failed to reset password. Please try again.' });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleNextStep = async () => {
    setShowValidation(true);
    setFormErrors({});
    
    if (signupStep === 'name-email') {
      // Validate name and email
      if (!formData.first_name.trim()) {
        setFormErrors({ general: 'First name is required.' });
        return;
      }
      if (!formData.last_name.trim()) {
        setFormErrors({ general: 'Last name is required.' });
        return;
      }
      if (!formData.email.trim()) {
        setFormErrors({ general: 'Email address is required.' });
        return;
      }
      if (!isValidEmail(formData.email)) {
        setFormErrors({ general: 'Please enter a valid email address.' });
        return;
      }

      // Move to email confirmation step (email will be sent automatically)
      setSignupStep('email-confirm');
      setShowValidation(false);
    } else if (signupStep === 'email-confirm') {
      const codeString = verificationCode.join('');
      if (codeString.length !== 6) {
        setFormErrors({ general: 'Please enter the 6-digit verification code.' });
        return;
      }

      // Check if the entered code matches the sent code
      if (codeString !== sentVerificationCode) {
        setFormErrors({ general: 'The verification code you entered is incorrect. Please try again.' });
        setVerificationCode(['', '', '', '', '', '']);
        return;
      }

      setSignupStep('password');
      setShowValidation(false);
      setEmailVerified(true);
    } else if (signupStep === 'password') {
      const passwordStrength = getPasswordStrength(formData.password);
      if (!passwordStrength.isValid) {
        setFormErrors({ general: 'Password must meet at least 4 of the requirements.' });
        return;
      }
      if (formData.password !== confirmPassword) {
        setFormErrors({ general: 'Please make sure both passwords are identical.' });
        return;
      }
      setSignupStep('phone');
      setShowValidation(false);
    } else if (signupStep === 'phone') {
      if (formData.phone_number && !isValidPhoneNumber(formData.phone_number)) {
        setFormErrors({ general: 'Please enter a valid phone number or leave it empty.' });
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
    } else if (signupStep === 'phone') {
      setSignupStep('password');
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setFormErrors({});
    try {
      // Create the account with all user data
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create account');
      }

      const { user } = await response.json();
      
      // Automatically sign in the user after successful registration
      await login({
        email: formData.email,
        password: formData.password
      });
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created and you are now signed in.',
      });
      onSuccess?.();
    } catch (error: any) {
      setFormErrors({
        general: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors({});

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
      setFormErrors({
        general: error.message || 'Something went wrong. Please try again.'
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
    } else if (signupStep === 'phone') {
      return !formData.phone_number || isValidPhoneNumber(formData.phone_number);
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300">Password</Label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                disabled={loading}
                className="text-xs text-primary hover:text-primary/80 transition-colors hover:underline"
              >
                Forgot password?
              </button>
            </div>
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

            {formErrors.general && (
              <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{formErrors.general}</p>
              </div>
            )}

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

        {/* Forgot Password Modal */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-[500px] bg-black/95 backdrop-blur-lg border-gray-200/20">
            <DialogHeader>
              <DialogTitle className="font-mono text-2xl text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Reset Password
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={forgotPasswordStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {forgotPasswordStep === 'email' && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-white mb-2">Enter your email</h3>
                        <p className="text-gray-400 text-sm">
                          We'll send you a verification code to reset your password
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-300">Email</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="email@example.com"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                          disabled={forgotPasswordLoading}
                          className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
                        />
                      </div>

                      <Button
                        onClick={sendForgotPasswordCode}
                        disabled={forgotPasswordLoading || !forgotPasswordEmail || !isValidEmail(forgotPasswordEmail)}
                        className="w-full h-10 bg-primary/20 hover:bg-primary/30 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:scale-[0.98] border border-primary/30"
                      >
                        {forgotPasswordLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          'Send Reset Code'
                        )}
                      </Button>
                    </div>
                  )}

                  {forgotPasswordStep === 'code' && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Mail className="w-12 h-12 text-primary mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-white mb-2">Enter verification code</h3>
                        <p className="text-gray-400 text-sm">
                          We've sent a 6-digit code to <span className="text-primary">{forgotPasswordEmail}</span>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-300">Verification Code</Label>
                        <div className="flex gap-2 justify-center">
                          {forgotPasswordCode.map((digit, index) => (
                            <Input
                              key={index}
                              ref={(el) => {
                                forgotPasswordInputRefs.current[index] = el;
                              }}
                              type="text"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleForgotPasswordCodeChange(index, e.target.value.replace(/\D/g, ''))}
                              onKeyDown={(e) => handleForgotPasswordKeyDown(index, e)}
                              onPaste={handleForgotPasswordPaste}
                              disabled={forgotPasswordLoading}
                              className="w-12 h-12 text-center text-lg font-medium bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
                            />
                          ))}
                        </div>
                        
                        <div className="text-center mt-4">
                          <button
                            type="button"
                            onClick={async () => {
                              if (forgotPasswordResendCooldown > 0) return;
                              
                              setForgotPasswordResendCooldown(60);
                              await sendForgotPasswordCode();
                            }}
                            disabled={forgotPasswordLoading || forgotPasswordResendCooldown > 0}
                            className={`text-sm transition-colors underline ${
                              forgotPasswordResendCooldown > 0
                                ? 'text-gray-500 cursor-not-allowed' 
                                : 'text-primary hover:text-primary/80'
                            }`}
                          >
                            {forgotPasswordResendCooldown > 0 
                              ? `Resend available in ${forgotPasswordResendCooldown}s` 
                              : "Didn't receive the code? Resend"
                            }
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setForgotPasswordStep('email')}
                          disabled={forgotPasswordLoading}
                          variant="outline"
                          className="flex-1 h-10 border-muted-foreground hover:bg-muted-foreground/10"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={verifyForgotPasswordCode}
                          disabled={forgotPasswordLoading || forgotPasswordCode.join('').length !== 6}
                          className="flex-1 h-10 bg-primary/20 hover:bg-primary/30 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] border border-primary/30"
                        >
                          Verify Code
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {forgotPasswordStep === 'password' && (
                    <div className="space-y-4">
                      <div className="text-center mb-4">
                        <Lock className="w-12 h-12 text-primary mx-auto mb-2" />
                        <h3 className="text-lg font-medium text-white mb-2">Set new password</h3>
                        <p className="text-gray-400 text-sm">
                          Create a strong password for your account
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="forgot-new-password" className="text-sm font-medium text-gray-300">New Password</Label>
                        <Input
                          id="forgot-new-password"
                          type="password"
                          placeholder="Create a strong password"
                          value={forgotPasswordNewPassword}
                          onChange={(e) => setForgotPasswordNewPassword(e.target.value)}
                          required
                          disabled={forgotPasswordLoading}
                          className="bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out"
                        />
                        
                        {/* Password strength indicator */}
                        {forgotPasswordNewPassword && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400">Password strength:</span>
                              <span className={`font-medium ${
                                getPasswordStrength(forgotPasswordNewPassword).score >= 4 ? 'text-green-400' : 
                                getPasswordStrength(forgotPasswordNewPassword).score >= 2 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {getPasswordStrength(forgotPasswordNewPassword).score}/5
                              </span>
                            </div>
                            <div className="space-y-1">
                              {Object.entries(getPasswordStrength(forgotPasswordNewPassword).checks).map(([key, passed]) => (
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="forgot-confirm-password" className="text-sm font-medium text-gray-300">Confirm Password</Label>
                        <Input
                          id="forgot-confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={forgotPasswordConfirmPassword}
                          onChange={(e) => setForgotPasswordConfirmPassword(e.target.value)}
                          required
                          disabled={forgotPasswordLoading}
                          className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                            forgotPasswordConfirmPassword && forgotPasswordNewPassword !== forgotPasswordConfirmPassword ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : ''
                          }`}
                        />
                        {forgotPasswordConfirmPassword && forgotPasswordNewPassword !== forgotPasswordConfirmPassword && (
                          <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                        )}
                        {forgotPasswordConfirmPassword && forgotPasswordNewPassword === forgotPasswordConfirmPassword && (
                          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Passwords match
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setForgotPasswordStep('code')}
                          disabled={forgotPasswordLoading}
                          variant="outline"
                          className="flex-1 h-10 border-muted-foreground hover:bg-muted-foreground/10"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={resetPassword}
                          disabled={
                            forgotPasswordLoading || 
                            !forgotPasswordNewPassword || 
                            !forgotPasswordConfirmPassword ||
                            forgotPasswordNewPassword !== forgotPasswordConfirmPassword ||
                            !getPasswordStrength(forgotPasswordNewPassword).isValid
                          }
                          className="flex-1 h-10 bg-primary/20 hover:bg-primary/30 font-medium transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] border border-primary/30"
                        >
                          {forgotPasswordLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Reset Password
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {forgotPasswordErrors.general && (
                    <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-400">{forgotPasswordErrors.general}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </DialogContent>
        </Dialog>
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  signupStep === step 
                    ? 'bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.5)]' 
                    : index < ['name-email', 'email-confirm', 'password', 'phone'].indexOf(signupStep)
                    ? 'bg-primary/20'
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-px mx-2 transition-all duration-300 ${
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
                      disabled={emailVerified}
                      className={`w-12 h-12 text-center text-lg font-medium bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                        emailVerified ? 'opacity-60 cursor-not-allowed border-green-500' : ''
                      }`}
                    />
                  ))}
                </div>
                

                
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={async () => {
                      if (resendCooldown > 0) return;
                      
                      setLoading(true);
                      setFormErrors({});
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

                        const result = await response.json();
                        // Store the new verification code
                        setSentVerificationCode(result.code);
                        setResendCooldown(60); // 60 second cooldown
                      } catch (error: any) {
                        // If account already exists, go back to name-email step
                        if (error.message.includes('already exists')) {
                          setSignupStep('name-email');
                          setEmailSent(false);
                          setFormErrors({ general: 'An account with this email already exists. Please use a different email or sign in.' });
                        } else {
                          setFormErrors({ general: error.message || 'Failed to resend verification email. Please try again.' });
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading || resendCooldown > 0 || emailVerified}
                    className={`text-sm transition-colors underline ${
                      resendCooldown > 0 || emailVerified
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-primary hover:text-primary/80'
                    }`}
                  >
                    {resendCooldown > 0 
                      ? `Resend available in ${resendCooldown}s` 
                      : emailVerified 
                      ? "Email verified ✓"
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
                  className={`bg-black/50 border-gray-800 focus:border-primary focus:shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:border-primary/60 hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-all duration-300 ease-out ${
                    showValidation && formData.phone_number && !isValidPhoneNumber(formData.phone_number) ? 'border-red-500' : ''
                  }`}
                />
                {showValidation && formData.phone_number && !isValidPhoneNumber(formData.phone_number) && (
                  <p className="text-xs text-red-400 mt-1">Please enter a valid phone number or leave empty</p>
                )}
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
              ) : signupStep === 'phone' ? (
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

          {formErrors.general && (
            <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg mt-4">
              <p className="text-sm text-red-400">{formErrors.general}</p>
            </div>
          )}

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