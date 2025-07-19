import { z } from 'zod';

// Validation schemas for biodiversity data
export const BiodiversityDataSchema = z.object({
  id: z.string().optional(),
  species: z.string().min(1, 'Species name is required'),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    name: z.string().optional(),
  }),
  date: z.string().datetime(),
  category: z.enum(['SUP', 'CON', 'BDU', 'RES']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ENDANGERED', 'STABLE']).optional(),
  metadata: z.record(z.any()).optional(),
});

export const BulkUploadSchema = z.object({
  data: z.array(BiodiversityDataSchema),
  source: z.string().optional(),
  uploadedBy: z.string().optional(),
});

// Location validation
export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  zoom: z.number().min(1).max(20).optional(),
});

// Temporal analysis validation
export const TemporalRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  interval: z.enum(['day', 'week', 'month', 'year']).optional(),
});

// Query validation
export const BiodiversityQuerySchema = z.object({
  location: LocationSchema.optional(),
  timeRange: TemporalRangeSchema.optional(),
  categories: z.array(z.enum(['SUP', 'CON', 'BDU', 'RES'])).optional(),
  species: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).optional(),
});

// Export types
export type BiodiversityData = z.infer<typeof BiodiversityDataSchema>;
export type BulkUpload = z.infer<typeof BulkUploadSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type TemporalRange = z.infer<typeof TemporalRangeSchema>;
export type BiodiversityQuery = z.infer<typeof BiodiversityQuerySchema>;

// Validation helper functions
export function validateBiodiversityData(data: unknown): BiodiversityData {
  return BiodiversityDataSchema.parse(data);
}

export function validateBulkUpload(data: unknown): BulkUpload {
  return BulkUploadSchema.parse(data);
}

export function validateLocation(data: unknown): Location {
  return LocationSchema.parse(data);
}

export function validateQuery(data: unknown): BiodiversityQuery {
  return BiodiversityQuerySchema.parse(data);
}

// Safe validation (returns error instead of throwing)
export function safeParseBiodiversityData(data: unknown) {
  return BiodiversityDataSchema.safeParse(data);
}

export function safeParseBulkUpload(data: unknown) {
  return BulkUploadSchema.safeParse(data);
}

export function safeParseQuery(data: unknown) {
  return BiodiversityQuerySchema.safeParse(data);
}

// Input sanitization function
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}