import { MessagesInbox } from "@/components/admin/MessagesInbox";
import { adminMessages } from "@/services/admin";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  return <MessagesInbox initial={await adminMessages()} />;
}
