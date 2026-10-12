"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SITE_COOKIE } from "@/lib/session";

export async function chooseSite(formData: FormData) {
  const id = String(formData.get("site_id") ?? "");
  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE, id, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}
