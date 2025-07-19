import { z } from 'zod';

// Validation schema for indicator data
export const IndicatorDataSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Indicator name is required'),
  value: z.number(),
  unit: z.string().optional(),
  category: z.string(),
  project_id: z.string(),
  date: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export const BulkIndicatorSchema = z.object({
  indicators: z.array(IndicatorDataSchema),
  project_id: z.string(),
  uploaded_by: z.string().optional(),
});

// Export types
export type IndicatorData = z.infer<typeof IndicatorDataSchema>;
export type BulkIndicator = z.infer<typeof BulkIndicatorSchema>;

// Validation functions
export function validateIndicatorData(data: unknown): IndicatorData {
  return IndicatorDataSchema.parse(data);
}

export function validateBulkIndicators(data: unknown): BulkIndicator {
  return BulkIndicatorSchema.parse(data);
}

export function safeParseIndicatorData(data: unknown) {
  return IndicatorDataSchema.safeParse(data);
}

export function safeParseBulkIndicators(data: unknown) {
  return BulkIndicatorSchema.safeParse(data);
}

// Additional validation functions for indicator hooks
export interface IndicatorValidationRules {
  required: boolean;
  minValue?: number;
  maxValue?: number;
  allowedValues?: string[];
}

export function getValidationRulesForIndicator(indicatorId: string): IndicatorValidationRules {
  // Default validation rules
  return {
    required: true,
    minValue: 0,
    maxValue: 999999
  };
}

export function formatValidationErrors(errors: any[]): string[] {
  return errors.map(error => error.message || 'Validation error');
}