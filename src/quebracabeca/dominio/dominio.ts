// Domínio do quebra-cabeça: as peças do robô, os encaixes da moldura e a
// tarefa que define quando ele está resolvido. Não desenha nada e não abre
// sessão — é só o vocabulário do problema, tipado, para os módulos
// seguintes confrontarem contra o navegador e contra o aparelho.

export type PecaId = 'cabeca' | 'tronco' | 'braco-esquerdo' | 'braco-direito' | 'base';

export type EncaixeId =
  | 'encaixe-cabeca'
  | 'encaixe-tronco'
  | 'encaixe-braco-esquerdo'
  | 'encaixe-braco-direito'
  | 'encaixe-base';

export interface Peca {
  readonly id: PecaId;
  readonly nome: string;
  readonly descricao: string;
  /** O único encaixe da moldura em que esta peça completa a silhueta. */
  readonly encaixeCompativel: EncaixeId;
}

export interface Encaixe {
  readonly id: EncaixeId;
  readonly nome: string;
}

export interface TarefaDoDominio {
  readonly enunciado: string;
  readonly estadoFinal: string;
}

export interface Dominio {
  readonly nome: string;
  readonly descricao: string;
  readonly tarefa: TarefaDoDominio;
  readonly pecas: readonly Peca[];
  readonly encaixes: readonly Encaixe[];
}

export const QUEBRA_CABECA: Dominio = {
  nome: 'Robô de encaixe',
  descricao:
    'Um robô de brinquedo partido em cinco peças, apoiado sobre uma moldura ' +
    'com os contornos correspondentes recortados.',
  tarefa: {
    enunciado:
      'Montar o robô encaixando cada peça no contorno correspondente da ' +
      'moldura, na orientação em que ela se encaixa.',
    estadoFinal:
      'As cinco peças estão encaixadas nos contornos compatíveis da ' +
      'moldura, cada uma na orientação que completa a silhueta, e o robô ' +
      'aparece inteiro e reconhecível.',
  },
  pecas: [
    {
      id: 'cabeca',
      nome: 'Cabeça',
      descricao: 'A cabeça do robô, com os dois olhos redondos e a antena.',
      encaixeCompativel: 'encaixe-cabeca',
    },
    {
      id: 'tronco',
      nome: 'Tronco',
      descricao: 'O tronco retangular, onde fica o painel de botões.',
      encaixeCompativel: 'encaixe-tronco',
    },
    {
      id: 'braco-esquerdo',
      nome: 'Braço esquerdo',
      descricao: 'O braço esquerdo, articulado na altura do ombro.',
      encaixeCompativel: 'encaixe-braco-esquerdo',
    },
    {
      id: 'braco-direito',
      nome: 'Braço direito',
      descricao: 'O braço direito, espelhado em relação ao esquerdo.',
      encaixeCompativel: 'encaixe-braco-direito',
    },
    {
      id: 'base',
      nome: 'Base',
      descricao: 'A base com rodas, que sustenta o robô em pé.',
      encaixeCompativel: 'encaixe-base',
    },
  ],
  encaixes: [
    { id: 'encaixe-cabeca', nome: 'Contorno da cabeça' },
    { id: 'encaixe-tronco', nome: 'Contorno do tronco' },
    { id: 'encaixe-braco-esquerdo', nome: 'Contorno do braço esquerdo' },
    { id: 'encaixe-braco-direito', nome: 'Contorno do braço direito' },
    { id: 'encaixe-base', nome: 'Contorno da base' },
  ],
};

/**
 * As duas checagens são independentes: uma peça pode apontar para um
 * encaixe inexistente mesmo que todo encaixe declarado receba alguma peça
 * (e vice-versa), então as duas rodam sempre, sem uma abortar a outra.
 */
export function inconsistenciasDoDominio(dominio: Dominio): string[] {
  const problemas: string[] = [];

  const idsDeEncaixes = new Set(dominio.encaixes.map((encaixe) => encaixe.id));
  for (const peca of dominio.pecas) {
    if (!idsDeEncaixes.has(peca.encaixeCompativel)) {
      problemas.push(
        `A peça "${peca.nome}" declara compatibilidade com "${peca.encaixeCompativel}", que não está na lista de encaixes.`,
      );
    }
  }

  const idsReferenciados = new Set(dominio.pecas.map((peca) => peca.encaixeCompativel));
  for (const encaixe of dominio.encaixes) {
    if (!idsReferenciados.has(encaixe.id)) {
      problemas.push(`O encaixe "${encaixe.nome}" não recebe peça alguma.`);
    }
  }

  return problemas;
}
