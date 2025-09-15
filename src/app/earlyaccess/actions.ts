"use server";

import { generateClient } from "aws-amplify/data";
import { z } from "zod";

// IMPORTANT: This import is crucial. It ensures that the Amplify library is configured
// on the server-side before any Amplify-dependent code below (like generateClient)
// is executed. The '@/amplify-config' module automatically calls Amplify.configure()
// when it is loaded (imported).
// Import for its side-effect of configuring Amplify
import { outputs } from "@/amplify-config";
import { type Schema } from "@/amplify/data/resource";

// Re-define the schema slightly for server action validation
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val.trim() === "") return true; // Allow empty or undefined for optional field
        const digitsOnly = val.replace(/\D/g, "");
        return /^\d{10}$/.test(digitsOnly);
      },
      {
        message: "If provided, phone number must be exactly 10 digits",
      }
    ),
  termsAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Define the return type for the server action
interface ActionResult {
  success: boolean;
  message?: string;
}

export async function submitEarlyAccessForm(
  data: FormData
): Promise<ActionResult> {
  const validationResult = formSchema.safeParse(data);
  if (!validationResult.success) {
    return { success: false, message: "Invalid form data submitted." };
  }

  const validatedData = validationResult.data;

  try {
    const serverClient = generateClient<Schema>();

    // 1. Check if email already exists
    const { data: existingRegistrations, errors: checkErrors } =
      await serverClient.models.EarlyAccessRegistration.list({
        filter: {
          email: { eq: validatedData.email },
        },
      });

    if (checkErrors) {
      return {
        success: false,
        message: "Error checking registration status. Please try again.",
      };
    }

    if (existingRegistrations && existingRegistrations.length > 0) {
      return {
        success: false,
        message: "This email address has already been registered.",
      };
    }

    // 2. If email does not exist, create the record
    // Format phone number only if provided
    const phoneNumberInput = validatedData.phoneNumber?.replace(/\D/g, "");
    const formattedPhoneNumber =
      phoneNumberInput && phoneNumberInput.length > 0
        ? `+1${phoneNumberInput}`
        : undefined;

    const { data: newRegistration, errors: createErrors } =
      await serverClient.models.EarlyAccessRegistration.create({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        companyName: validatedData.companyName || undefined, // Pass undefined if empty or not provided
        email: validatedData.email,
        phoneNumber: formattedPhoneNumber, // Pass formatted or undefined
        termsAccepted: validatedData.termsAccepted,
        registrationDate: new Date().toISOString(),
      });

    if (createErrors) {
      // Provide a more specific error if possible, otherwise generic
      const errorMessage =
        createErrors[0]?.message ||
        "Failed to save registration due to a database error.";
      return { success: false, message: errorMessage };
    }

    return { success: true };
  } catch (error) {
    // Handle potential errors during client generation or unexpected issues
    return {
      success: false,
      message: "An unexpected server error occurred. Please try again.",
    };
  }
}
