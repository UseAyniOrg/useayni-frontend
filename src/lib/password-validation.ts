export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "Senha deve ter pelo menos 6 caracteres" };
  }
  if (/\s/.test(password)) {
    return { isValid: false, message: "Senha não pode conter espaços" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Senha deve conter pelo menos uma letra maiúscula" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Senha deve conter pelo menos uma letra minúscula" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Senha deve conter pelo menos um número" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Senha deve conter pelo menos um caractere especial" };
  }
  return { isValid: true, message: "" };
};
