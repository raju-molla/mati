/**
 * Seed initial content from Mateusz's CV and existing portfolio.
 *
 *   npm run seed
 *
 * Safe to run more than once: records are upserted by slug/name, and
 * existing documents are NOT overwritten (so edits made in the dashboard are
 * kept). Pass --force to overwrite seeded fields with these defaults again.
 *
 * Only facts from the CV are used — no invented clients, results or awards.
 * Images are not seeded: upload them in the admin Media Library.
 */
import mongoose, { type Model } from "mongoose";
import { connectDB } from "../lib/db/connect";
import {
  AboutSettings,
  Category,
  Education,
  Experience,
  HomepageSettings,
  Project,
  Service,
  SiteSettings,
  Skill,
  SkillCategory,
} from "../models";
import { DEFAULT_SECTIONS } from "../lib/defaults";

const force = process.argv.includes("--force");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function upsert(model: Model<any>, filter: Record<string, unknown>, data: Record<string, unknown>) {
  const update = force ? { $set: data } : { $setOnInsert: data };
  const res = await model.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
  return res;
}

/* ───────────────────────── Categories ───────────────────────── */
const CATEGORIES = [
  { name: "Game Development", slug: "game-development", description: "Games and interactive experiences built in Unity and Unreal Engine.", layout: "grid" },
  { name: "Video Editing", slug: "video-editing", description: "Short-form and long-form edits for brands, venues and artists.", layout: "grid" },
  { name: "Cinematography", slug: "cinematography", description: "Shooting and lighting for music videos and creative projects.", layout: "grid" },
  { name: "Photography", slug: "photography", description: "Photography, including wildlife.", layout: "masonry" },
  { name: "Social Media", slug: "social-media", description: "Content planning, filming and editing for social channels.", layout: "grid" },
  { name: "Creative Projects", slug: "creative-projects", description: "Personal and experimental creative work.", layout: "grid" },
  { name: "Technical Projects", slug: "technical-projects", description: "Hands-on hardware troubleshooting, repair and console modification.", layout: "grid" },
];

/* ───────────────────────── Projects ───────────────────────── */
type SeedProject = Record<string, unknown> & { slug: string; category: string };
const UNI = "A project from my BA (Hons) Game Arts and Design at the University of Plymouth.";

