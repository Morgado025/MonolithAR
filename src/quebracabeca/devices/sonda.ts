// A sonda de capacidades: pergunta ao aparelho o que ele oferece e guarda a
// resposta numa estrutura que o resto do ambiente possa consultar. Não
// monta peça nem desenha nada — o que ela produz é conhecimento sobre o
// aparelho.
//
// Duas restrições da plataforma moldam o arquivo inteiro:
//
// 1. Metade das respostas só existe DENTRO de uma sessão (recursos
//    concedidos, composição do fundo, espaços de referência entregues,
//    fontes de entrada). Sondar de fora devolve suposição, não resposta.
// 2. Abrir sessão imersiva exige gesto de quem usa — o navegador recusa o
//    pedido que não vier de um clique. Por isso a sondagem completa só
//    roda dentro de uma função chamada por botão (ver main.ts).

import { REGIMES, type Regime, type RegimeId } from '../modes/regimes';
import { levantarRelatorio, type LinhaDoRelatorio } from '../modes/verificacao';
import { RECURSOS_CONSULTADOS, estadoDoRecurso, type EstadoDeRecurso } from './recursos';
import { ContadorDeEstabilidade, diagnosticar, type Estabilidade } from './estabilidade';
import {
  classificarAparelho,
  grausDeLiberdade,
  type ClasseDeAparelho,
  type GrausDeLiberdade,
} from './graus';

export type ModoSondavel = 'immersive-vr' | 'immersive-ar';

/**
 * Do mais exigente ao mínimo. `bounded-floor` e `unbounded` ficam de fora
 * pelo mesmo motivo que ficam fora de `RECURSOS_CONSULTADOS`: como nunca
 * são pedidos como feature opcional, `requestReferenceSpace` rejeitaria os
 * dois sempre, e testar um pedido que não pode dar certo não informa nada.
 */
const ESPACOS_TENTADOS: readonly XRReferenceSpaceType[] = ['local-floor', 'local', 'viewer'];

/** Um segundo e meio a 60 Hz: o bastante para notar uma lacuna, curto o bastante para não prender quem está de visor esperando. */
const QUADROS_OBSERVADOS = 90;

export interface RecursoSondado {
  readonly nome: string;
  readonly paraQueServe: string;
  readonly estado: EstadoDeRecurso;
}

export interface FonteDeEntradaSondada {
  /** Lado declarado: `left`, `right` ou `none`. */
  readonly lado: string;
  /** Como a mira é produzida: raio de controle, olhar ou toque na tela. */
  readonly mira: string;
  /** Há pose de punho — objeto rastreado no espaço, não só uma direção. */
  readonly temPoseDePunho: boolean;
  /** Há pose de mão articulada. */
  readonly temMao: boolean;
  /** Perfis declarados pelo aparelho, do mais específico ao mais genérico. */
  readonly perfis: readonly string[];
}

/** O que a sonda descobre sem abrir sessão alguma. */
export interface SondaSemSessao {
  readonly temApiXr: boolean;
  readonly contextoSeguro: boolean;
  readonly regimes: readonly LinhaDoRelatorio[];
  readonly modosSuportados: readonly string[];
}

/** O que só a sessão responde. */
export interface SondaEmSessao {
  readonly modo: ModoSondavel;
  readonly recursos: readonly RecursoSondado[];
  readonly espacosConcedidos: readonly string[];
  readonly composicaoObservada: XREnvironmentBlendMode;
  readonly fontesDeEntrada: readonly FonteDeEntradaSondada[];
  readonly graus: GrausDeLiberdade;
  readonly estabilidade: Estabilidade;
  readonly diagnostico: string;
}

export interface ResultadoDaSonda {
  readonly semSessao: SondaSemSessao;
  readonly emSessao: SondaEmSessao | undefined;
  /** Por que não houve sessão, quando não houve. */
  readonly motivoSemSessao: string | undefined;
  readonly classe: ClasseDeAparelho;
}

// Fora de contexto seguro a API XR não é exposta, e o sintoma é idêntico ao
// de um aparelho sem suporte algum — o erro de laboratório mais fácil de
// confundir com defeito de código.
function contextoSeguro(): boolean {
  return window.isSecureContext;
}

export async function sondarSemSessao(): Promise<SondaSemSessao> {
  const regimes = await levantarRelatorio();
  const modosSuportados = regimes
    .filter((linha) => linha.suporte === 'sim')
    .map((linha) => linha.regime.id);

  return {
    temApiXr: navigator.xr !== undefined,
    contextoSeguro: contextoSeguro(),
    regimes,
    modosSuportados,
  };
}

/**
 * O `catch` vazio aqui não esconde erro algum: a rejeição É a resposta —
 * é assim que a API informa que um espaço não foi concedido.
 */
async function espacosConcedidos(sessao: XRSession): Promise<string[]> {
  const obtidos: string[] = [];
  for (const tipo of ESPACOS_TENTADOS) {
    try {
      await sessao.requestReferenceSpace(tipo);
      obtidos.push(tipo);
    } catch {
      // Espaço não concedido — resposta, não falha.
    }
  }
  return obtidos;
}

function lerFontesDeEntrada(sessao: XRSession): FonteDeEntradaSondada[] {
  const fontes: FonteDeEntradaSondada[] = [];
  for (const fonte of sessao.inputSources) {
    fontes.push({
      lado: fonte.handedness,
      mira: fonte.targetRayMode,
      temPoseDePunho: fonte.gripSpace !== undefined,
      temMao: fonte.hand !== undefined,
      perfis: [...fonte.profiles],
    });
  }
  return fontes;
}

