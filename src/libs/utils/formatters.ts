/**
 * Retorna as iniciais do nome ou e-mail do usuário para exibir no Avatar.
 */
export function getInitials(name?: string | null, email?: string | null): string {
  const target = name || email;
  if (!target) return "U";
  return target.trim().split(" ")[0].substring(0, 2).toUpperCase();
}

/**
 * Converte a chave interna de tamanho de fonte para um rótulo legível em português.
 */
export function formatFontSize(fontSize?: string | null): string {
  switch (fontSize) {
    case "grande":
      return "Grande";
    case "muito-grande":
      return "Muito Grande";
    default:
      return "Padrão";
  }
}

/**
 * Converte preferências booleanas para textos amigáveis.
 */
export function formatPreferenceStatus(value?: boolean | null): string {
  return value ? "Ativado" : "Desativado";
}
