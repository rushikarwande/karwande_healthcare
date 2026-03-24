import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "site-assets";

export async function uploadSiteImage(file: File, folder: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const safeExtension = extension?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExtension}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, file, {
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

export { BUCKET_NAME };