const PROJECTS: SeedProject[] = [
  {
    title: "3DS Augmented Reality Game Remake",
    slug: "3ds-ar-game",
    category: "game-development",
    subtitle: "A Nintendo 3DS augmented-reality game concept, recreated for Android.",
    shortDescription: "A Nintendo 3DS augmented-reality game concept recreated for Android using Unity.",
    fullDescription: `${UNI}\n\nThe project recreates a Nintendo 3DS augmented-reality game concept for Android devices, built in Unity.`,
    technologies: ["Unity"],
    tools: ["C#"],
    featured: true,
  },
  {
    title: "First-Person Tower Defence",
    slug: "tower-defence",
    category: "game-development",
    subtitle: "Tower defence, played from the ground.",
    shortDescription: "A first-person tower-defence game developed in Unreal Engine.",
    fullDescription: `${UNI}\n\nA tower-defence game played from a first-person perspective, developed in Unreal Engine.`,
    technologies: ["Unreal Engine"],
    featured: true,
  },
  {
    title: "Comedic Soulsborne Game",
    slug: "comedic-soulsborne-game",
    category: "game-development",
    shortDescription: "An experimental, comedic game inspired by the Soulsborne genre.",
    fullDescription: `${UNI}\n\nAn experimental game that takes the conventions of the Soulsborne genre and plays them for laughs.`,
  },
  {
    title: "VR Ant Experience",
    slug: "vr-ant-experience",
    category: "game-development",
    shortDescription: "A virtual-reality experience centred around ants.",
    fullDescription: `${UNI}\n\nA virtual-reality experience centred around ants.`,
    technologies: ["Virtual reality"],
  },
  {
    title: "Debut Artist Music Video",
    slug: "debut-artist-music-video",
    category: "cinematography",
    subtitle: "Lead cinematographer and editor on a debut music video.",
    shortDescription: "Led cinematography for a debut artist's music video, managed the equipment and edited the footage.",
    fullDescription:
      "Completed as part of a micro-internship in Plymouth (December 2023 – February 2024). I led the cinematography for a debut artist's music video, managed the camera equipment, and edited the final footage.",
    role: "Lead Cinematographer & Editor",
    year: "2023–24",
    tools: ["DaVinci Resolve", "Adobe Premiere Pro"],
    featured: true,
  },
  {
    title: "Short-Form Marketing Content",
    slug: "short-form-marketing-content",
    category: "video-editing",
    subtitle: "Instagram and TikTok edits for a digital marketing company.",
    shortDescription: "Short-form Instagram and TikTok marketing content edited to brand briefs and tight deadlines.",
    fullDescription:
      "As a freelance video editor for Catalyst Growth, I edit short-form marketing content for Instagram and TikTok. I work remotely with clients on messaging and visual style, delivering edits to brand briefs and deadlines.",
    role: "Freelance Video Editor",
    client: "Catalyst Growth",
    year: "2025–",
    tools: ["CapCut", "DaVinci Resolve"],
    featured: true,
  },
  {
    title: "Prince Regent Social Content",
    slug: "prince-regent-social-content",
    category: "social-media",
    subtitle: "Filming and planning social content for a Marylebone venue.",
    shortDescription: "Managing the venue's social media — filming videos and planning posts to a schedule.",
    fullDescription:
      "As Team Coach & Social Media Manager at the Prince Regent in Marylebone, I manage the @princeregentnw1 social media account: filming videos and planning post timelines in line with the area manager's schedule.",
    role: "Social Media Manager",
    client: "Prince Regent, Marylebone",
    year: "2026–",
  },
  {
    title: "Wildlife Photography",
    slug: "wildlife-photography",
    category: "photography",
    subtitle: "Ongoing wildlife photography.",
    shortDescription: "Wildlife photography, shared on Instagram as @matis.lens.",
    fullDescription: "An ongoing collection of wildlife photography. More of my photography is on Instagram at @matis.lens.",
    projectURL: "https://www.instagram.com/matis.lens/",
    featured: true,
  },
  {
    title: "Console Modification",
    slug: "console-modification",
    category: "technical-projects",
    shortDescription: "Modifying and jailbreaking game consoles — console software, system configuration and troubleshooting.",
    fullDescription:
      "I have modified and jailbroken game consoles, which has given me practical familiarity with console software, system configuration and troubleshooting.",
    tools: ["Console modification", "System configuration"],
  },
  {
    title: "PS Vita Repair",
    slug: "ps-vita-repair",
    category: "technical-projects",
    shortDescription: "Repaired a PS Vita by replacing a faulty power button.",
    challenge: "The PS Vita's power button had failed.",
    outcome: "I replaced the faulty power button, returning the console to working order.",
    tools: ["Device repair"],
  },
  {
    title: "Nintendo Switch OLED Troubleshooting",
    slug: "switch-oled-troubleshooting",
    category: "technical-projects",
    shortDescription: "Diagnosed a Switch OLED that wouldn't work in handheld mode and traced it to a disconnected display ribbon cable.",
    challenge: "A Nintendo Switch OLED would not operate correctly in handheld mode.",
    process: "I inspected the device and found that the display ribbon cable had become disconnected.",
    outcome: "Reseating the ribbon cable restored handheld functionality.",
    tools: ["Hardware inspection", "Ribbon-cable troubleshooting"],
  },
];

/* ───────────────────────── Experience ───────────────────────── */
const EXPERIENCE = [
  {
    role: "Team Coach & Social Media Manager",
    organisation: "Prince Regent",
    location: "Marylebone, London",
    period: "February 2026 – Present",
    current: true,
    type: "creative",
    highlights: [
      "Manage the venue's social media content",
      "Film videos and plan post timelines to the area manager's schedule",
      "Coach colleagues and lead shifts",
      "Support team performance, communication and service quality",
    ],
    tools: [],
  },
  {
    role: "Freelance Video Editor",
    organisation: "Catalyst Growth",
    location: "London",
    period: "January 2025 – Present",
    current: true,
    type: "creative",
    highlights: [
      "Edit short-form Instagram and TikTok marketing content",
      "Deliver content to brand briefs and tight deadlines",
      "Collaborate remotely with clients on messaging and visual style",
    ],
    tools: ["CapCut", "DaVinci Resolve"],
  },
  {
    role: "Contractor",
    organisation: "Frieze Art Show — MSTEP",
    location: "London",
    period: "October 2024 & October 2025",
    current: false,
    type: "operations",
    highlights: [
      "Supported venue operations and environmental control systems",
      "Reported issues and coordinated with technicians and event staff",
      "Followed operational and safety procedures in a high-profile environment",
    ],
    tools: [],
  },
  {
    role: "Supervisor",
    organisation: "The Wapping Tavern",
    location: "Wapping, London",
    period: "October 2024 – February 2026",
    current: false,
    type: "operations",
    highlights: ["Oversaw daily operations", "Trained new team members", "Resolved problems and supported efficient team workflows"],
    tools: [],
  },
  {
    role: "Lead Cinematographer & Editor",
    organisation: "Micro-Internship",
    location: "Plymouth",
    period: "December 2023 – February 2024",
    current: false,
    type: "creative",
    highlights: ["Led cinematography for a debut artist's music video", "Managed equipment", "Edited the footage"],
    tools: ["DaVinci Resolve", "Adobe Premiere Pro"],
  },
];

