// Monta a cena como uma árvore. Cada objeto guarda a posição em relação ao
// pai, e não ao mundo; por isso, quando o pai se mexe, os filhos vão junto
// sem ninguém precisar fazer conta.
//
//   sala
//   └ mesa                  (no chão)
//     ├ tampo e 4 pernas
//     └ superficie          (a face de cima do tampo, a 0,75 m)
//       ├ moldura
//       │ └ 5 contornos
//       ├ 5 peças
//       └ painel            (custo do quadro)
//
// As formas são simples (caixas e cilindros, cor lisa, sem textura) de
// propósito: por enquanto o que importa é o tamanho certo e quem é filho de quem.

import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from 'three';

import { MESA, MOLDURA, PECAS, type Peca, type PecaId } from './dominio';
import { criarPainel, type Painel } from './painel';

export interface Cena {
  sala: Scene;
  superficie: Group;
  moldura: Mesh;
  contornos: Map<PecaId, Mesh>;
  pecas: Map<PecaId, Mesh>;
  painel: Painel;
}

const COR: Record<PecaId, number> = {
  cabeca: 0x9fb0c8,
  tronco: 0x7d8fa8,
  'braco-esquerdo': 0xa9b98d,
  'braco-direito': 0xa9b98d,
  base: 0x9b88b0,
};

function material(cor: number): MeshStandardMaterial {
  return new MeshStandardMaterial({ color: cor, roughness: 0.8 });
}

function formaDa(peca: Peca, altura: number): BoxGeometry | CylinderGeometry {
  const [largura, , profundidade] = peca.tamanho;
  return peca.forma === 'cilindro'
    ? new CylinderGeometry(largura / 2, largura / 2, altura, 32)
    : new BoxGeometry(largura, altura, profundidade);
}

export function montarCena(): Cena {
  const sala = new Scene();
  sala.name = 'sala';
  sala.background = new Color(0x15161c);
  const luz = new HemisphereLight(0xe3e8f5, 0x2b2d35, 1.2);
  luz.name = 'luz-geral';
  sala.add(luz);
  const sol = new DirectionalLight(0xffffff, 1.6);
  sol.name = 'sol';
  sol.position.set(0.8, 2.2, 1.2);
  sala.add(sol);

  const mesa = new Group();
  mesa.name = 'mesa';
  sala.add(mesa);

  const tampo = new Mesh(new BoxGeometry(MESA.largura, MESA.espessura, MESA.profundidade), material(0x6b5a45));
  tampo.name = 'tampo';
  tampo.position.y = MESA.altura - MESA.espessura / 2;
  mesa.add(tampo);

  // Tampo e pernas nunca saem da mesa, então já nascem no lugar certo.
  const alturaDaPerna = MESA.altura - MESA.espessura;
  for (const [x, z] of [[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]]) {
    const perna = new Mesh(new BoxGeometry(0.05, alturaDaPerna, 0.05), material(0x4a3f33));
    perna.name = 'perna';
    perna.position.set(x, alturaDaPerna / 2, z);
    mesa.add(perna);
  }

  // Um nó vazio na face de cima do tampo. Tudo que está apoiado na mesa fica
  // pendurado nele. No modo AR a mesa virtual não aparece: é só pendurar este
  // nó na âncora da mesa de verdade, e nada abaixo dele precisa mudar.
  const superficie = new Group();
  superficie.name = 'superficie';
  superficie.position.y = MESA.altura;
  mesa.add(superficie);

  const moldura = new Mesh(
    new BoxGeometry(MOLDURA.largura, MOLDURA.espessura, MOLDURA.profundidade),
    material(0xc9b999),
  );
  moldura.name = 'moldura';
  moldura.position.y = MOLDURA.espessura / 2;
  superficie.add(moldura);

  const contornos = new Map<PecaId, Mesh>();
  const pecas = new Map<PecaId, Mesh>();

  for (const peca of PECAS) {
    // O contorno é um recorte da moldura, por isso é filho dela: se a moldura
    // anda, os contornos andam junto.
    const contorno = new Mesh(formaDa(peca, 0.003), material(0x2e2823));
    contorno.name = `contorno-${peca.id}`;
    contorno.position.set(peca.contorno.x, MOLDURA.espessura / 2, peca.contorno.z);
    moldura.add(contorno);
    contornos.set(peca.id, contorno);

    // A peça começa solta em cima da mesa, e não dentro do contorno: montar o
    // robô vai ser justamente passar a peça de um pai para o outro.
    const altura = peca.tamanho[1];
    const malha = new Mesh(formaDa(peca, altura), material(COR[peca.id]));
    malha.name = peca.id;
    malha.position.set(peca.inicio.x, altura / 2, peca.inicio.z);
    malha.rotation.y = MathUtils.degToRad(peca.inicio.giro);
    superficie.add(malha);
    pecas.set(peca.id, malha);
  }

  // O painel fica em pé no fundo da mesa, inclinado para quem está olhando.
  // Ele é filho da superfície e não da moldura, para não deslizar junto com ela.
  const painel = criarPainel();
  painel.malha.position.set(0, 0.155, -0.34);
  painel.malha.rotation.x = MathUtils.degToRad(-20);
  superficie.add(painel.malha);

  return { sala, superficie, moldura, contornos, pecas, painel };
}
