// O diário da sondagem — visível na própria página, não só no console. Quem
// está com o aparelho no rosto não abre painel de desenvolvedor, não lê
// aviso de rede e não vê exceção. Tudo o que a sondagem tiver a dizer
// precisa aparecer na página.

export type Severidade = 'nota' | 'alerta' | 'falha';

export interface Entrada {
  readonly severidade: Severidade;
  readonly texto: string;
}

const ROTULOS: Record<Severidade, string> = {
  nota: 'NOTA',
  alerta: 'ALERTA',
  falha: 'FALHA',
};

/**
 * Acumula as entradas antes de ter onde escrevê-las. A sondagem pode falhar
 * durante o carregamento da página, e uma mensagem perdida por falta de
 * destino é a pior categoria de mensagem: existiu, foi formatada e ninguém
 * a leu.
 */
export class Diario {
  private readonly entradas: Entrada[] = [];
  private destino: HTMLElement | undefined = undefined;

  fixarDestino(destino: HTMLElement): void {
    this.destino = destino;
    this.redesenhar();
  }

  nota(texto: string): void {
    this.registrar({ severidade: 'nota', texto });
  }

  alerta(texto: string): void {
    this.registrar({ severidade: 'alerta', texto });
  }

  falha(texto: string): void {
    this.registrar({ severidade: 'falha', texto });
  }

  private registrar(entrada: Entrada): void {
    this.entradas.push(entrada);
    // O espelho no console só serve à depuração remota, com o aparelho
    // ligado ao computador — nunca é o canal principal.
    console.info(`[quebra-cabeca:${entrada.severidade}] ${entrada.texto}`);
    this.redesenhar();
  }

  private redesenhar(): void {
    const destino = this.destino;
    if (destino === undefined) {
      return;
    }
    destino.replaceChildren();
    for (const entrada of this.entradas) {
      const linha = document.createElement('p');
      linha.className = `diario diario-${entrada.severidade}`;
      // O prefixo textual (além da cor/borda por CSS) é o que garante que a
      // severidade se distinga mesmo sem depender de contraste de cor.
      linha.textContent = `${ROTULOS[entrada.severidade]}: ${entrada.texto}`;
      destino.appendChild(linha);
    }
  }
}

/**
 * A recusa de sessão chega como erro cru — nome de classe e uma frase em
 * inglês —, e é isso que faz alguém concluir que o código quebrou quando o
 * que houve foi o aparelho dizendo não.
 */
export function explicarFalha(erro: unknown): string {
  if (erro instanceof DOMException && erro.name === 'NotSupportedError') {
    return 'O aparelho recusou a sessão neste modo. Ele não a sustenta, e o pedido foi respondido.';
  }
  if (erro instanceof DOMException && erro.name === 'SecurityError') {
    return 'O navegador recusou o pedido por falta de gesto de quem usa ou por contexto inseguro. O botão precisa ser tocado, e a página precisa estar em conexão cifrada.';
  }
  if (erro instanceof DOMException && erro.name === 'InvalidStateError') {
    return 'Já existe uma sessão aberta neste navegador. Encerre a anterior antes de sondar de novo.';
  }
  if (erro instanceof Error) {
    return `A sondagem parou: ${erro.message}`;
  }
  return 'A sondagem parou por um motivo que o navegador não descreveu.';
}
