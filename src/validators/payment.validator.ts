import { z } from 'zod';

export const purchaseCourseSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
});

export const updatePaymentSchema = z.object({
  purchaseId: z.string().min(1, 'purchaseId is required'),
});

export type PurchaseCourseInput = z.infer<typeof purchaseCourseSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
