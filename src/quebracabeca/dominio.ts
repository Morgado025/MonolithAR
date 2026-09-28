// O quebra-cabeça em si: a tarefa, as cinco peças do robô e as medidas de
// tudo, em metros. Os números vêm das Seções 3, 4 e 6 da especificação.
// Nada aqui desenha; é só a descrição que o resto do código usa.

export type PecaId = 'cabeca' | 'tronco' | 'braco-esquerdo' | 'braco-direito' | 'base';

export interface Peca {
  id: PecaId;
  nome: string;
  forma: 'caixa' | 'cilindro';
  /** Largura, altura e profundidade em metros (no cilindro, a largura é o diâmetro). */
  tamanho: [number, number, number];
  /** Onde a peça está na mesa quando a tarefa começa, e girada quantos graus. */
  inicio: { x: number; z: number; giro: number };
  /** Onde fica o contorno desta peça na moldura. */
  contorno: { x: number; z: number };
}

export const TAREFA = {
  enunciado:
    'Montar o robô encaixando cada peça no contorno correspondente da moldura, na orientação em que ela se encaixa.',
  concluidaQuando:
    'As cinco peças estão nos seus contornos, cada uma a até 3 cm e 15° da posição certa.',
};

export const MESA = { altura: 0.75, largura: 1.2, profundidade: 0.8, espessura: 0.03 };
export const MOLDURA = { largura: 0.4, profundidade: 0.5, espessura: 0.02 };

// O robô aparece deitado na moldura, com a cabeça no fundo e a base perto de
// quem monta. Como ele está "de frente" para quem olha, o braço esquerdo dele
// fica do lado direito da moldura, igual a uma pessoa de frente para você.
//
// As peças começam fora da moldura, a menos de 60 cm do centro dela (Seção 11)
// e giradas, para que montar exija virar a peça e não só arrastar.
export const PECAS: Peca[] = [
  {
    id: 'cabeca',
    nome: 'Cabeça',
    forma: 'cilindro',
    tamanho: [0.08, 0.05, 0.08],
    inicio: { x: -0.36, z: -0.14, giro: 0 },
    contorno: { x: 0, z: -0.11 },
  },
  {
    id: 'tronco',
    nome: 'Tronco',
    forma: 'caixa',
    tamanho: [0.15, 0.06, 0.12],
    inicio: { x: 0.41, z: -0.1, giro: 20 },
    contorno: { x: 0, z: -0.01 },
  },
  {
    id: 'braco-esquerdo',
    nome: 'Braço esquerdo',
    forma: 'caixa',
    tamanho: [0.04, 0.04, 0.12],
    inicio: { x: 0.37, z: 0.16, giro: -30 },
    contorno: { x: 0.1, z: -0.01 },
  },
  {
    id: 'braco-direito',
    nome: 'Braço direito',
    forma: 'caixa',
    tamanho: [0.04, 0.04, 0.12],
    inicio: { x: -0.4, z: 0.1, giro: 90 },
    contorno: { x: -0.1, z: -0.01 },
  },
  {
    id: 'base',
    nome: 'Base',
    forma: 'caixa',
    tamanho: [0.14, 0.05, 0.1],
    inicio: { x: 0, z: 0.33, giro: 15 },
    contorno: { x: 0, z: 0.1 },
  },
];
