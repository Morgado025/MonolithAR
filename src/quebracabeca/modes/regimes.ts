// Os três regimes em que o quebra-cabeça pode ser montado. Este arquivo não
// abre sessão nem consulta o navegador — só registra a intenção, regime a
// regime, para que possa ser confrontada depois com o que o aparelho
// responde (verificacao.ts) e com o que a sessão concede (devices/sonda.ts).

export type RegimeId = 'inline' | 'immersive-vr' | 'immersive-ar';

/** O que o regime faz com o ambiente de quem observa. */
export type TratamentoDoMundo =
  | 'substitui' // o ambiente sintético toma o lugar do ambiente real
  | 'preserva' // o ambiente real permanece visível e recebe o sintético sobre si
  | 'exibe'; // o ambiente sintético é mostrado por uma janela, sem tocar o real

/**
 * Modo de composição do fundo tal como a API XR o nomeia. Só é legível com
 * sessão ativa — aqui é sempre o valor ESPERADO, e a leitura do valor real
 * chega de devices/sonda.ts.
 */
export type ModoDeComposicao = 'opaque' | 'additive' | 'alpha-blend';

export interface Regime {
  readonly id: RegimeId;
  readonly nome: string;
  readonly tratamentoDoMundo: TratamentoDoMundo;
  /** Espaço de referência pretendido, no vocabulário da API XR. */
  readonly espacoDeReferencia: 'viewer' | 'local' | 'local-floor' | 'unbounded';
  /** O que o sistema rastreia neste regime, em uma frase. */
  readonly rastreia: string;
  /** Contra o que a cena é registrada — a origem do mundo virtual. */
  readonly registroContra: string;
  readonly composicaoEsperada: ModoDeComposicao;
  /** Por que este regime existe no projeto, e não como enfeite comparativo. */
  readonly papel: string;
}

export const REGIMES: readonly Regime[] = [
  {
    id: 'inline',
    nome: 'Quebra-cabeça em janela',
    tratamentoDoMundo: 'exibe',
    espacoDeReferencia: 'viewer',
    rastreia: 'nada do corpo; a câmera obedece ao mouse ou ao toque',
    registroContra: 'a origem arbitrária da própria cena, fixada por quem a modelou',
    composicaoEsperada: 'opaque',
    papel:
      'é o caso base e o destino de quem não tem headset — o quebra-cabeça ' +
      'inteiro precisa ser montável só nesta janela',
  },
  {
    id: 'immersive-vr',
    nome: 'Quebra-cabeça em realidade virtual',
    tratamentoDoMundo: 'substitui',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a pose da cabeça e das duas mãos, com seis graus de liberdade',
    registroContra:
      'o chão do espaço físico onde a pessoa está, o que faz a moldura ' +
      'nascer numa altura de mesa fixa em vez de flutuar',
    composicaoEsperada: 'opaque',
    papel: 'é onde escala corporal e alcance de braço passam a existir de verdade',
  },
  {
    id: 'immersive-ar',
    nome: 'Quebra-cabeça em realidade aumentada',
    tratamentoDoMundo: 'preserva',
    espacoDeReferencia: 'local-floor',
    rastreia:
      'a pose da cabeça, das mãos e as superfícies que o aparelho encontra no ambiente',
    registroContra:
      'uma superfície real escolhida (a mesa da sala), à qual a moldura ' +
      'permanece presa enquanto a pessoa caminha ao redor',
    composicaoEsperada: 'alpha-blend',
    papel:
      'é o único regime em que errar o registro é visível a olho nu — a ' +
      'moldura desliza sobre a mesa real',
  },
];

export function regimePorId(id: RegimeId): Regime {
  const encontrado = REGIMES.find((regime) => regime.id === id);
  if (encontrado === undefined) {
    // Inalcançável enquanto REGIMES cobrir RegimeId. Fica para o caso de
    // alguém acrescentar um id ao tipo e esquecer a entrada correspondente.
    throw new Error(`Regime não declarado: ${id}`);
  }
  return encontrado;
}
