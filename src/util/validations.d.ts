import { ZodSchema } from 'zod';
/**
 * All properties are defined handler.
 */
export declare const allDefined: (obj: Record<string | number | symbol, unknown>) => boolean;
/**
 * Validates given `object` with given `schema`.
 */
export declare const validate: <T>(schema: ZodSchema<T>, object: any) => T;
