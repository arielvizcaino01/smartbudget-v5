import { requireCompletedUser } from "@/lib/auth";

export async function getCurrentAppUser() {
  return requireCompletedUser();
}
