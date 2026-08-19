// Graus de liberdade e classe do aparelho, inferidos do que a sessão
// concedeu. A API XR não expõe um número de graus de liberdade — o que
// existe é o conjunto de espaços de referência que a sessão aceitou
// entregar, e a inferência a partir disso é deliberadamente conservadora:
// um relatório errado que afirma "seis graus" com pouca evidência é pior
// que um relatório que admite não saber.

export type GrausDeLiberdade = 'tres' | 'seis' | 'indeterminado';

/**
 * Classe do aparelho deduzida da capacidade declarada, nunca da cadeia de
 * identificação do navegador — essa é editável, imitada por outros
 * aparelhos e envelhece a cada versão. O que a sessão concede é o que o
 * aparelho faz agora, na mão de quem está usando.
 */
export type ClasseDeAparelho =
  | 'sem-api'
  | 'somente-janela'
  | 'visor-sem-posicao'
  | 'visor-com-posicao'
  | 'aparelho-de-mao-com-camera';

/**
 * `local-floor`, `bounded-floor` e `unbounded` compartilham a mesma
 * exigência: o aparelho precisa saber onde fica o chão em relação a quem
 * observa. Este projeto só chega a pedir `local-floor` como recurso
 * opcional (a moldura fica parada ao alcance do braço — ver
 * devices/recursos.ts), mas a regra abaixo fica escrita para os três porque
 * é o conceito de "chão", não a lista de pedidos, que define o que conta
 * como seis graus.
 */
function indicaChaoRastreado(espaco: string): boolean {
  return espaco === 'local-floor' || espaco === 'bounded-floor' || espaco === 'unbounded';
}

/**
 * `viewer` sozinho é o mínimo que qualquer sessão concede: a origem
 * acompanha a cabeça de quem observa, e nenhuma translação é observável a
 * partir dela — evidência forte de três graus. Qualquer combinação fora
 * desses dois extremos (por exemplo `local` isolado, que a especificação
 * permite tanto a um aparelho de seis graus quanto a um de três que mantém
 * a origem fixa) não sustenta nenhuma das duas conclusões, e o retorno é
 * `indeterminado` em vez de uma aposta.
 */
export function grausDeLiberdade(espacosConcedidos: readonly string[]): GrausDeLiberdade {
  if (espacosConcedidos.some(indicaChaoRastreado)) {
    return 'seis';
  }
  if (espacosConcedidos.length === 1 && espacosConcedidos[0] === 'viewer') {
    return 'tres';
  }
  return 'indeterminado';
}

export function classificarAparelho(
  modosSuportados: readonly string[],
  graus: GrausDeLiberdade,
  temApiXr: boolean,
): ClasseDeAparelho {
  if (!temApiXr) {
    return 'sem-api';
  }
  const suportaVr = modosSuportados.includes('immersive-vr');
  const suportaAr = modosSuportados.includes('immersive-ar');

  if (!suportaVr && !suportaAr) {
    return 'somente-janela';
  }
  // Suporta AR e não suporta sessão imersiva completa é o padrão do
  // celular: a câmera vê a mesa real, mas ninguém veste nada no rosto.
  if (suportaAr && !suportaVr) {
    return 'aparelho-de-mao-com-camera';
  }
  return graus === 'tres' ? 'visor-sem-posicao' : 'visor-com-posicao';
}

export function descreverClasse(classe: ClasseDeAparelho): string {
  switch (classe) {
    case 'sem-api':
      return 'Navegador sem a API XR, ou página fora de contexto seguro.';
    case 'somente-janela':
      return 'Aparelho que só sustenta o regime em janela — é o caso do desktop do laboratório.';
    case 'visor-sem-posicao':
      return 'Visor que acompanha a rotação da cabeça e não acompanha o deslocamento.';
    case 'visor-com-posicao':
      return 'Visor que acompanha rotação e deslocamento, com o chão do ambiente como referência.';
    case 'aparelho-de-mao-com-camera':
      return 'Aparelho de mão que compõe a moldura sobre a imagem da própria câmera.';
  }
}
