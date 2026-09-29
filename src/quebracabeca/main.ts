// A página do quebra-cabeça. Monta a cena, liga o laço que desenha, cuida
// dos botões e, quando a pessoa pede, sonda o aparelho.

import { PerspectiveCamera, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { MESA, PECAS } from './dominio';
import { montarCena } from './cena';
import { trocarDePai, type TrocaDePai } from './trocarDePai';
import { criarRelogio } from './relogio';
import { criarMedidor } from './medidor';
import { perguntarSuporte } from './regimes';
import { modoParaSondar, sondar } from './sonda';
import {
  anotar,
  explicarErro,
  mostrarArvore,
  mostrarDominio,
  mostrarRegimes,
  mostrarSonda,
} from './pagina';

function pegar<T extends HTMLElement>(id: string): T {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`A página não tem o elemento #${id}.`);
  }
  return elemento as T;
}

const tela = pegar<HTMLCanvasElement>('tela');
const botaoDeslizar = pegar<HTMLButtonElement>('deslizar');
const escolhaDePeca = pegar<HTMLSelectElement>('peca');
const botaoPrender = pegar<HTMLButtonElement>('prender');
const botaoSondar = pegar<HTMLButtonElement>('sondar');
const raizArvore = pegar('arvore');

// ---------------------------------------------------------------- cena

const cena = montarCena();

const renderer = new WebGLRenderer({ canvas: tela, antialias: true });
// Mais de 2 pixels por pixel da tela só deixa mais caro, sem diferença visível.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const camera = new PerspectiveCamera(50, 1, 0.05, 30);
camera.position.set(0, 1.3, 0.78); // altura dos olhos de alguém de pé em frente à mesa

// Câmera que gira em volta da moldura com o mouse ou o dedo. Deixamos o
// amortecimento (enableDamping) desligado: ele freia a câmera um pouco a cada
// quadro, então num computador que desenha mais quadros ela pararia mais rápido.
const orbita = new OrbitControls(camera, tela);
orbita.target.set(0, MESA.altura, 0);
orbita.update();

// Sempre que o canvas muda de tamanho (janela, celular girado), ajusta a imagem.
new ResizeObserver(() => {
  renderer.setSize(tela.clientWidth, tela.clientHeight, false);
  camera.aspect = tela.clientWidth / tela.clientHeight;
  camera.updateProjectionMatrix();
}).observe(tela);

// ---------------------------------------------------------------- laço

const relogio = criarRelogio();
const medidor = criarMedidor();

let deslizando = false;
let fase = 0;

// setAnimationLoop em vez de requestAnimationFrame: quando uma sessão de VR
// ou AR abrir, quem manda os quadros é a sessão, e este laço já muda sozinho.
renderer.setAnimationLoop((agoraMs) => {
  const inicio = performance.now();
  const segundos = relogio.passo(agoraMs);

  if (deslizando) {
    // Uma ida e volta a cada 4 s, em qualquer máquina.
    fase += segundos * ((2 * Math.PI) / 4);
    cena.moldura.position.x = 0.1 * Math.sin(fase);
  }

  renderer.render(cena.sala, camera);

  // O custo é o tempo do nosso trabalho neste quadro: andar a cena e desenhar.
  const leitura = medidor.registrar(performance.now() - inicio, agoraMs);
  if (leitura !== undefined) {
    const { calls, triangles } = renderer.info.render;
    cena.painel.mostrar(leitura, calls, triangles);
  }
});

// ---------------------------------------------------------------- botões

botaoDeslizar.addEventListener('click', () => {
  deslizando = !deslizando;
  botaoDeslizar.textContent = deslizando ? 'Parar a moldura' : 'Deslizar a moldura';
});

for (const peca of PECAS) {
  escolhaDePeca.add(new Option(peca.nome, peca.id));
}

const trocas: TrocaDePai[] = [];

function pecaEscolhida() {
  return PECAS.find((peca) => peca.id === escolhaDePeca.value) ?? PECAS[0];
}

function atualizarBotaoPrender(): void {
  const peca = pecaEscolhida();
  const presa = cena.pecas.get(peca.id)?.parent === cena.contornos.get(peca.id);
  const nome = peca.nome.toLowerCase();
  botaoPrender.textContent = presa ? `Soltar ${nome} na mesa` : `Prender ${nome} ao contorno`;
}

// Prender a peça ao contorno não move a peça: só muda de quem ela é filha.
// Depois disso, se a moldura andar, a peça anda junto.
botaoPrender.addEventListener('click', () => {
  const peca = pecaEscolhida();
  const malha = cena.pecas.get(peca.id);
  const contorno = cena.contornos.get(peca.id);
  if (malha === undefined || contorno === undefined) {
    return;
  }
  const destino = malha.parent === contorno ? cena.superficie : contorno;
  const troca = trocarDePai(malha, destino);
  trocas.unshift(troca);

  const andou = troca.desvio === 0 ? '0' : troca.desvio.toExponential(1);
  anotar(`${peca.nome}: saiu de "${troca.de}" e foi para "${troca.para}". No mundo, andou ${andou} m.`);
  if (troca.desvio > 0.001) {
    anotar('A peça pulou mais de 1 mm na troca. Isso não deveria acontecer.', 'alerta');
  }
  mostrarArvore(raizArvore, cena.sala, trocas);
  atualizarBotaoPrender();
});

escolhaDePeca.addEventListener('change', atualizarBotaoPrender);
atualizarBotaoPrender();
mostrarArvore(raizArvore, cena.sala, trocas);

// ---------------------------------------------------------------- sonda

mostrarDominio(pegar('dominio'));

void perguntarSuporte().then((suporte) => {
  mostrarRegimes(pegar('regimes'), suporte);
  anotar('Regimes consultados. Para a sonda completa, clique em "Sondar capacidades".');

  botaoSondar.addEventListener('click', () => {
    const modo = modoParaSondar(suporte);
    if (modo === undefined) {
      anotar(
        navigator.xr === undefined
          ? 'Este navegador não tem WebXR, então não há sessão para sondar. Abra no Chrome ou no navegador do Quest.'
          : 'Este aparelho não abre sessão de VR nem de AR, então não há o que sondar em sessão.',
        'alerta',
      );
      return;
    }
    anotar('Sondando. Se o aparelho pedir permissão, aceite.');
    sondar(modo)
      .then((resultado) => {
        mostrarSonda(pegar('sonda'), resultado);
        anotar(`Sondagem concluída em ${resultado.modo}; a sessão já foi fechada.`);
      })
      .catch((erro: unknown) => anotar(explicarErro(erro), 'falha'));
  });
});
