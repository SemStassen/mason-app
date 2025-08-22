import _slug from 'slug';

export function slugify(slug: string) {
  return _slug(slug, _slug.defaults.modes.rfc3986);
}
