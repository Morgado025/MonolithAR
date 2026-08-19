// Monta o relatório em HTML comum, fora de qualquer cena 3D — este módulo
// ainda não tem grafo de cena, então não há onde desenhar um painel
// diegético. Quando existir, é este arquivo que muda de lugar, e nada mais.

import type { Dominio } from '../dominio/dominio';
import type { EstadoDeRecurso } from '../devices/recursos';
import { descreverClasse, type GrausDeLiberdade } from '../devices/graus';
import type { ResultadoDaSonda, SondaEmSessao } from '../devices/sonda';
import type { LinhaDoRelatorio, Suporte } from '../modes/verificacao';

function celula(texto: string, cabecalho = false): HTMLTableCellElement {
  const elemento = document.createElement(cabecalho ? 'th' : 'td');
  elemento.textContent = texto;
  return elemento;
}

function paragrafo(texto: string): HTMLParagraphElement {
  const elemento = document.createElement('p');
  elemento.textContent = texto;
  return elemento;
}

function subtitulo(texto: string): HTMLHeadingElement {
  const elemento = document.createElement('h3');
  elemento.textContent = texto;
  return elemento;
}

function rotuloDoSuporte(suporte: Suporte): string {
  switch (suporte) {
    case 'sim':
      return 'suportado';
    case 'nao':
      return 'não suportado';
    case 'desconhecido':
      return 'sem resposta';
  }
}

function tabelaDeRegimes(linhas: readonly LinhaDoRelatorio[]): HTMLTableElement {
  const tabela = document.createElement('table');
  const cabecalho = tabela.insertRow();
  for (const titulo of [
    'Regime',
    'O que faz com o mundo',
    'Espaço de referência',
    'Rastreia',
    'Registro contra',
    'Neste aparelho',
  ]) {
    cabecalho.appendChild(celula(titulo, true));
  }
  for (const linha of linhas) {
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(linha.regime.nome));
    fileira.appendChild(celula(linha.regime.tratamentoDoMundo));
    fileira.appendChild(celula(linha.regime.espacoDeReferencia));
    fileira.appendChild(celula(linha.regime.rastreia));
    fileira.appendChild(celula(linha.regime.registroContra));
    fileira.appendChild(celula(`${rotuloDoSuporte(linha.suporte)} — ${linha.observacao}`));
  }
  return tabela;
}

function tabelaDePecas(dominio: Dominio): HTMLTableElement {
  const tabela = document.createElement('table');
  const cabecalho = tabela.insertRow();
  for (const titulo of ['Peça', 'Descrição', 'Encaixe compatível']) {
    cabecalho.appendChild(celula(titulo, true));
  }
  for (const peca of dominio.pecas) {
    const encaixe = dominio.encaixes.find((candidato) => candidato.id === peca.encaixeCompativel);
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(peca.nome));
    fileira.appendChild(celula(peca.descricao));
    fileira.appendChild(celula(encaixe === undefined ? peca.encaixeCompativel : encaixe.nome));
  }
  return tabela;
}

function blocoDoDominio(dominio: Dominio, problemas: readonly string[]): HTMLElement {
  const bloco = document.createElement('section');

  const titulo = document.createElement('h2');
  titulo.textContent = `Domínio: ${dominio.nome}`;
  bloco.appendChild(titulo);

  bloco.appendChild(paragrafo(dominio.descricao));
  bloco.appendChild(
    paragrafo(`Tarefa: ${dominio.tarefa.enunciado} Concluída quando: ${dominio.tarefa.estadoFinal}`),
  );

  const resumo =
    `${dominio.pecas.length} peças e ${dominio.encaixes.length} encaixes declarados. ` +
    (problemas.length === 0
      ? 'Nenhuma inconsistência entre peças e encaixes.'
      : `Inconsistências: ${problemas.join(' ')}`);
  bloco.appendChild(paragrafo(resumo));
  bloco.appendChild(tabelaDePecas(dominio));

  return bloco;
}

export function montarRelatorio(
  raiz: HTMLElement,
  dominio: Dominio,
  problemas: readonly string[],
  linhas: readonly LinhaDoRelatorio[],
): void {
  raiz.replaceChildren();
  raiz.appendChild(blocoDoDominio(dominio, problemas));

  const tituloRegimes = document.createElement('h2');
  tituloRegimes.textContent = 'Regimes: o que foi declarado e o que este aparelho responde';
  raiz.appendChild(tituloRegimes);
  raiz.appendChild(tabelaDeRegimes(linhas));
}

// ---------------------------------------------------------------------------
// A partir daqui: apresentação da sonda de capacidades, só existe depois do
// clique no botão.
// ---------------------------------------------------------------------------

function rotuloDoEstado(estado: EstadoDeRecurso): string {
  switch (estado) {
    case 'concedido':
      return 'concedido';
    case 'negado':
      return 'não concedido';
    case 'indeterminado':
      return 'sem resposta';
  }
}

