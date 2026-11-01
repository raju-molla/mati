import { ResourceManager } from "@/components/admin/ResourceManager";
import { adminList } from "@/services/admin";

export const metadata = { title: "Skills" };

export default async function SkillsPage() {
  const [groups, skills] = await Promise.all([adminList("skill-categories"), adminList("skills")]);
  return (
    <div className="space-y-14">
      <ResourceManager configKey="skill-categories" initialItems={groups} />
      <ResourceManager configKey="skills" initialItems={skills} />
    </div>
  );
}
