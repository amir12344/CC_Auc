"use client";

import React from "react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface ExitConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitConfirmDialog: React.FC<ExitConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Confirm exit
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Are you sure you want to exit without finishing answering questions
            about your preferences?
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} className="px-6">
            Back
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="bg-gray-900 px-6 hover:bg-gray-800"
          >
            Exit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
