import { z } from 'zod';

export const infrastructurePaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const uuid = z.string().uuid();

export const universityIdParamsSchema = z.object({ universityId: uuid });
export const hostelIdParamsSchema = z.object({ hostelId: uuid });
export const buildingIdParamsSchema = z.object({ buildingId: uuid });
export const blockIdParamsSchema = z.object({ blockId: uuid });
export const floorIdParamsSchema = z.object({ floorId: uuid });
export const roomIdParamsSchema = z.object({ roomId: uuid });
export const bedIdParamsSchema = z.object({ bedId: uuid });

export const genderCategorySchema = z.enum(['BOYS_HOSTEL', 'GIRLS_HOSTEL']);
export const roomStatusSchema = z.enum(['ACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED']);
export const bedStatusSchema = z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']);

export const createUniversityBodySchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50),
  address: z.string().max(1000).optional(),
  contactEmail: z.string().email().max(255).optional(),
});

export const updateUniversityBodySchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    address: z.string().max(1000).nullable().optional(),
    contactEmail: z.string().email().max(255).nullable().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

export const createHostelBodySchema = z.object({
  name: z.string().min(1).max(150),
  code: z.string().min(1).max(50),
  genderCategory: genderCategorySchema,
  wardenInCharge: uuid.optional(),
  isActive: z.boolean().optional(),
});

export const updateHostelBodySchema = z
  .object({
    name: z.string().min(1).max(150).optional(),
    wardenInCharge: uuid.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

export const listHostelsQuerySchema = infrastructurePaginationQuerySchema.extend({
  universityId: uuid.optional(),
});

export const createBuildingBodySchema = z.object({
  name: z.string().min(1).max(100),
  buildingNumber: z.string().min(1).max(20),
});

export const updateBuildingBodySchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    buildingNumber: z.string().min(1).max(20).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

export const createBlockBodySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateBlockBodySchema = z
  .object({
    name: z.string().min(1).max(100),
  })
  .strict();

export const createFloorBodySchema = z.object({
  floorNumber: z.coerce.number().int(),
  name: z.string().max(50).optional(),
});

export const updateFloorBodySchema = z
  .object({
    floorNumber: z.coerce.number().int().optional(),
    name: z.string().max(50).nullable().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

export const createRoomBodySchema = z.object({
  configId: uuid,
  roomNumber: z.string().min(1).max(20),
  status: roomStatusSchema.optional(),
});

export const updateRoomBodySchema = z
  .object({
    roomNumber: z.string().min(1).max(20).optional(),
    status: roomStatusSchema.optional(),
    configId: uuid.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

export const createBedBodySchema = z.object({
  bedNumber: z.string().min(1).max(10),
  status: bedStatusSchema.optional(),
});

export const updateBedBodySchema = z
  .object({
    bedNumber: z.string().min(1).max(10).optional(),
    status: bedStatusSchema.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required.' });

export type CreateUniversityBody = z.infer<typeof createUniversityBodySchema>;
