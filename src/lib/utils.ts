import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Unisce classi Tailwind: in caso di conflitto vince l'ultima (convenzione shadcn). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
