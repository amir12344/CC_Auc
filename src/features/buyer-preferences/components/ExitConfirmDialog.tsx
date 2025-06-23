'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';

interface ExitConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitConfirmDialog: React.FC<ExitConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Confirm exit
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to exit without finishing answering questions about your preferences?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            Back
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="px-6 bg-gray-900 hover:bg-gray-800"
          >
            Exit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 