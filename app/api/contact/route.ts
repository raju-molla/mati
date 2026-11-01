import { connectDB } from "@/lib/db/connect";
import { ContactMessage } from "@/models";
import { contactSchema } from "@/lib/validation";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp, hashIp } from "@/lib/security/request";
import { notifyNewEnquiry } from "@/lib/email";
import { getSiteSettings } from "@/services/content";

export async function POST(req: Request) {
  try {
    const data = contactSchema.parse(await readJson(req));

    // Spam traps: honeypot field filled, or submitted faster than a human could type.
    if (data.website || (data.elapsedMs !== undefined && data.elapsedMs < 3000)) {
      // Pretend success so bots don't learn anything.
      return ok({ received: true });
    }

    const ip = getClientIp(req);
    const limit = await rateLimit(`contact:${ip}`, 5, 60 * 60);
    if (!limit.ok) {
      return fail("You've sent several messages recently. Please try again a little later.", 429);
    }

    await connectDB();
    await ContactMessage.create({
      name: data.name,
      email: data.email,
      company: data.company ?? "",
      service: data.service ?? "",
      budget: data.budget ?? "",
      timeline: data.timeline ?? "",
      message: data.message,
      ipHash: hashIp(ip),
      userAgent: (req.headers.get("user-agent") ?? "").slice(0, 300),
    });

    const settings = await getSiteSettings();
    await notifyNewEnquiry(data, settings.contactEmail);

    return ok({ received: true }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
