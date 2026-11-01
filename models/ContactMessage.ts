import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ContactMessageSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 254 },
    company: { type: String, default: "", maxlength: 160 },
    service: { type: String, default: "", maxlength: 120 },
    budget: { type: String, default: "", maxlength: 60 },
    timeline: { type: String, default: "", maxlength: 120 },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new" },
    /** Salted hash of the sender IP — used for abuse investigation, never shown raw. */
    ipHash: { type: String, default: "" },
    userAgent: { type: String, default: "", maxlength: 300 },
    notes: { type: String, default: "", maxlength: 2000 },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ createdAt: -1 });

export type ContactMessageDoc = InferSchemaType<typeof ContactMessageSchema>;
export const ContactMessage: Model<ContactMessageDoc> =
  models.ContactMessage || model<ContactMessageDoc>("ContactMessage", ContactMessageSchema);
