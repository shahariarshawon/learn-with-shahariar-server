/**
 * Slugify utility to create URL-safe unique slugs from titles
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export const generateUniqueSlug = (title: string, suffix: string = ''): string => {
  const baseSlug = slugify(title);
  if (!suffix) return baseSlug;
  return `${baseSlug}-${suffix}`;
};

export default slugify;
