// Troca o pai de um objeto sem mudar o lugar dele no mundo. É o que a
// montagem vai usar mais para frente: a peça apanhada vira filha da mão, e a
// peça encaixada vira filha do contorno.

import { Vector3, type Object3D } from 'three';

export interface TrocaDePai {
  peca: string;
  de: string;
  para: string;
  /** Posição no mundo, em metros, antes e depois da troca. */
  antes: Vector3;
  depois: Vector3;
  /** Quanto o objeto andou no mundo com a troca. O certo é dar zero. */
  desvio: number;
}

/**
 * A posição de um objeto é guardada em relação ao pai. Se a gente só
 * trocasse o pai, os mesmos números passariam a ser lidos a partir do pai
 * novo e o objeto pularia. Então recalculamos a transformação local:
 *
 *   local = (mundo do pai novo)⁻¹ × (mundo do objeto)
 *
 * Ou seja: "onde o objeto está, visto de dentro do pai novo".
 */
export function trocarDePai(objeto: Object3D, novoPai: Object3D): TrocaDePai {
  const de = objeto.parent?.name ?? '';

  // Atualiza as matrizes antes da conta. Se a moldura andou neste
  // quadro e a gente usasse a matriz velha, o objeto iria parar no
  // lugar antigo.
  objeto.updateWorldMatrix(true, false);
  novoPai.updateWorldMatrix(true, false);
  const antes = new Vector3().setFromMatrixPosition(objeto.matrixWorld);

  const inversaDoPai = novoPai.matrixWorld.clone().invert();
  const local = inversaDoPai.multiply(objeto.matrixWorld);
  novoPai.add(objeto);
  local.decompose(objeto.position, objeto.quaternion, objeto.scale);

  objeto.updateWorldMatrix(false, false);
  const depois = new Vector3().setFromMatrixPosition(objeto.matrixWorld);

  return {
    peca: objeto.name,
    de,
    para: novoPai.name,
    antes,
    depois,
    desvio: antes.distanceTo(depois),
  };
}