function rotuloDosGraus(graus: GrausDeLiberdade): string {
  switch (graus) {
    case 'tres':
      return 'três graus de liberdade — o aparelho acompanha para onde a cabeça aponta e não acompanha para onde ela vai';
    case 'seis':
      return 'seis graus de liberdade — o aparelho acompanha orientação e deslocamento';
    case 'indeterminado':
      return 'indeterminado — os espaços concedidos não bastam para afirmar nem uma coisa nem outra';
  }
}

function tabelaDeRecursos(sonda: SondaEmSessao): HTMLTableElement {
  const tabela = document.createElement('table');
  const cabecalho = tabela.insertRow();
  for (const titulo of ['Recurso', 'Para que serve', 'Neste aparelho']) {
    cabecalho.appendChild(celula(titulo, true));
  }
  for (const recurso of sonda.recursos) {
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(recurso.nome));
    fileira.appendChild(celula(recurso.paraQueServe));
    fileira.appendChild(celula(rotuloDoEstado(recurso.estado)));
  }
  return tabela;
}

function tabelaDeFontes(sonda: SondaEmSessao): HTMLElement {
  if (sonda.fontesDeEntrada.length === 0) {
    return paragrafo(
      'Nenhuma fonte de entrada foi declarada durante a sondagem. Num visor, isso costuma significar controle desligado ou fora de alcance; num aparelho de mão, é o esperado até o primeiro toque na tela.',
    );
  }
  const tabela = document.createElement('table');
  const cabecalho = tabela.insertRow();
  for (const titulo of ['Lado', 'Mira', 'Pose de punho', 'Mão articulada', 'Perfis']) {
    cabecalho.appendChild(celula(titulo, true));
  }
  for (const fonte of sonda.fontesDeEntrada) {
    const fileira = tabela.insertRow();
    fileira.appendChild(celula(fonte.lado));
    fileira.appendChild(celula(fonte.mira));
    fileira.appendChild(celula(fonte.temPoseDePunho ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.temMao ? 'sim' : 'não'));
    fileira.appendChild(celula(fonte.perfis.join(', ')));
  }
  return tabela;
}

/**
 * `confronto` vem pronto de fora porque quem o produz é devices/sonda.ts
 * (`conferirComposicao`), não a apresentação — este arquivo só formata o
 * que já foi decidido.
 */
export function montarSonda(
  raiz: HTMLElement,
  resultado: ResultadoDaSonda,
  confronto: string | undefined,
): void {
  raiz.replaceChildren();

  const titulo = document.createElement('h2');
  titulo.textContent = 'Sonda de capacidades';
  raiz.appendChild(titulo);

  raiz.appendChild(paragrafo(descreverClasse(resultado.classe)));
  raiz.appendChild(
    paragrafo(
      resultado.semSessao.contextoSeguro
        ? 'A página está em contexto seguro, então a ausência de um recurso é resposta do aparelho.'
        : 'A página NÃO está em contexto seguro. Nada abaixo é informação sobre o aparelho: é a URL impedindo a pergunta.',
    ),
  );

  const sonda = resultado.emSessao;
  if (sonda === undefined) {
    raiz.appendChild(
      paragrafo(resultado.motivoSemSessao ?? 'Não houve sessão, e o motivo não foi registrado.'),
    );
    return;
  }

  raiz.appendChild(subtitulo(`Recursos opcionais pedidos em ${sonda.modo}`));
  raiz.appendChild(tabelaDeRecursos(sonda));

  raiz.appendChild(subtitulo('Espaços de referência e graus de liberdade'));
  raiz.appendChild(
    paragrafo(
      sonda.espacosConcedidos.length === 0
        ? 'Nenhum espaço de referência foi concedido.'
        : `Concedidos: ${sonda.espacosConcedidos.join(', ')}.`,
    ),
  );
  raiz.appendChild(paragrafo(rotuloDosGraus(sonda.graus)));

  raiz.appendChild(subtitulo('Fontes de entrada declaradas'));
  raiz.appendChild(tabelaDeFontes(sonda));

  raiz.appendChild(subtitulo('Composição do fundo'));
  raiz.appendChild(paragrafo(`A sessão informou composição ${sonda.composicaoObservada}.`));
  if (confronto !== undefined) {
    raiz.appendChild(paragrafo(confronto));
  }

  raiz.appendChild(subtitulo('Estabilidade do rastreamento na janela observada'));
  raiz.appendChild(
    paragrafo(
      `${sonda.estabilidade.quadros} quadros observados, ${sonda.estabilidade.quadrosSemPose} sem pose, ${sonda.estabilidade.quadrosOcultos} com a sessão fora de primeiro plano.`,
    ),
  );
  raiz.appendChild(paragrafo(sonda.diagnostico));
}