/* ───────────────────────── Education ───────────────────────── */
const EDUCATION = [
  {
    qualification: "BA (Hons) Game Arts and Design",
    institution: "University of Plymouth",
    period: "2021–2024",
    grade: "2:1",
    details: [],
  },
  {
    qualification: "A Levels",
    institution: "Worcester Sixth Form",
    period: "2019–2021",
    grade: "",
    details: ["Computer Science — A", "Film Studies — B", "Graphics — B"],
  },
  {
    qualification: "GCSEs",
    institution: "Blessed Edward Oldcorne Catholic College",
    period: "2014–2019",
    grade: "",
    details: ["8 GCSEs at grades 7–4, including English, Maths and Computer Science"],
  },
];

/* ───────────────────────── Skills ───────────────────────── */
const SKILLS: Record<string, { name: string; skills: string[] }> = {
  creative: {
    name: "Creative",
    skills: ["DaVinci Resolve", "CapCut", "Adobe Premiere Pro", "After Effects", "Photoshop", "Video Production", "Social Media Content Planning"],
  },
  technical: {
    name: "Game & Technical",
    skills: [
      "Unity",
      "Unreal Engine",
      "C#",
      "Python",
      "Consumer Electronics Troubleshooting",
      "Device Repair",
      "Console Modification",
      "Hardware Inspection",
    ],
  },
  professional: {
    name: "Professional",
    skills: ["Communication", "Teamwork", "Problem Solving", "Time Management", "Adaptability", "Attention to Detail", "Working Under Pressure"],
  },
};

