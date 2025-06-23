'use client';

import React from 'react';
import { StepComponentProps } from '../../types/preferences';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { DollarSign } from 'lucide-react';

export const BudgetStep: React.FC<StepComponentProps> = ({
  preferences,
  updatePreferences
}) => {
  const handleMinBudgetChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    updatePreferences({ minBudget: numValue });
  };

  const handleMaxBudgetChange = (value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    updatePreferences({ maxBudget: numValue });
  };

  return (
    <div className="space-y-6">
      {/* Budget range inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min-budget" className="text-sm font-medium text-gray-700">
            Minimum Budget
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="min-budget"
              type="number"
              placeholder="0"
              value={preferences.minBudget ?? ''}
              onChange={(e) => handleMinBudgetChange(e.target.value)}
              className="pl-10 h-12"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-budget" className="text-sm font-medium text-gray-700">
            Maximum Budget
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="max-budget"
              type="number"
              placeholder="No limit"
              value={preferences.maxBudget ?? ''}
              onChange={(e) => handleMaxBudgetChange(e.target.value)}
              className="pl-10 h-12"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Budget summary */}
      {(preferences.minBudget !== null || preferences.maxBudget !== null) && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Your budget range:
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {preferences.minBudget !== null ? `$${preferences.minBudget}` : '$0'} - {' '}
            {preferences.maxBudget !== null ? `$${preferences.maxBudget}` : 'No limit'}
          </p>
        </div>
      )}

      {/* Suggested ranges */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Popular budget ranges:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '$0 - $50', min: 0, max: 50 },
            { label: '$50 - $100', min: 50, max: 100 },
            { label: '$100 - $500', min: 100, max: 500 },
            { label: '$500+', min: 500, max: null }
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => updatePreferences({ 
                minBudget: range.min, 
                maxBudget: range.max 
              })}
              className="p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <div className="text-sm text-gray-500">
        {preferences.minBudget === null && preferences.maxBudget === null ? (
          <p>Set your preferred price range per item to see inventory that fits your budget. You can always adjust this later.</p>
        ) : (
          <p>Great! We'll show you inventory within your budget range. This helps you focus on deals you can afford.</p>
        )}
      </div>
    </div>
  );
}; 