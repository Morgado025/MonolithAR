// Diz quantos segundos passaram desde o quadro anterior. Tudo o que anda na
// cena anda "por segundo" e não "por quadro"; assim a moldura leva o mesmo
// tempo para ir e voltar num computador rápido e num celular lento.

/**
 * O maior passo que a cena dá de uma vez: 0,15 s. Se a aba ficar escondida e
 * a pessoa voltar 10 s depois, a cena anda só 0,15 s em vez de dar um pulo.
 * Escolhemos 0,15 porque a moldura anda no máximo uns 16 cm/s, e 0,15 s disso
 * dá 2,4 cm, menos que a folga de 3 cm do encaixe.
 */
export const MAIOR_PASSO_S = 0.15;

export function criarRelogio() {
  let anteriorMs: number | undefined;

  return {
    /** Segundos desde o quadro anterior. */
    passo(agoraMs: number): number {
      if (anteriorMs === undefined) {
        anteriorMs = agoraMs;
        return 0; // primeiro quadro: não há "antes" para medir
      }
      const segundos = (agoraMs - anteriorMs) / 1000;
      anteriorMs = agoraMs;
      return Math.min(segundos, MAIOR_PASSO_S);
    },
  };
}
