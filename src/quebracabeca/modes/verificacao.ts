// Confronta os três regimes declarados com o que este navegador diz
// suportar. A pergunta aqui é a mais grossa possível — "este aparelho entra
// neste regime?" — respondida sem abrir sessão, só com isSessionSupported.
// Quantos graus de liberdade, quais recursos e quais fontes de entrada
// existem são perguntas mais finas que só uma sessão aberta responde; essas
// ficam em devices/sonda.ts.

import { REGIMES, type Regime, type RegimeId } from './regimes';

/**
 * `desconhecido` não é sinônimo de `nao`. Um navegador sem API XR (ou uma
 * página fora de HTTPS) não está dizendo que o aparelho não serve — está
 * dizendo que não sabe responder. Colapsar os dois em `nao` produziria um
 * relatório confiante sobre algo que não foi medido.
 */
export type Suporte = 'sim' | 'nao' | 'desconhecido';

export interface LinhaDoRelatorio {
  readonly regime: Regime;
  readonly suporte: Suporte;
  readonly observacao: string;
}

function sistemaXr(): XRSystem | undefined {
  return navigator.xr;
}

async function suporteDe(id: RegimeId): Promise<Suporte> {
  const xr = sistemaXr();
  if (xr === undefined) {
    return 'desconhecido';
  }
  try {
    const suportado = await xr.isSessionSupported(id);
    return suportado ? 'sim' : 'nao';
  } catch {
    // Alguns navegadores rejeitam a promessa em vez de resolver com `false`
    // para um modo que não reconhecem. O resultado prático é o mesmo: não
    // houve resposta utilizável.
    return 'desconhecido';
  }
}

function observacaoDe(regime: Regime, suporte: Suporte): string {
  if (suporte === 'sim') {
    return `Declarado com registro contra ${regime.registroContra}. Falta confrontar em sessão.`;
  }
  if (suporte === 'nao') {
    return 'Este aparelho não entra neste regime. É informação sobre o aparelho, não defeito do código.';
  }
  return 'Sem API XR neste navegador, ou página fora de contexto seguro (HTTPS).';
}

export async function levantarRelatorio(): Promise<LinhaDoRelatorio[]> {
  const linhas: LinhaDoRelatorio[] = [];
  for (const regime of REGIMES) {
    const suporte = await suporteDe(regime.id);
    linhas.push({ regime, suporte, observacao: observacaoDe(regime, suporte) });
  }
  return linhas;
}
