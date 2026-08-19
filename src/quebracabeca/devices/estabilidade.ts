// A falha de rastreamento como contagem, não como impressão. Um quadro sem
// pose de quem observa é o único sintoma de perda de rastreamento que se lê
// de dentro do código, sem sensor extra: a API prevê isso, e o quadro
// simplesmente entrega a pose ou não entrega nada.

export interface Estabilidade {
  readonly quadros: number;
  readonly quadrosSemPose: number;
  /** Maior sequência ininterrupta de quadros sem pose. */
  readonly maiorLacuna: number;
  /** Quadros descartados por a sessão não estar em primeiro plano. */
  readonly quadrosOcultos: number;
}

/**
 * Deliberadamente burro: só conta quadros com pose e quadros sem. A
 * interpretação fica em `diagnosticar`, separada de propósito — um contador
 * que já opina tende a concordar com quem o escreveu.
 */
export class ContadorDeEstabilidade {
  private quadros = 0;
  private quadrosSemPose = 0;
  private quadrosOcultos = 0;
  private maiorLacuna = 0;
  private lacunaCorrente = 0;

  /**
   * `visivel` separa perda de rastreamento de sessão fora de foco: quando
   * quem usa abre o menu do sistema do visor, a sessão continua viva, os
   * quadros continuam chegando e a pose deixa de vir — isso não é o
   * aparelho perdendo o rastreamento, é o sistema operacional tomando a
   * tela.
   */
  registrar(temPose: boolean, visivel: boolean): void {
    this.quadros += 1;

    if (!visivel) {
      this.quadrosOcultos += 1;
      this.lacunaCorrente = 0;
      return;
    }
    if (temPose) {
      this.lacunaCorrente = 0;
      return;
    }
    this.quadrosSemPose += 1;
    this.lacunaCorrente += 1;
    this.maiorLacuna = Math.max(this.maiorLacuna, this.lacunaCorrente);
  }

  resultado(): Estabilidade {
    return {
      quadros: this.quadros,
      quadrosSemPose: this.quadrosSemPose,
      maiorLacuna: this.maiorLacuna,
      quadrosOcultos: this.quadrosOcultos,
    };
  }
}

/**
 * As causas prováveis de degradação de rastreamento óptico são conhecidas
 * (superfície sem textura, iluminação pobre, movimento brusco), mas nenhuma
 * é distinguível só a partir desta contagem — nomear as três sem escolher
 * uma é mais honesto do que inventar o laudo junto com a medida.
 */
export function diagnosticar(estabilidade: Estabilidade): string {
  if (estabilidade.quadros === 0) {
    return 'Nenhum quadro foi entregue — a sessão não chegou a produzir imagem.';
  }
  if (estabilidade.quadrosSemPose === 0) {
    return (
      'A pose veio em todos os quadros observados. A janela de observação ' +
      'é curta, e isso não é promessa de estabilidade em uso prolongado.'
    );
  }
  const proporcao = Math.round((estabilidade.quadrosSemPose / estabilidade.quadros) * 100);
  return (
    `A pose faltou em ${proporcao}% dos quadros, com lacuna máxima de ` +
    `${estabilidade.maiorLacuna} quadros seguidos. Causas prováveis: ` +
    'superfície sem textura, iluminação pobre ou movimento brusco — e ' +
    'daqui não se distingue qual delas.'
  );
}
