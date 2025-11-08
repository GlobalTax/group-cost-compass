import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS usando clsx y tailwind-merge
 * Esta es la única función que permanece en utils.ts por compatibilidad
 * Todas las demás utilidades se han movido a src/lib/utils/*
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