/**
 * A especificação só entrega quadros a uma sessão com superfície de
 * composição declarada. Não desenhamos nada nela — ela é só a condição
 * para o laço de quadros existir.
 */
function camadaMinima(sessao: XRSession): void {
  const tela = document.createElement('canvas');
  const gl = tela.getContext('webgl2', { xrCompatible: true });
  if (gl === null) {
    throw new Error('Este navegador não entregou contexto WebGL 2 compatível com XR.');
  }
  sessao.updateRenderState({ baseLayer: new XRWebGLLayer(sessao, gl) });
}

function observarQuadros(sessao: XRSession, referencia: XRReferenceSpace): Promise<Estabilidade> {
  return new Promise((resolver) => {
    const contador = new ContadorDeEstabilidade();
    let restantes = QUADROS_OBSERVADOS;

    const passo: XRFrameRequestCallback = (_tempo: number, quadro: XRFrame): void => {
      const pose = quadro.getViewerPose(referencia);
      contador.registrar(pose !== undefined, sessao.visibilityState === 'visible');
      restantes -= 1;
      if (restantes > 0) {
        sessao.requestAnimationFrame(passo);
        return;
      }
      resolver(contador.resultado());
    };

    sessao.requestAnimationFrame(passo);
  });
}

export async function sondarEmSessao(modo: ModoSondavel): Promise<SondaEmSessao> {
  const xr = navigator.xr;
  if (xr === undefined) {
    throw new Error('Não há API XR neste navegador.');
  }

  // Tudo como opcional: marcar um único recurso como obrigatório faria o
  // aparelho recusar a sessão inteira por causa daquele item, e a sonda
  // perderia justamente a informação que veio buscar.
  const sessao = await xr.requestSession(modo, {
    optionalFeatures: RECURSOS_CONSULTADOS.map((recurso) => recurso.nome),
  });

  try {
    camadaMinima(sessao);
    const concedidos = sessao.enabledFeatures;
    const espacos = await espacosConcedidos(sessao);
    const referencia = await sessao.requestReferenceSpace(
      espacos.includes('local-floor') ? 'local-floor' : 'viewer',
    );
    const estabilidade = await observarQuadros(sessao, referencia);
    const fontes = lerFontesDeEntrada(sessao);
    const graus = grausDeLiberdade(espacos);

    return {
      modo,
      recursos: RECURSOS_CONSULTADOS.map((recurso) => ({
        nome: recurso.nome,
        paraQueServe: recurso.paraQueServe,
        estado: estadoDoRecurso(recurso.nome, concedidos),
      })),
      espacosConcedidos: espacos,
      composicaoObservada: sessao.environmentBlendMode,
      fontesDeEntrada: fontes,
      graus,
      estabilidade,
      diagnostico: diagnosticar(estabilidade),
    };
  } finally {
    // Precisa encerrar mesmo quando a sondagem falha no meio: sessão
    // imersiva viva com a página parada prende o visor numa tela vazia, e
    // quem está com o aparelho no rosto só sai pelo menu do sistema.
    await sessao.end();
  }
}

/** Escolhe o modo mais informativo entre os que o aparelho declara suportar — AR também rastreia ambiente, não só pose. */
export function modoPreferido(modosSuportados: readonly string[]): ModoSondavel | undefined {
  const ordem: readonly ModoSondavel[] = ['immersive-ar', 'immersive-vr'];
  return ordem.find((modo) => modosSuportados.includes(modo));
}

export async function sondar(): Promise<ResultadoDaSonda> {
  const semSessao = await sondarSemSessao();
  const modo = modoPreferido(semSessao.modosSuportados);

  if (modo === undefined) {
    return {
      semSessao,
      emSessao: undefined,
      motivoSemSessao: semSessao.temApiXr
        ? 'Este aparelho não declara sessão imersiva alguma, e metade da sonda não tem onde acontecer. É informação sobre o aparelho, não defeito do código.'
        : 'Sem API XR neste navegador. Se a página não está em contexto seguro, a causa é a URL, e não o aparelho.',
      classe: classificarAparelho(semSessao.modosSuportados, 'indeterminado', semSessao.temApiXr),
    };
  }

  const emSessao = await sondarEmSessao(modo);
  return {
    semSessao,
    emSessao,
    motivoSemSessao: undefined,
    classe: classificarAparelho(semSessao.modosSuportados, emSessao.graus, semSessao.temApiXr),
  };
}

/**
 * Confronta a composição declarada em modes/regimes.ts com a que a sessão
 * de fato informou. É o primeiro ponto do percurso em que uma declaração
 * nossa pode ser desmentida pelo aparelho, e o desmentido é o resultado
 * mais valioso dos dois.
 */
export function conferirComposicao(emSessao: SondaEmSessao): string {
  const id: RegimeId = emSessao.modo;
  const regime: Regime | undefined = REGIMES.find((candidato) => candidato.id === id);
  if (regime === undefined) {
    return 'O regime sondado não consta da declaração de regimes.';
  }
  if (regime.composicaoEsperada === emSessao.composicaoObservada) {
    return `A composição declarada (${regime.composicaoEsperada}) foi confirmada pela sessão.`;
  }
  return (
    `Declaramos composição ${regime.composicaoEsperada} e a sessão informou ` +
    `${emSessao.composicaoObservada}. A declaração estava errada, e quem tem razão é o aparelho.`
  );
}
