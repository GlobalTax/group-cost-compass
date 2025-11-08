/**
 * Utilidades para validación de datos
 */

/**
 * Valida un DNI/NIF español
 * Formatos aceptados: 12345678A, A12345678, X1234567A
 */
export const isValidDNI = (dni: string): boolean => {
  if (!dni) return false;

  // Normalizar: eliminar espacios y guiones, convertir a mayúsculas
  const normalized = dni.trim().replace(/[-\s]/g, "").toUpperCase();

  // DNI español: 8 dígitos + 1 letra
  const dniRegex = /^(\d{8})([A-Z])$/;
  const dniMatch = normalized.match(dniRegex);

  if (dniMatch) {
    const number = parseInt(dniMatch[1], 10);
    const letter = dniMatch[2];
    const validLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const expectedLetter = validLetters[number % 23];
    return letter === expectedLetter;
  }

  // NIE español: X/Y/Z + 7 dígitos + 1 letra
  const nieRegex = /^([XYZ])(\d{7})([A-Z])$/;
  const nieMatch = normalized.match(nieRegex);

  if (nieMatch) {
    const prefix = nieMatch[1];
    const number = parseInt(nieMatch[2], 10);
    const letter = nieMatch[3];

    // Reemplazar X=0, Y=1, Z=2
    const prefixNumber = prefix === "X" ? 0 : prefix === "Y" ? 1 : 2;
    const fullNumber = parseInt(`${prefixNumber}${nieMatch[2]}`, 10);

    const validLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const expectedLetter = validLetters[fullNumber % 23];
    return letter === expectedLetter;
  }

  // CIF: 1 letra + 7 dígitos + 1 letra/dígito
  const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[A-Z0-9]$/;
  return cifRegex.test(normalized);
};

/**
 * Normaliza un DNI/NIF eliminando espacios y guiones
 */
export const normalizeDNI = (dni: string): string => {
  if (!dni) return "";
  return dni.trim().replace(/[-\s]/g, "").toUpperCase();
};

/**
 * Valida un email
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida un teléfono español (móvil o fijo)
 */
export const isValidSpanishPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Normalizar: eliminar espacios, guiones y paréntesis
  const normalized = phone.replace(/[\s\-()]/g, "");
  
  // Móvil: 6XX XXX XXX o 7XX XXX XXX (9 dígitos)
  // Fijo: 9XX XXX XXX (9 dígitos)
  // Con prefijo internacional: +34 o 0034
  const phoneRegex = /^(\+34|0034)?[679]\d{8}$/;
  return phoneRegex.test(normalized);
};

/**
 * Valida un IBAN español
 */
export const isValidIBAN = (iban: string): boolean => {
  if (!iban) return false;
  
  // Normalizar: eliminar espacios
  const normalized = iban.replace(/\s/g, "").toUpperCase();
  
  // IBAN español: ES + 2 dígitos control + 20 dígitos
  const ibanRegex = /^ES\d{22}$/;
  if (!ibanRegex.test(normalized)) return false;
  
  // Validar dígitos de control (algoritmo módulo 97)
  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  const numericString = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );
  
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
  }
  
  return remainder === 1;
};
