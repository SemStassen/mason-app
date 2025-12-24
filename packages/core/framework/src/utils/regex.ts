export const regex = {
  email: /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/i,
  hexColor: /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?([0-9A-Fa-f]{2})?$/,
} as const;
