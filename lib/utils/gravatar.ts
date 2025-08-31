import CryptoJS from 'crypto-js';

export function getGravatarUrl(email: string, size: number = 200): string {
  const normalizedEmail = email.toLowerCase().trim();
  const hash = CryptoJS.MD5(normalizedEmail).toString();
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
} 