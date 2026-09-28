// A sonda abre uma sessão imersiva de verdade e pergunta ao aparelho o que
// ele oferece: que recursos liberou, que espaços de referência aceita (é
// daí que sai quantos graus de liberdade ele rastreia) e que controles ou
// mãos ele declara. Só roda a partir de um clique, porque o navegador não
// abre sessão imersiva sem um gesto da pessoa.

import type { RegimeId, Suporte } from './regimes';

export type ModoImersivo = 'immersive-vr' | 'immersive-ar';

/**
 * "Negado" e "indeterminado" parecem a mesma coisa, mas não são.
 * Negado: a sessão mostrou a lista do que liberou e o recurso não está nela.
 * Indeterminado: a sessão nem mostrou a lista (isso é permitido pela
 * especificação do WebXR). Chamar o segundo caso de negado seria afirmar
 * uma coisa que ninguém mediu.
 */
export type EstadoDoRecurso = 'concedido' | 'negado' | 'indeterminado';

/** Os recursos que a gente pede, e para que cada um vai servir no quebra-cabeça. */
export const RECURSOS = [
  { nome: 'local-floor', paraQue: 'fazer a moldura nascer na altura da mesa, medida a partir do chão' },
  { nome: 'hit-test', paraQue: 'achar a mesa real onde apoiar a moldura' },
  { nome: 'anchors', paraQue: 'prender a moldura num ponto da mesa real' },
  { nome: 'plane-detection', paraQue: 'reconhecer a mesa como um plano' },
  { nome: 'hand-tracking', paraQue: 'montar com a mão, sem controle (só registramos por enquanto)' },
];

export interface ResultadoDaSonda {
  modo: ModoImersivo;
  recursos: { nome: string; paraQue: string; estado: EstadoDoRecurso }[];
  espacos: string[];
  grausDeLiberdade: '3' | '6' | 'não dá para afirmar';
  fontesDeEntrada: { lado: string; mira: string; perfis: string[] }[];
  composicao: string;
}

/**
 * O último resultado fica guardado aqui para o resto do código consultar.
 * Nos próximos módulos é daqui que sai, por exemplo, se vale mostrar o botão
 * de AR ou se dá para usar hit-test para achar a mesa.
 */
export let ultimoResultado: ResultadoDaSonda | undefined;

export function estadoDoRecurso(
  nome: string,
  liberados: readonly string[] | undefined,
): EstadoDoRecurso {
  if (liberados === undefined) {
    return 'indeterminado';
  }
  return liberados.includes(nome) ? 'concedido' : 'negado';
}

/** Qual modo sondar: AR primeiro, porque ele também rastreia o ambiente. */
export function modoParaSondar(suporte: Map<RegimeId, Suporte>): ModoImersivo | undefined {
  if (suporte.get('immersive-ar') === 'suportado') return 'immersive-ar';
  if (suporte.get('immersive-vr') === 'suportado') return 'immersive-vr';
  return undefined;
}

export async function sondar(modo: ModoImersivo): Promise<ResultadoDaSonda> {
  if (navigator.xr === undefined) {
    throw new Error('Este navegador não tem a API de WebXR.');
  }

  // Tudo como opcional: se um recurso fosse obrigatório e o aparelho não
  // tivesse, a sessão inteira seria recusada e a gente não saberia de nada.
  const sessao = await navigator.xr.requestSession(modo, {
    optionalFeatures: RECURSOS.map((recurso) => recurso.nome),
  });

  // O finally fecha a sessão mesmo se der erro no meio; senão quem está de
  // visor fica preso numa tela vazia.
  try {
    // A sessão só entrega quadros se tiver onde desenhar. Não desenhamos nada.
    const gl = document.createElement('canvas').getContext('webgl2', { xrCompatible: true });
    if (gl === null) {
      throw new Error('Não foi possível criar o contexto WebGL 2.');
    }
    sessao.updateRenderState({ baseLayer: new XRWebGLLayer(sessao, gl) });

    const espacos: string[] = [];
    for (const tipo of ['local-floor', 'local', 'viewer'] as const) {
      try {
        await sessao.requestReferenceSpace(tipo);
        espacos.push(tipo);
      } catch {
        // Espaço recusado: isso é uma resposta do aparelho, não um erro.
      }
    }

    // Os controles costumam aparecer só depois dos primeiros quadros.
    await esperarQuadros(sessao, 60);

    const fontesDeEntrada = [];
    for (const fonte of sessao.inputSources) {
      fontesDeEntrada.push({ lado: fonte.handedness, mira: fonte.targetRayMode, perfis: [...fonte.profiles] });
    }

    ultimoResultado = {
      modo,
      recursos: RECURSOS.map((recurso) => ({
        ...recurso,
        estado: estadoDoRecurso(recurso.nome, sessao.enabledFeatures),
      })),
      espacos,
      grausDeLiberdade: grausDeLiberdade(espacos),
      fontesDeEntrada,
      composicao: sessao.environmentBlendMode,
    };
    return ultimoResultado;
  } finally {
    await sessao.end();
  }
}

// A API não diz "6 graus" com todas as letras. Se o aparelho aceitou
// 'local-floor', ele sabe onde a cabeça está em relação ao chão, então
// rastreia posição e rotação: 6 graus. Se só aceitou 'viewer', ele só sabe
// para onde a cabeça aponta: 3 graus. Fora disso a gente não chuta.
function grausDeLiberdade(espacos: string[]): ResultadoDaSonda['grausDeLiberdade'] {
  if (espacos.includes('local-floor')) return '6';
  if (espacos.length === 1 && espacos[0] === 'viewer') return '3';
  return 'não dá para afirmar';
}

function esperarQuadros(sessao: XRSession, quantos: number): Promise<void> {
  return new Promise((pronto) => {
    const quadro = (): void => {
      quantos -= 1;
      if (quantos <= 0) {
        pronto();
      } else {
        sessao.requestAnimationFrame(quadro);
      }
    };
    sessao.requestAnimationFrame(quadro);
  });
}
