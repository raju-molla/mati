import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Fixed-window rate-limit counters, stored in MongoDB so limits hold across
 * serverless instances. Documents expire automatically via the TTL index.
 */
const RateLimitSchema = new Schema({
  key: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitSchema.index({ key: 1 }, { unique: true });
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDoc = InferSchemaType<typeof RateLimitSchema>;
export const RateLimit: Model<RateLimitDoc> =
  models.RateLimit || model<RateLimitDoc>("RateLimit", RateLimitSchema);
