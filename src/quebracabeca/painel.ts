// O painel que mostra o custo do quadro dentro da cena. Ele é um objeto em
// cima da mesa, e não um texto por cima da tela, porque dentro do visor não
// existe "canto da tela": quem está lá dentro só lê o que estiver no mundo.

import {
  CanvasTexture,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

import { TETO_MS, type Leitura } from './medidor';

export interface Painel {
  malha: Mesh;
  mostrar(leitura: Leitura, chamadas: number, triangulos: number): void;
}

function ms(valor: number, casas = 2): string {
  return `${valor.toFixed(casas).replace('.', ',')} ms`;
}

export function criarPainel(): Painel {
  // O texto é desenhado num canvas comum e vira textura do painel (56 x 30 cm).
  // Começamos com 1120 x 600 pixels, mas cada atualização travava um quadro
  // por 20 a 40 ms; com 560 x 300 isso sumiu e o texto continua legível.
  const canvas = document.createElement('canvas');
  canvas.width = 560;
  canvas.height = 300;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace;
  // Sem mipmaps: gerar mipmaps a cada atualização custa, e o texto é lido de perto.
  textura.generateMipmaps = false;
  textura.minFilter = LinearFilter;

  const malha = new Mesh(new PlaneGeometry(0.56, 0.3), new MeshBasicMaterial({ map: textura }));
  malha.name = 'painel';

  function escrever(linhas: string[]): void {
    ctx.fillStyle = '#101218';
    ctx.fillRect(0, 0, 560, 300);
    ctx.strokeStyle = '#3d6bff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 556, 296);

    ctx.fillStyle = '#9fb4ff';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('Custo do quadro', 20, 44);

    ctx.fillStyle = '#eef0f6';
    ctx.font = '21px system-ui, sans-serif';
    linhas.forEach((linha, i) => ctx.fillText(linha, 20, 92 + i * 42));

    textura.needsUpdate = true; // manda a imagem nova para a placa de vídeo
  }

  const teto = `Teto: ${ms(TETO_MS, 1)} por quadro (visor a 72 Hz)`;
  escrever([teto, 'Medindo...']);

  return {
    malha,
    mostrar(leitura, chamadas, triangulos) {
      escrever([
        teto,
        `Custo: média ${ms(leitura.custoMedio)} · pior ${ms(leitura.piorCusto)}`,
        `Acima do teto: ${leitura.acimaDoTeto} de ${leitura.quadros} quadros`,
        `${leitura.quadrosPorSegundo.toFixed(0)} quadros por segundo`,
        `${chamadas} chamadas de desenho · ${triangulos} triângulos`,
      ]);
    },
  };
}