/* ───────────────────────── Services ───────────────────────── */
const SERVICES = [
  {
    title: "Video Editing",
    slug: "video-editing",
    iconName: "Scissors",
    description: "Edits that hold attention — from short-form vertical content to longer pieces, cut to your brief and brand.",
    deliverables: ["Short-form edits for Instagram & TikTok", "Editing to brand guidelines", "Colour and audio clean-up", "Captions and text animation"],
  },
  {
    title: "Photography",
    slug: "photography",
    iconName: "Camera",
    description: "Considered, natural photography — with a particular love of wildlife.",
    deliverables: ["Edited high-resolution images", "Images prepared for web and social"],
  },
  {
    title: "Creative Content",
    slug: "creative-content",
    iconName: "Sparkles",
    description: "Ideas taken from concept to finished content, combining filming, editing and design.",
    deliverables: ["Concept development", "Filming and editing", "Graphics in Photoshop and After Effects"],
  },
  {
    title: "Social Media Content",
    slug: "social-media-content",
    iconName: "Smartphone",
    description: "Planning, filming and editing content for social channels, scheduled around what you need to promote.",
    deliverables: ["Content planning and post timelines", "On-location filming", "Short-form edits ready to post"],
  },
  {
    title: "Cinematography",
    slug: "cinematography",
    iconName: "Clapperboard",
    description: "Camera work for music videos and creative projects, with equipment handled from start to finish.",
    deliverables: ["Shooting and camera operation", "Equipment management", "Editing the footage"],
  },
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set. Create .env.local first (see .env.example).");
  await connectDB();
  console.log(`Seeding${force ? " (force overwrite)" : ""}…`);

  // Categories
  const catIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const doc = await upsert(Category, { slug: c.slug }, { ...c, displayOrder: i, published: true });
    catIds[c.slug] = doc._id;
  }
  console.log(`  ✔ ${CATEGORIES.length} categories`);

  // Projects
  for (const [i, p] of PROJECTS.entries()) {
    const { category, ...rest } = p;
    await upsert(Project, { slug: p.slug }, { ...rest, category: catIds[category], displayOrder: i, published: true });
  }
  console.log(`  ✔ ${PROJECTS.length} projects`);

  // Experience / education (matched by role+organisation / qualification+institution)
  for (const [i, e] of EXPERIENCE.entries()) {
    await upsert(Experience, { role: e.role, organisation: e.organisation }, { ...e, displayOrder: i, published: true });
  }
  for (const [i, e] of EDUCATION.entries()) {
    await upsert(Education, { qualification: e.qualification, institution: e.institution }, { ...e, displayOrder: i, published: true });
  }
  console.log(`  ✔ ${EXPERIENCE.length} experience entries, ${EDUCATION.length} education entries`);

  // Skills
  let skillCount = 0;
  for (const [gi, [slug, group]] of Object.entries(SKILLS).entries()) {
    const cat = await upsert(SkillCategory, { slug }, { name: group.name, slug, displayOrder: gi, published: true });
    for (const [si, name] of group.skills.entries()) {
      await upsert(Skill, { name, category: cat._id }, { name, category: cat._id, displayOrder: gi * 100 + si, published: true });
      skillCount++;
    }
  }
  console.log(`  ✔ ${skillCount} skills in ${Object.keys(SKILLS).length} groups`);

  // Services
  for (const [i, s] of SERVICES.entries()) {
    await upsert(Service, { slug: s.slug }, { ...s, ctaLabel: "Start a project", displayOrder: i, published: true });
  }
  console.log(`  ✔ ${SERVICES.length} services`);

  // Site settings
  await upsert(SiteSettings, { key: "site" }, {
    key: "site",
    siteName: "Mateusz Tomaszek",
    brandName: "rateusz",
    tagline: "Creative technologist — game design, video, photography and digital content",
    contactEmail: "Mateusztomaszek21@gmail.com",
    showEmailPublicly: false,
    location: "London, UK",
    availability: "Open to freelance projects and new roles",
    footerText: "Game Arts & Design graduate working across video, photography, games and hands-on tech.",
    cvLabel: "Download CV",
    social: { instagram: "https://www.instagram.com/matis.lens/", instagramHandle: "@matis.lens" },
    seo: {
      defaultTitle: "Mateusz Tomaszek — Video, Photography & Game Design",
      titleTemplate: "%s — Mateusz Tomaszek",
      defaultDescription:
        "Mateusz Tomaszek is a London-based Game Arts and Design graduate working across video editing, cinematography, photography, game development and technical troubleshooting.",
      keywords: ["Mateusz Tomaszek", "rateusz", "video editor London", "cinematographer", "wildlife photography", "game design", "Unity", "Unreal Engine"],
    },
    contactPage: {
      heading: "",
      intro: "Tell me about your project, role or idea — I'll get back to you as soon as I can.",
      budgetOptions: ["Under £250", "£250 – £500", "£500 – £1,000", "£1,000+"],
      successMessage: "Thanks for getting in touch — I'll reply as soon as I can.",
    },
  });

  // Homepage
  await upsert(HomepageSettings, { key: "home" }, {
    key: "home",
    hero: {
      eyebrow: "Portfolio — rateusz",
      title: "Mateusz Tomaszek",
      subtitle: "Game Arts & Design BA (Hons) · London",
      roles: ["Creative Technologist", "Game Designer", "Video Editor", "Photographer", "Cinematographer"],
      description: "A multidisciplinary creative working across game design, photography, videography and interactive digital experiences.",
      mediaType: "gradient",
      gradientFrom: "#14120f",
      gradientTo: "#3a2a1a",
      overlayOpacity: 55,
      primaryCtaLabel: "View My Work",
      primaryCtaHref: "/work",
      secondaryCtaLabel: "Contact Me",
      secondaryCtaHref: "/contact",
    },
    technicalCategorySlug: "technical-projects",
    sections: DEFAULT_SECTIONS.map((s) =>
      s.key === "cta" ? { ...s, intro: "Available for freelance work, creative collaborations and new roles." } : s
    ),
  });

  // About
  await upsert(AboutSettings, { key: "about" }, {
    key: "about",
    eyebrow: "About",
    headline: "Creative production, with a technical mind.",
    intro: [
      "I'm Mateusz Tomaszek — a Game Arts and Design BA (Hons) graduate based in London. I work across game development, video, photography and social media content, and I'm as comfortable inspecting a circuit board as I am on an editing timeline.",
      "At the University of Plymouth I built games and interactive experiences in Unity and Unreal Engine — including an augmented-reality remake for Android, a first-person tower defence game, a comedic take on the Soulsborne genre and a VR experience about ants.",
      "Since graduating I've edited short-form Instagram and TikTok content as a freelance video editor, managed social media and filmed content for a London venue, and led the cinematography and edit for a debut artist's music video.",
      "Away from client work I photograph wildlife — you'll find it on Instagram as @matis.lens — and I like taking electronics apart: modifying consoles, repairing a PS Vita and getting a Nintendo Switch OLED working in handheld mode again.",
    ].join("\n\n"),
    focusAreas: [
      "Video editing & short-form content",
      "Cinematography & photography",
      "Game design & development",
      "Social media content planning",
      "Technical troubleshooting & device repair",
    ],
    openTo: ["Freelance projects", "Creative collaborations", "Employment", "Technical opportunities"],
    previewText:
      "A Game Arts and Design graduate combining creative production with technical problem solving — editing, filming, photographing and building interactive work.",
    seo: {
      title: "About",
      description: "Mateusz Tomaszek — Game Arts and Design graduate in London working across video, photography, games and technical troubleshooting.",
    },
  });
  console.log("  ✔ site, homepage and about settings");
  console.log("Done. Next: npm run create-admin (if you haven't), then upload images in /admin/media.");
}

main()
  .catch((err) => {
    console.error("✖ Seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
