import slugifyPrimitive from "slugify";

export function slugify(string: string) {
  return slugifyPrimitive(string, {
    replacement: "-",
    lower: true,
    strict: true,
    trim: true,
  });
}
