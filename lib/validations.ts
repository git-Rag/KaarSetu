import { z } from 'zod';

const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Password is required'),
});

const registerFieldsBase = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['WORKER', 'ASSESSOR', 'EMPLOYER']),
  trade: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  itiName: z.string().optional(),
  itiCode: z.string().optional(),
  district: z.string().optional(),
  companyName: z.string().optional(),
  gstNumber: z.string().optional(),
});

function registerRoleRefine(data: z.infer<typeof registerFieldsBase>, ctx: z.RefinementCtx) {
  if (data.role === 'WORKER') {
    if (!data.trade)
      ctx.addIssue({ code: 'custom', message: 'Trade is required', path: ['trade'] });
    if (!data.state)
      ctx.addIssue({ code: 'custom', message: 'State is required', path: ['state'] });
    if (!data.city)
      ctx.addIssue({ code: 'custom', message: 'City is required', path: ['city'] });
  }
  if (data.role === 'ASSESSOR') {
    if (!data.itiName)
      ctx.addIssue({ code: 'custom', message: 'ITI name is required', path: ['itiName'] });
    if (!data.itiCode)
      ctx.addIssue({ code: 'custom', message: 'ITI code is required', path: ['itiCode'] });
    if (!data.district)
      ctx.addIssue({ code: 'custom', message: 'District is required', path: ['district'] });
    if (!data.state)
      ctx.addIssue({ code: 'custom', message: 'State is required', path: ['state'] });
  }
  if (data.role === 'EMPLOYER') {
    if (!data.companyName)
      ctx.addIssue({
        code: 'custom',
        message: 'Company name is required',
        path: ['companyName'],
      });
    if (!data.city)
      ctx.addIssue({ code: 'custom', message: 'City is required', path: ['city'] });
    if (!data.state)
      ctx.addIssue({ code: 'custom', message: 'State is required', path: ['state'] });
  }
}

export const registerStep1Schema = registerFieldsBase
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine(registerRoleRefine);

export const registerSchema = registerFieldsBase
  .extend({
    aadhaarLast4: z.string().regex(/^\d{4}$/, 'Enter last 4 digits of Aadhaar'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .superRefine(registerRoleRefine);

const taskResultSchema = z.enum(['PASS', 'PARTIAL', 'FAIL']);

const taskAssessmentSchema = z.object({
  result: taskResultSchema,
  note: z.string().max(500).optional(),
});

export const checklistDataSchema = z.record(taskAssessmentSchema);

export const assessmentCreateSchema = z.object({
  workerProfileId: z.string().min(1),
  trade: z.enum(['electrician', 'plumber', 'painter'] as [string, ...string[]]),
  nsqfLevel: z.enum(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5']),
});

export const assessmentPatchSchema = z.object({
  checklistData: checklistDataSchema.optional(),
  evidenceUrls: z.array(z.string()).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['PENDING', 'PASSED', 'FAILED']).optional(),
});

export const attestationSchema = z.object({
  tokenId: z.string().min(1),
  projectName: z.string().min(2),
  projectDetails: z.string().min(10),
  durationMonths: z.number().min(1).max(120),
  rating: z.number().min(1).max(5),
});

export const workerPatchSchema = z.object({
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const tokenRevokeSchema = z.object({
  revokeReason: z.string().min(5),
});
