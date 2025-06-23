'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  CheckCircle,
  Shield,
  AlertCircle,
  Star,
  ArrowRight,
  Loader2,
  Upload,
  FileText,
  Award,
  Sparkles,
  Check,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import Logo from '@/src/features/website/components/ui/Logo';
import { useToast } from '@/src/hooks/use-toast';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import { Hub } from 'aws-amplify/utils';
import '@aws-amplify/ui-react/styles.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/src/lib/store';
import { initializeAuth } from '@/src/features/authentication/store/authSlice';

export default function CertificateUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  const redirectTo = searchParams.get('redirect') || '/marketplace';
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Proactively initialize auth state if not authenticated on load
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Certificate Upload Page: Not authenticated, dispatching initializeAuth...');
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthenticated]);

  // Debug: Log authentication state
  useEffect(() => {
    console.log('Certificate Upload Page - Auth State:', {
      isLoading,
      isAuthenticated,
      user: user ? {
        userId: user.userId,
        username: user.username,
        identityId: user.identityId,
        hasAttributes: !!user.attributes
      } : null
    });
  }, [isLoading, isAuthenticated, user]);

  // Listen to Hub events for authentication changes
  useEffect(() => {
    const hubListener = Hub.listen('auth', ({ payload }) => {
      console.log('Auth Hub Event:', payload);

      switch (payload.event) {
        case 'signedIn':
          console.log('User signed in via Hub event');
          break;
        case 'signedOut':
          console.log('User signed out via Hub event');
          router.push('/auth/login');
          break;
        case 'tokenRefresh':
          console.log('Auth tokens refreshed via Hub event');
          break;
        case 'tokenRefresh_failure':
          console.log('Token refresh failed via Hub event');
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your authentication session has expired. Please refresh the page.",
          });
          break;
        default:
          console.log('Unhandled auth event:', payload.event);
      }
    });

    // Cleanup listener on unmount
    return () => hubListener();
  }, [router, toast]);

  // Show error state if user doesn't have identityId (not fully authenticated)
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.identityId) {
      console.warn('Certificate Upload Page: User is authenticated but identityId is missing. This will likely cause issues with private storage access.');
      toast({
        variant: "destructive",
        title: "Authentication Issue",
        description: "Your user session is not fully initialized. Please refresh the page or try logging in again.",
      });
    }
  }, [isLoading, isAuthenticated, user, toast]);

  // Handle authentication redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not authenticated after checking, so redirect to login.
      // This will only run after the initializeAuth call has completed.
      console.log('Redirecting to login, authentication check failed.');
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  const updateCertificateAttributes = async (filePaths: string[]) => {
    try {
      const { updateUserAttributes } = await import('aws-amplify/auth');
      await updateUserAttributes({
        userAttributes: {
          "custom:hasCert": "true",
          "custom:certPaths": filePaths.join(','),
          "custom:certUploadDate": new Date().toISOString(),
          "custom:certStatus": "pending"
        }
      });
      console.log('User attributes updated successfully');
    } catch (error) {
      console.error('Error updating user attributes:', error);
    }
  };

  const handleUploadSuccess = ({ key }: { key?: string | undefined }) => {
    if (!key) {
      console.error('Upload success but no key was provided by the FileUploader component.');
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "File uploaded, but there was an issue processing the file details. Please try again or contact support.",
      });
      return;
    }

    console.log('File uploaded successfully:', key);
    setUploadedFiles(prev => [...prev, key]);
    setUploadError(null);

    // Update user attributes with uploaded file path
    const allUploadedFiles = [...uploadedFiles, key];
    updateCertificateAttributes(allUploadedFiles);

    setUploadSuccess(true);

    // Show success toast
    toast({
      title: "Certificate Uploaded! 🎉",
      description: "Your certificate has been uploaded successfully and is now under review.",
    });
  };

  const handleUploadError = (error: string, file: { key: string }) => {
    console.error('Upload error:', error, 'for file key:', file.key);
    const errorMessage = error || 'Failed to upload file. Please try again.';
    setUploadError(errorMessage);

    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: errorMessage,
    });
  };

  const handleSkip = () => {
    router.push(redirectTo);
  };

  const handleContinue = () => {
    toast({
      title: "Welcome to Commerce Central! 🚀",
      description: "Taking you to your dashboard...",
    });
    router.push(redirectTo);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#43CD66]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-[#43CD66] mx-auto" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-[#43CD66]/20 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Verifying Authentication</h3>
            <p className="text-slate-600">Please wait while we verify your session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Authentication Required</h3>
            <p className="text-slate-600">Please sign in to upload certificates</p>
            <p className="text-sm text-slate-500">Redirecting to login page...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if user doesn't have identityId (not fully authenticated)
  if (!user?.identityId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-500 mx-auto" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-yellow-500/20 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">Completing Authentication</h3>
            <p className="text-slate-600">Setting up your secure upload session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#43CD66]/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo />
            <Badge className="bg-gradient-to-r from-[#43CD66] to-emerald-500 text-white shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Final Step
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">

        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4">
            Welcome to Commerce Central!
          </h1>
          <p className="text-xl text-slate-600 flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-[#43CD66]" />
            Account created successfully!
            <Sparkles className="w-5 h-5 text-[#43CD66]" />
          </p>
          <p className="text-lg text-slate-500">
            Complete your setup by uploading your reseller certificate
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">

            {/* Left Column - Benefits & Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">
                  Upload Reseller Certificate
                </h2>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Verify your business credentials to unlock exclusive wholesale pricing and premium features.
                </p>

                {/* Benefits */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#43CD66] to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Verified Business Status</h3>
                      <p className="text-slate-600">Get verified badge and build trust with suppliers</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Wholesale Pricing</h3>
                      <p className="text-slate-600">Access exclusive wholesale rates and bulk discounts</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Priority Support</h3>
                      <p className="text-slate-600">Get faster response times and dedicated assistance</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-2">Exclusive Network</h3>
                      <p className="text-slate-600">Connect with verified suppliers and buyers</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Upload Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">

                {/* Upload Area */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload Your Certificate</h3>
                    <p className="text-slate-600">Drag and drop your file or click to browse</p>
                  </div>

                  <div className="relative">
                    <div className="border-2 border-dashed border-[#43CD66]/30 rounded-xl p-8 bg-gradient-to-br from-[#43CD66]/5 to-emerald-50/30 hover:border-[#43CD66]/50 transition-all duration-300 group">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#43CD66]/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto group-hover:from-[#43CD66]/30 group-hover:to-emerald-500/30 transition-all duration-300">
                          <Upload className="w-8 h-8 text-[#43CD66] group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        <FileUploader
                          acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
                          path={({ identityId }) => {
                            if (!identityId) {
                              console.error('FileUploader: identityId is not available for path construction.');
                              return 'ERROR_MISSING_IDENTITY_ID/';
                            }
                            return `ReSellCertificates/private/${identityId}/`;
                          }}
                          maxFileCount={1}
                          isResumable
                          onUploadSuccess={handleUploadSuccess}
                          onUploadError={handleUploadError}
                        />
                      </div>
                    </div>

                    {/* File Requirements */}
                    <div className="mt-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <FileText className="w-4 h-4" />
                        <span>PDF, PNG, JPG • Max 5MB per file</span>
                      </div>
                    </div>
                  </div>

                  {/* Success State */}
                  {uploadSuccess && uploadedFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-800 text-lg">Certificate Uploaded Successfully!</h3>
                          <p className="text-green-600">Your certificate is now under review and you'll be notified once approved.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Error State */}
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-800 text-lg">Upload Failed</h3>
                          <p className="text-red-600">{uploadError}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-4 pt-4">
                    {uploadSuccess && uploadedFiles.length > 0 && (
                      <Button
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-[#43CD66] to-emerald-500 hover:from-emerald-500 hover:to-[#43CD66] text-white font-semibold py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Continue to Dashboard
                      </Button>
                    )}

                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="w-full text-slate-600 hover:text-slate-800 border-slate-300 hover:bg-slate-50 py-4 text-base rounded-xl transition-all duration-300"
                    >
                      Skip for now
                    </Button>
                  </div>

                  {/* Footer Note */}
                  <div className="text-center pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      You can upload your certificate later from your profile settings
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 