// Catálogo dos recursos opcionais que a sonda pede, e os três estados
// possíveis do que o aparelho respondeu sobre cada um. A API trata "recurso
// que o aparelho não tem" e "recurso que o aparelho tem e não concedeu" da
// mesma forma na hora de pedir — os dois passam por `optionalFeatures` e
// simplesmente não aparecem depois —, e é essa distinção que este arquivo
// constrói à mão.

/**
 * - `concedido`: o nome está em `enabledFeatures` — o recurso pode ser usado.
 * - `negado`: a sessão informou a lista, e o nome não está nela.
 * - `indeterminado`: `enabledFeatures` é opcional na especificação, e uma
 *   sessão pode simplesmente não relatar o que concedeu. Tratar isso como
 *   `negado` descreveria um aparelho competente como incapaz.
 */
export type EstadoDeRecurso = 'concedido' | 'negado' | 'indeterminado';

export interface RecursoOpcional {
  /** O nome exato aceito por `optionalFeatures` — não traduzir. */
  readonly nome: string;
  readonly paraQueServe: string;
}

/**
 * Os recursos que este quebra-cabeça consulta.
 *
 * `bounded-floor` e `unbounded` ficam de fora porque o domínio não pede: a
 * moldura fica num ponto fixo ao alcance do braço e nunca exige caminhar
 * por uma área livre mapeada — pedir os dois só alongaria a sondagem sem
 * nenhum módulo adiante consumir a resposta.
 *
 * `depth-sensing` também fica de fora, mas por outro motivo: ele exige um
 * dicionário de configuração próprio no pedido de sessão, e um pedido
 * malformado derruba a sessão inteira em vez de simplesmente negar o
 * recurso — caro demais para uma sondagem genérica.
 */
export const RECURSOS_CONSULTADOS: readonly RecursoOpcional[] = [
  {
    nome: 'local-floor',
    paraQueServe:
      'origem no chão do espaço físico — o que faz a moldura nascer numa altura de mesa fixa',
  },
  {
    nome: 'hit-test',
    paraQueServe: 'lançar um raio contra a mesa real, para sugerir onde apoiar a moldura',
  },
  {
    nome: 'anchors',
    paraQueServe: 'prender a moldura a um ponto do mapa e deixar o aparelho corrigi-la',
  },
  {
    nome: 'plane-detection',
    paraQueServe: 'reconhecer a mesa como plano, sem depender só de um toque de hit-test',
  },
  {
    nome: 'hand-tracking',
    paraQueServe:
      'encaixar peça com a mão livre, sem controle — fora do núcleo da tarefa, consultado só para registro',
  },
];

/**
 * `concedidos` vem de `XRSession.enabledFeatures`, que é opcional na
 * especificação: `undefined` significa "esta sessão não diz", e é o que
 * produz `indeterminado`.
 */
export function estadoDoRecurso(
  nome: string,
  concedidos: readonly string[] | undefined,
): EstadoDeRecurso {
  if (concedidos === undefined) {
    return 'indeterminado';
  }
  return concedidos.includes(nome) ? 'concedido' : 'negado';
}
