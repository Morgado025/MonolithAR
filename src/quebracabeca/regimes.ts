// Os três regimes do quebra-cabeça, do jeito que a gente declarou na
// especificação (Seção 9), e a primeira pergunta ao aparelho: ele consegue
// entrar em cada um deles? Essa pergunta não abre sessão nenhuma.

export type RegimeId = 'inline' | 'immersive-vr' | 'immersive-ar';

export interface Regime {
  id: RegimeId;
  nome: string;
  /** O que o regime faz com o mundo de quem está olhando. */
  mundo: 'substitui' | 'preserva' | 'exibe';
  espacoDeReferencia: 'viewer' | 'local-floor';
  rastreia: string;
  registroContra: string;
  /** Como a gente espera que a imagem seja composta; a sonda confere de verdade. */
  composicaoEsperada: 'opaque' | 'alpha-blend';
  papel: string;
}

export const REGIMES: Regime[] = [
  {
    id: 'inline',
    nome: 'Quebra-cabeça em janela',
    mundo: 'exibe',
    espacoDeReferencia: 'viewer',
    rastreia: 'nada do corpo; a câmera obedece ao mouse ou ao toque',
    registroContra: 'o ponto zero que nós mesmos escolhemos para a cena: o chão, embaixo do centro da mesa',
    composicaoEsperada: 'opaque',
    papel:
      'é o caso base e o destino de quem não tem headset — o quebra-cabeça inteiro precisa ser montável só nesta janela',
  },
  {
    id: 'immersive-vr',
    nome: 'Quebra-cabeça em realidade virtual',
    mundo: 'substitui',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a pose da cabeça e das duas mãos, com seis graus de liberdade',
    registroContra:
      'o chão do espaço físico onde a pessoa está, o que faz a moldura nascer numa altura de mesa fixa em vez de flutuar',
    composicaoEsperada: 'opaque',
    papel: 'é onde escala corporal e alcance de braço passam a existir de verdade',
  },
  {
    id: 'immersive-ar',
    nome: 'Quebra-cabeça em realidade aumentada',
    mundo: 'preserva',
    espacoDeReferencia: 'local-floor',
    rastreia: 'a pose da cabeça, das mãos e as superfícies que o aparelho encontra no ambiente',
    registroContra:
      'uma superfície real escolhida (a mesa da sala), à qual a moldura permanece presa enquanto a pessoa caminha ao redor',
    composicaoEsperada: 'alpha-blend',
    papel:
      'é o único regime em que errar o registro é visível a olho nu — a moldura desliza sobre a mesa real',
  },
];

export type Suporte = 'suportado' | 'não suportado' | 'sem resposta';

/** Pergunta ao navegador se ele entra em cada regime. */
export async function perguntarSuporte(): Promise<Map<RegimeId, Suporte>> {
  const respostas = new Map<RegimeId, Suporte>();
  for (const regime of REGIMES) {
    respostas.set(regime.id, await suporteDe(regime.id));
  }
  return respostas;
}

async function suporteDe(id: RegimeId): Promise<Suporte> {
  // Sem navigator.xr (navegador sem WebXR ou página fora de HTTPS) a resposta
  // não é "não suportado": é que ninguém respondeu. Misturar os dois faria o
  // relatório culpar o aparelho por um problema do endereço.
  if (navigator.xr === undefined) {
    return 'sem resposta';
  }
  try {
    return (await navigator.xr.isSessionSupported(id)) ? 'suportado' : 'não suportado';
  } catch {
    return 'sem resposta';
  }
}
