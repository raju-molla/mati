import { PhotographyManager } from "@/components/admin/PhotographyManager";
import { adminPhotos } from "@/services/admin";

export const metadata = { title: "Photography" };

export default async function PhotographyAdminPage() {
  return <PhotographyManager initial={await adminPhotos()} />;
}
