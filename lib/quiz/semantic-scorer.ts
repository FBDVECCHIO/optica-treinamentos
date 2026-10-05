/**
 * Avaliador Semântico de Respostas Dissertativas
 * Compara a resposta textual do aluno com a lista de conceitos e palavras-chave
 * esperadas no gabarito técnico de óptica (ex: Linha Gold Comfort e Smartplay).
 */
export interface DissertativeResult {
  score: number;
  maxPoints: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string;
}

export function evaluateDissertativeAnswer(
  userAnswer: string = "",
  expectedKeywords: string[] = [],
  maxPoints: number = 10
): DissertativeResult {
  if (!userAnswer.trim()) {
    return {
      score: 0,
      maxPoints,
      matchedKeywords: [],
      missingKeywords: expectedKeywords,
      feedback: "Nenhuma resposta fornecida pelo aluno.",
    };
  }

  const normalizedAnswer = userAnswer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove acentos para matching flexível

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of expectedKeywords) {
    const normalizedKeyword = keyword
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (normalizedAnswer.includes(normalizedKeyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  // Cálculo proporcional da pontuação
  const matchRatio = expectedKeywords.length > 0 ? matchedKeywords.length / expectedKeywords.length : 1;
  const rawScore = matchRatio * maxPoints;
  const score = Math.round(rawScore * 10) / 10; // Arredonda para 1 casa decimal

  let feedback = "";
  if (matchRatio >= 0.8) {
    feedback = "Excelente resposta! Todos os conceitos técnicos e diferenciais ópticos foram abordados com clareza.";
  } else if (matchRatio >= 0.5) {
    feedback = `Boa fundamentação. Você contemplou conceitos-chave como "${matchedKeywords.slice(0, 2).join('", "')}", mas poderia reforçar itens como "${missingKeywords.slice(0, 2).join('", "')}".`;
  } else {
    feedback = `Resposta preliminar registrada. Para maior pontuação técnica, inclua conceitos como: ${missingKeywords.join(", ")}. Aguardando revisão da coordenação pedagógica.`;
  }

  return {
    score,
    maxPoints,
    matchedKeywords,
    missingKeywords,
    feedback,
  };
}
