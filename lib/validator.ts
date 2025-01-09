import * as z from "zod";

export const profileFormSchema = z.object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    photo: z.string().optional(),
    phoneNumber: z.string().regex(/^\d{10}$/, {
      message: "Please enter a valid 10-digit phone number.",
    }),
    countryCode: z.string(),
    showPhoneNumber: z.boolean(),
    country: z.string(),
    city: z.string(),
    state: z.string(),
    coverPhoto: z.string().optional(),
    status: z.string().max(200, {
      message: "Status must not exceed 200 characters.",
    }),
    dob: z.date({
      required_error: "Please select a date of birth.",
    }),
    isPhoneVerified: z.boolean().default(false),
    gender: z.enum(['male', 'female'], {
      required_error: "Please select a gender.",
    }),
  });