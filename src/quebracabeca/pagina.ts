// Tudo que aparece escrito na página: o diário e as tabelas do quebra-cabeça,
// dos regimes, da sonda e da árvore. O resultado fica na página, e não só no
// console, porque quem está no celular ou de visor não abre o console.

import type { Object3D, Vector3 } from 'three';

import { PECAS, TAREFA } from './dominio';
import { REGIMES, type RegimeId, type Suporte } from './regimes';
import type { ResultadoDaSonda } from './sonda';
import type { TrocaDePai } from './trocarDePai';

function criar<K extends keyof HTMLElementTagNameMap>(tag: K, texto?: string): HTMLElementTagNameMap[K] {
  const elemento = document.createElement(tag);
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function tabela(cabecalho: string[], linhas: string[][]): HTMLTableElement {
  const t = criar('table');
  const topo = t.insertRow();
  for (const titulo of cabecalho) {
    topo.appendChild(criar('th', titulo));
  }
  for (const linha of linhas) {
    const tr = t.insertRow();
    for (const valor of linha) {
      tr.insertCell().textContent = valor;
    }
  }
  return t;
}

/** Número com vírgula e sem o "-0,0" que aparece em valores quase zero. */
function numero(valor: number, casas: number): string {
  const limpo = Math.abs(valor) < 0.5 * 10 ** -casas ? 0 : valor;
  return limpo.toFixed(casas).replace('.', ',');
}

function vetor(v: Vector3): string {
  return `(${numero(v.x, 4)}; ${numero(v.y, 4)}; ${numero(v.z, 4)})`;
}

// ---------------------------------------------------------------- diário

export function anotar(texto: string, tipo: 'nota' | 'alerta' | 'falha' = 'nota'): void {
  const linha = criar('p', `${tipo.toUpperCase()}: ${texto}`);
  linha.className = `diario-${tipo}`;
  document.getElementById('diario')?.appendChild(linha);
}

/** Traduz os erros mais comuns da sessão para algo que dê para entender. */
export function explicarErro(erro: unknown): string {
  if (erro instanceof DOMException && erro.name === 'NotSupportedError') {
    return 'O aparelho recusou a sessão: ele não suporta este modo.';
  }
  if (erro instanceof DOMException && erro.name === 'NotAllowedError') {
    return 'A permissão foi negada. Sem aceitar o acesso à câmera e aos sensores, a sessão não abre.';
  }
  if (erro instanceof DOMException && erro.name === 'SecurityError') {
    return 'O navegador recusou: a página precisa estar em HTTPS e o pedido tem de vir de um clique.';
  }
  if (erro instanceof DOMException && erro.name === 'InvalidStateError') {
    return 'Já existe uma sessão aberta. Feche a outra e tente de novo.';
  }
  return `A sondagem parou: ${erro instanceof Error ? erro.message : String(erro)}`;
}

// ---------------------------------------------------------------- seções

export function mostrarDominio(raiz: HTMLElement): void {
  raiz.replaceChildren(
    criar('h2', 'O quebra-cabeça'),
    criar('p', `Tarefa: ${TAREFA.enunciado}`),
    criar('p', `Concluída quando: ${TAREFA.concluidaQuando}`),
    tabela(
      ['Peça', 'Forma', 'Largura × altura × profundidade (m)'],
      PECAS.map((peca) => [peca.nome, peca.forma, peca.tamanho.map((v) => numero(v, 2)).join(' × ')]),
    ),
  );
}

export function mostrarRegimes(raiz: HTMLElement, suporte: Map<RegimeId, Suporte>): void {
  raiz.replaceChildren(
    criar('h2', 'Os três regimes, e o que este aparelho responde'),
    tabela(
      ['Regime', 'O que faz com o mundo', 'Espaço de referência', 'Rastreia', 'Registra contra', 'Neste aparelho'],
      REGIMES.map((regime) => [
        regime.nome,
        regime.mundo,
        regime.espacoDeReferencia,
        regime.rastreia,
        regime.registroContra,
        suporte.get(regime.id) ?? 'sem resposta',
      ]),
    ),
  );
  if (!window.isSecureContext) {
    raiz.appendChild(
      criar('p', 'Atenção: a página não está em HTTPS, então "sem resposta" aqui é culpa do endereço, não do aparelho.'),
    );
  }
}

export function mostrarSonda(raiz: HTMLElement, resultado: ResultadoDaSonda): void {
  const esperada = REGIMES.find((regime) => regime.id === resultado.modo)?.composicaoEsperada;
  const bateu = esperada === resultado.composicao;

  raiz.replaceChildren(
    criar('h2', 'Sonda de capacidades'),
    criar('h3', `Recursos pedidos na sessão ${resultado.modo}`),
    tabela(
      ['Recurso', 'Para quê', 'Neste aparelho'],
      resultado.recursos.map((recurso) => [recurso.nome, recurso.paraQue, recurso.estado]),
    ),
    criar('h3', 'Espaços de referência e graus de liberdade'),
    criar(
      'p',
      `A sessão aceitou: ${resultado.espacos.join(', ') || 'nenhum'}. Graus de liberdade: ${resultado.grausDeLiberdade}.`,
    ),
    criar('h3', 'Controles e mãos declarados'),
    resultado.fontesDeEntrada.length === 0
      ? criar('p', 'Nenhum. No visor, costuma ser controle desligado; no celular, é normal até o primeiro toque.')
      : tabela(
          ['Lado', 'Mira', 'Perfis'],
          resultado.fontesDeEntrada.map((fonte) => [fonte.lado, fonte.mira, fonte.perfis.join(', ')]),
        ),
    criar('h3', 'Composição da imagem'),
    criar(
      'p',
      `A gente declarou "${esperada}" e a sessão informou "${resultado.composicao}". ` +
        (bateu ? 'Bateu.' : 'Não bateu: quem está certo é o aparelho, e a declaração precisa ser corrigida.'),
    ),
  );
}

export function mostrarArvore(raiz: HTMLElement, sala: Object3D, trocas: TrocaDePai[]): void {
  const linhas: string[] = [];
  const percorrer = (no: Object3D, nivel: number): void => {
    const p = no.position;
    const posicao =
      nivel === 0 ? '' : `  (${numero(p.x * 100, 1)}; ${numero(p.y * 100, 1)}; ${numero(p.z * 100, 1)}) cm`;
    linhas.push(`${'    '.repeat(nivel)}${no.name || no.type}${posicao}`);
    no.children.forEach((filho) => percorrer(filho, nivel + 1));
  };
  percorrer(sala, 0);

  raiz.replaceChildren(
    criar('h3', 'A árvore da cena'),
    criar('p', 'Cada posição é em relação ao pai, não ao mundo. Atualiza ao carregar e a cada troca de pai.'),
    criar('pre', linhas.join('\n')),
    criar('h3', 'Trocas de pai'),
    trocas.length === 0
      ? criar('p', 'Nenhuma ainda. Escolha uma peça e clique em "Prender ao contorno".')
      : tabela(
          ['Peça', 'De → para', 'Posição no mundo antes (m)', 'Depois (m)', 'Quanto andou'],
          trocas.map((troca) => [
            troca.peca,
            `${troca.de} → ${troca.para}`,
            vetor(troca.antes),
            vetor(troca.depois),
            troca.desvio === 0 ? '0 m' : `${troca.desvio.toExponential(1).replace('.', ',')} m`,
          ]),
        ),
  );
}
