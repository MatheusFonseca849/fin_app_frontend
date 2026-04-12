/**
 * Mirrors the backend password strength rules from password.utils.js.
 * Returns null if valid, or the first failing rule's message.
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Senha deve ter no mínimo 8 caracteres';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Senha deve conter pelo menos uma letra maiúscula';
  }
  if (!/[a-z]/.test(password)) {
    return 'Senha deve conter pelo menos uma letra minúscula';
  }
  if (!/[0-9]/.test(password)) {
    return 'Senha deve conter pelo menos um número';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Senha deve conter pelo menos um caractere especial';
  }
  return null;
}
