import { useCallback, useState } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
import { useToast } from '@/src/hooks/use-toast';

// Constants
export const ACCEPTED_FILE_TYPES = '.xlsx,.xls,.csv';
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Helper to get identityId from the auth session - Amplify Gen 2 pattern
async function getCurrentIdentityId(): Promise<string> {
  try {
    const session = await fetchAuthSession();
    const identityId = session.identityId;
    if (!identityId) {
      throw new Error('Identity ID not found in auth session.');
    }
    return identityId;
  } catch (error) {
    if (error instanceof Error && error.name === 'UserUnAuthenticatedException') {
      throw new Error('Please sign in to upload files.');
    }
    throw new Error('Could not resolve user identity. Please try signing out and back in.');
  }
}

// File validation utility
const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }

  const allowedTypes = ['.xlsx', '.xls', '.csv'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (!allowedTypes.includes(fileExtension)) {
    return 'Please select a valid Excel file (.xlsx, .xls, .csv)';
  }

  return null;
};

// Generate unique filename utility
const generateFileName = (originalName: string, prefix: string): string => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalName.split('.').pop();
  return `${prefix}-${timestamp}-${randomSuffix}.${fileExtension}`;
};

export interface UseFileUploadOptions {
  onProgressUpdate?: (type: string, progress: number) => void;
}

export interface FileUploadResult {
  validateFile: (file: File) => string | null;
  uploadFileToS3: (
    file: File,
    folderPath: string,
    filePrefix: string,
    progressType: string
  ) => Promise<string>;
  getCurrentUserAndIdentity: () => Promise<{ userId: string; identityId: string }>;
}

/**
 * Custom hook for file upload functionality
 * Provides file validation, S3 upload, and authentication utilities
 */
export const useFileUpload = (options?: UseFileUploadOptions): FileUploadResult => {
  const { toast } = useToast();

  const uploadFileToS3 = useCallback(async (
    file: File,
    folderPath: string,
    filePrefix: string,
    progressType: string
  ): Promise<string> => {
    const fileName = generateFileName(file.name, filePrefix);
    const identityId = await getCurrentIdentityId();
    const fullPath = `${folderPath}${identityId}/${fileName}`;
    
    try {
      // Amplify Gen 2 pattern: Following official documentation with private/ access control
      const result = await uploadData({
        path: fullPath,
        data: file,
        options: {
          contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes && options?.onProgressUpdate) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              options.onProgressUpdate(progressType, progress);
            }
          },
        },
      }).result;

      return result.path;
    } catch (error) {
      // Amplify Gen 2: Better error handling with specific error types
      if (error instanceof Error) {
        if (error.name === 'NetworkError') {
          throw new Error(`Network error uploading ${progressType} file. Please check your connection.`);
        }
        if (error.name === 'StorageError') {
          throw new Error(`Storage error uploading ${progressType} file. Please try again.`);
        }
      }
      throw new Error(`Failed to upload ${progressType} file`);
    }
  }, [options]);

  const getCurrentUserAndIdentity = useCallback(async () => {
    // Amplify Gen 2: Get user information with proper error handling
    const [user, identityId] = await Promise.all([
      getCurrentUser(),
      getCurrentIdentityId()
    ]);
    
    return {
      userId: user.userId,
      identityId
    };
  }, []);

  return {
    validateFile,
    uploadFileToS3,
    getCurrentUserAndIdentity,
  };
}; 