// Composição da página do quebra-cabeça: delimitação do domínio, declaração
// dos regimes e sonda de capacidades. Nada aqui desenha — a página só
// relata o que foi declarado e o que o aparelho responde.
//
// Dois tempos: o que se responde sem sessão sobe ao carregar; o que só a
// sessão responde espera o clique no botão, porque o navegador recusa o
// pedido de sessão imersiva que não vier de um gesto de quem usa.

import { QUEBRA_CABECA, inconsistenciasDoDominio } from './dominio/dominio';
import { levantarRelatorio } from './modes/verificacao';
import { conferirComposicao, sondar, type ResultadoDaSonda } from './devices/sonda';
import { montarRelatorio, montarSonda } from './relatorio/relatorio';
import { Diario, explicarFalha } from './relatorio/diario';

function exigirElemento(id: string): HTMLElement {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`A página não tem o elemento #${id}.`);
  }
  return elemento;
}

const raizRelatorio = exigirElemento('relatorio');
const raizSonda = exigirElemento('sonda');
const raizDiario = exigirElemento('diario');
const botao = exigirElemento('sondar');

const diario = new Diario();
diario.fixarDestino(raizDiario);

const problemas = inconsistenciasDoDominio(QUEBRA_CABECA);
if (problemas.length > 0) {
  diario.alerta(`O domínio tem inconsistências: ${problemas.join(' ')}`);
}

// isSessionSupported responde por promessa — o navegador pode precisar
// consultar o runtime do aparelho antes de saber.
void levantarRelatorio().then((linhas) => {
  montarRelatorio(raizRelatorio, QUEBRA_CABECA, problemas, linhas);
  diario.nota('Consulta sem sessão concluída. A sonda completa espera um clique no botão.');
});

if (!window.isSecureContext) {
  diario.alerta(
    'Esta página não está em contexto seguro. A API XR não é exposta aqui, e o botão vai responder como se o aparelho não tivesse suporte — o que seria mentira sobre o aparelho.',
  );
}

async function executarSonda(): Promise<void> {
  diario.nota('Sondando. Se o aparelho pedir permissão, aceite: sem ela a sessão não abre.');
  try {
    const resultado: ResultadoDaSonda = await sondar();
    const confronto =
      resultado.emSessao === undefined ? undefined : conferirComposicao(resultado.emSessao);
    montarSonda(raizSonda, resultado, confronto);
    diario.nota('Sondagem concluída e sessão encerrada.');
  } catch (erro: unknown) {
    // A falha é resultado, e precisa ser lida no próprio aparelho — quem
    // está de visor não abre console de depuração.
    diario.falha(explicarFalha(erro));
  }
}

botao.addEventListener('click', () => {
  void executarSonda();
});
