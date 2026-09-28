// Mede quanto tempo o nosso código gasta em cada quadro e compara com o teto.
// A cada segundo ele fecha uma leitura (média, pior quadro e quantos passaram
// do teto) e começa outra do zero. Zerar é de propósito: numa média desde que
// a página abriu, um travamento de um segundo sumiria no meio de minutos.

/**
 * O teto do quadro: 13,9 ms, que é o tempo entre duas imagens num visor a
 * 72 Hz, o mínimo que a Seção 10 aceita. Se a cena cabe nesse tempo, cabe
 * também na tela do computador, que a 60 Hz tem 16,7 ms.
 */
export const TETO_MS = 1000 / 72;

export interface Leitura {
  quadros: number;
  quadrosPorSegundo: number;
  custoMedio: number;
  piorCusto: number;
  acimaDoTeto: number;
}

export function criarMedidor() {
  let inicioMs: number | undefined;
  let quadros = 0;
  let soma = 0;
  let pior = 0;
  let acima = 0;

  return {
    /** Anota o custo de um quadro. Quando completa um segundo, devolve a leitura. */
    registrar(custoMs: number, agoraMs: number): Leitura | undefined {
      if (inicioMs === undefined) {
        inicioMs = agoraMs;
      }
      quadros += 1;
      soma += custoMs;
      pior = Math.max(pior, custoMs);
      if (custoMs > TETO_MS) {
        acima += 1;
      }

      const segundos = (agoraMs - inicioMs) / 1000;
      if (segundos < 1) {
        return undefined;
      }

      const leitura: Leitura = {
        quadros,
        quadrosPorSegundo: quadros / segundos,
        custoMedio: soma / quadros,
        piorCusto: pior,
        acimaDoTeto: acima,
      };
      inicioMs = agoraMs;
      quadros = 0;
      soma = 0;
      pior = 0;
      acima = 0;
      return leitura;
    },
  };
}
