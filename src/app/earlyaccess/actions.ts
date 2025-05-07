'use server';

import { z } from 'zod';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import { configureAmplify } from '@/amplify-config';

// Ensure Amplify is configured for the server context
configureAmplify();

// Re-define the schema slightly for server action validation
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string()
    .optional()
    .refine((val) => {
      if (val === undefined || val.trim() === "") return true; // Allow empty or undefined for optional field
      const digitsOnly = val.replace(/\D/g, "");
      return /^\d{10}$/.test(digitsOnly);
    }, {
      message: "If provided, phone number must be exactly 10 digits"
    }),
  termsAccepted: z.boolean().refine(value => value === true, {
    message: "You must accept the terms and conditions"
  })
});

type FormData = z.infer<typeof formSchema>;

// Define the return type for the server action
interface ActionResult {
  success: boolean;
  message?: string;
}

export async function submitEarlyAccessForm(data: FormData): Promise<ActionResult> {

  const validationResult = formSchema.safeParse(data);
  if (!validationResult.success) {
    console.error('Server-side validation failed:', validationResult.error.flatten());
    return { success: false, message: 'Invalid form data submitted.' };
  }

  const validatedData = validationResult.data;

  try {
    const serverClient = generateClient<Schema>();

    // 1. Check if email already exists
    console.log(`Checking for existing registration with email: ${validatedData.email}`);
    const { data: existingRegistrations, errors: checkErrors } = await serverClient.models.EarlyAccessRegistration.list({
      filter: {
        email: { eq: validatedData.email }
      }
    });

    if (checkErrors) {
      console.error('Error checking for existing email:', checkErrors);
      return { success: false, message: 'Error checking registration status. Please try again.' };
    }

    if (existingRegistrations && existingRegistrations.length > 0) {
      console.log('Email already registered:', validatedData.email);
      return { success: false, message: 'This email address has already been registered.' };
    }

    console.log('Email not found, proceeding with registration.');

    // 2. If email does not exist, create the record
    // Format phone number only if provided
    const phoneNumberInput = validatedData.phoneNumber?.replace(/\D/g, '');
    const formattedPhoneNumber = phoneNumberInput && phoneNumberInput.length > 0 ? `+1${phoneNumberInput}` : undefined;

    const { data: newRegistration, errors: createErrors } = await serverClient.models.EarlyAccessRegistration.create({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      companyName: validatedData.companyName || undefined, // Pass undefined if empty or not provided
      email: validatedData.email,
      phoneNumber: formattedPhoneNumber, // Pass formatted or undefined
      termsAccepted: validatedData.termsAccepted,
      registrationDate: new Date().toISOString(),
    });

    if (createErrors) {
      console.error('Amplify create errors:', createErrors);
      // Provide a more specific error if possible, otherwise generic
      const errorMessage = createErrors[0]?.message || 'Failed to save registration due to a database error.';
      return { success: false, message: errorMessage };
    }

    console.log('Successfully created registration:', newRegistration);
    return { success: true };

  } catch (error) {
    console.error('Error submitting early access form:', error);
    // Handle potential errors during client generation or unexpected issues
    return { success: false, message: 'An unexpected server error occurred. Please try again.' };
  }
} 