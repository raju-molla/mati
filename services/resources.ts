import "server-only";
import type { Model } from "mongoose";
import type { ZodType } from "zod";
import {
  Category,
  ContactMessage,
  Education,
  Experience,
  Project,
  Service,
  Skill,
  SkillCategory,
} from "@/models";
import {
  categorySchema,
  educationSchema,
  experienceSchema,
  messageUpdateSchema,
  projectSchema,
  serviceSchema,
  skillCategorySchema,
  skillSchema,
} from "@/lib/validation";
import { PROJECT_POPULATE } from "./content";

export const PROJECT_POPULATE_FOR_ADMIN = PROJECT_POPULATE;

/**
 * Registry that drives the generic admin CRUD endpoints:
 *   GET/POST          /api/admin/[resource]
 *   GET/PATCH/DELETE  /api/admin/[resource]/[id]
 *   POST              /api/admin/[resource]/reorder
 */
export interface ResourceConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  createSchema?: ZodType;
  updateSchema: ZodType;
  sort: Record<string, 1 | -1>;
  populate?: unknown[];
  /** Field used for drag-and-drop ordering, if any. */
  orderField?: string;
  /** Child relations that block deletion. */
  dependents?: { model: string; field: string; label: string }[];
  label: string;
}

export const RESOURCES: Record<string, ResourceConfig> = {
  projects: {
    model: Project,
    createSchema: projectSchema,
    updateSchema: projectSchema.partial(),
    sort: { displayOrder: 1, createdAt: -1 },
    populate: ["category", "coverImage", "thumbnail"],
    orderField: "displayOrder",
    label: "Project",
  },
  categories: {
    model: Category,
    createSchema: categorySchema,
    updateSchema: categorySchema.partial(),
    sort: { displayOrder: 1, name: 1 },
    populate: ["coverImage"],
    orderField: "displayOrder",
    dependents: [{ model: "Project", field: "category", label: "project" }],
    label: "Category",
  },
  experience: {
    model: Experience,
    createSchema: experienceSchema,
    updateSchema: experienceSchema.partial(),
    sort: { displayOrder: 1 },
    orderField: "displayOrder",
    label: "Experience",
  },
  education: {
    model: Education,
    createSchema: educationSchema,
    updateSchema: educationSchema.partial(),
    sort: { displayOrder: 1 },
    orderField: "displayOrder",
    label: "Education",
  },
  "skill-categories": {
    model: SkillCategory,
    createSchema: skillCategorySchema,
    updateSchema: skillCategorySchema.partial(),
    sort: { displayOrder: 1 },
    orderField: "displayOrder",
    dependents: [{ model: "Skill", field: "category", label: "skill" }],
    label: "Skill group",
  },
  skills: {
    model: Skill,
    createSchema: skillSchema,
    updateSchema: skillSchema.partial(),
    sort: { displayOrder: 1 },
    populate: ["icon", "category"],
    orderField: "displayOrder",
    label: "Skill",
  },
  services: {
    model: Service,
    createSchema: serviceSchema,
    updateSchema: serviceSchema.partial(),
    sort: { displayOrder: 1 },
    populate: ["image"],
    orderField: "displayOrder",
    label: "Service",
  },
  messages: {
    model: ContactMessage,
    updateSchema: messageUpdateSchema,
    sort: { createdAt: -1 },
    label: "Message",
  },
};

export function getResource(name: string): ResourceConfig | null {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name]! : null;
}
