# Aparelhos testados e números medidos

## Onde o ambiente já foi aberto

Só entra aqui o que alguém do grupo abriu de fato, no endereço `quebra-cabeca.html`.

| Aparelho | Regime que abriu | O que não abriu |
|---|---|---|
| Notebook Acer Nitro ANV15-51 — Windows 11, Core i5-13420H, GeForce RTX 4050 Laptop, tela de 144 Hz; navegador Chromium 152 | Janela: a cena com os objetos da Seção 3 e a troca de pai. A consulta de regimes respondeu "suportado" para a janela. | VR e AR: `isSessionSupported` respondeu "não suportado" nos dois (o notebook não tem hardware de XR). |
| O mesmo notebook, Microsoft Edge 154 (modo sem interface) | Janela: a cena, a troca de pai com a moldura deslizando e o painel de custo medindo. | Não testado em sessão. |
| Chrome headless em servidor, sem placa de vídeo (Módulo 02) | Janela: a página do Módulo 02 abriu e a consulta de regimes respondeu. A cena do Módulo 03 não foi aberta nele. | VR e AR: não suportados. |
| Celular Motorola Moto G20 — Android, tela de 90 Hz; navegador Firefox para Android, pela rede local (`https://192.168.86.2:5173`) | Janela: a cena, a câmera girando com o dedo, a troca de pai (andou 0 m nas três trocas) e o painel de custo medindo. | Os três regimes deram **"sem resposta"**, sem o aviso de HTTPS: a página estava segura, mas o Firefox para Android não tem WebXR (`navigator.xr` não existe). A sonda não abriu sessão. |
| O mesmo celular Moto G20, no Chrome para Android, pelo mesmo endereço | Janela: a cena, a troca de pai e o painel de custo. **AR:** a sonda abriu uma sessão `immersive-ar` de verdade (o celular pediu permissão para mapear o ambiente), leu os recursos e fechou. A consulta respondeu "suportado" para os três regimes. | A cena ainda não é desenhada dentro da sessão de AR (Bloco 4). A sessão de VR não foi aberta: a sonda escolhe o AR quando os dois são suportados. Na primeira tentativa a sessão foi recusada; na segunda, abriu. |

**O mesmo endereço, três relatórios diferentes:**

| Regime | Notebook (Chromium) | Moto G20, Firefox | Moto G20, Chrome |
|---|---|---|---|
| Janela | suportado | sem resposta | suportado |
| VR | não suportado | sem resposta | suportado |
| AR | não suportado | sem resposta | suportado |

No notebook, o aparelho respondeu que não entra em VR nem AR. No Firefox, não havia a quem perguntar: o navegador não tem a API. No Chrome, o mesmo celular entra nos três. A página não confunde "não suportado" com "sem resposta", que é o que o Módulo 02 pede.

## O que a sonda leu no Moto G20 com Chrome

Sessão `immersive-ar`, aberta pelo botão "Sondar capacidades" e fechada logo depois:

| Recurso | Para quê | Neste aparelho |
|---|---|---|
| local-floor | fazer a moldura nascer na altura da mesa, medida a partir do chão | concedido |
| hit-test | achar a mesa real onde apoiar a moldura | concedido |
| anchors | prender a moldura num ponto da mesa real | concedido |
| plane-detection | reconhecer a mesa como um plano | concedido |
| hand-tracking | montar com a mão, sem controle | negado |

- **Espaços de referência aceitos:** `local-floor`, `local` e `viewer`. **Graus de liberdade: 6** (o celular sabe onde está, não só para onde aponta).
- **Controles e mãos:** nenhum, como esperado num celular antes do primeiro toque.
- **Composição:** declaramos `alpha-blend` e a sessão informou `alpha-blend`. Bateu.

É a primeira vez que a sonda roda contra hardware de AR de verdade, e a declaração do AR em `regimes.ts` não foi desmentida: tudo o que o regime vai precisar no Bloco 4 (hit-test, âncoras, chão) foi concedido. O `hand-tracking` como "negado" mostra na prática o segundo dos três estados: a lista veio, e ele não está nela.

**Achado do teste no celular:** a página mostrava "sem resposta" sem explicar por quê, e o alerta da sonda dizia "este aparelho não abre sessão", quando o limite era do navegador. Agora as duas mensagens dizem que o navegador não tem WebXR e sugerem abrir no Chrome ou no navegador do Quest.

**Achado do teste no Chrome:** na primeira tentativa, a sessão foi recusada com `NotSupportedError`, e a página dizia "ele não suporta este modo". Mas o modo era suportado: a segunda tentativa abriu. O Chrome usa esse mesmo erro por vários motivos, então a mensagem afirmava demais. Agora ela diz que o aparelho recusou a sessão e sugere tentar de novo e aceitar o pedido de permissão.

**Ainda vale testar:** um visor (Quest), para abrir uma sessão de VR, e a máquina da apresentação.

## Custo do quadro

**Lido no painel dentro da cena**, depois de alguns segundos com a página aberta:

| Máquina | Tela | Custo médio | Pior custo | Acima do teto (13,9 ms) | Quadros por segundo | Chamadas · triângulos |
|---|---|---|---|---|---|---|
| Acer Nitro ANV15-51, Edge 154 | 144 Hz | 0,44 ms | 1,20 ms | 0 de 145 | 144 | 17 · 426 |
| Motorola Moto G20, Firefox para Android | 90 Hz | 2,10 ms | 4,00 ms | 0 de 90 | 90 | 17 · 426 |
| Motorola Moto G20, Chrome para Android | 90 Hz | 1,17 ms | 5,90 ms | 0 de 84 | 84 | 17 · 426 |
| (máquina da apresentação) | | | | | | |

**Medido em laço, sem esperar a tela**, no mesmo notebook: a cena real (`cena.ts`, `painel.ts`, `medidor.ts`), 1.200 quadros por rodada, canvas de 960 × 600, moldura deslizando e painel atualizando uma vez por segundo. Três rodadas:

| Custo médio | p95 | Pior quadro | Acima de 13,9 ms |
|---|---|---|---|
| 0,20 a 0,27 ms | 0,4 a 0,5 ms | 3,1 ms | 0 de 3.600 |

O custo é o tempo do nosso código no quadro. Ele cabe com folga no teto, mas não inclui o trabalho da placa de vídeo, então é condição necessária e não suficiente para caber no visor.

No celular, o custo fica entre 2,5 e 5 vezes o do notebook (1,17 ms no Chrome e 2,10 ms no Firefox, contra 0,44 ms) e continua bem abaixo do teto; o pior quadro, 5,90 ms, também cabe. Os valores redondos do Firefox (4,00 ms) vêm do relógio da página, que ele arredonda a 1 ms por privacidade; a média, somando muitos quadros, continua útil. No Chrome, o celular desenhou 84 quadros por segundo numa tela de 90 Hz.

Números que explicam decisões (mesmo notebook, primeira versão do painel):

- **Tamanho da textura do painel:** com 1120 × 600 pixels, 19 quadros acima de 13,9 ms em 20 s (picos de 20 a 40 ms logo depois de cada atualização da textura). Com 560 × 300, nenhum. Ficou 560 × 300.
- **Primeiro quadro:** 55 a 70 ms (compilação dos shaders e envio da geometria). Com `renderer.compile()` antes, 34 a 40 ms; não compensou. Esse pico só aparece na primeira leitura do painel.

## A troca de pai nos casos de fronteira

Medido com o `trocarDePai.ts` do repositório, rodado no Node 24 no mesmo notebook, contra o mesmo ramo da árvore que o `cena.ts` monta (sala → mesa → superfície → moldura → contornos), com as medidas do `dominio.ts`. O painel ficou de fora porque precisa de canvas. "Quanto girou" compara a rotação da peça no mundo antes e depois.

| Caso | Quanto andou no mundo | Quanto girou no mundo |
|---|---|---|
| Cabeça → contorno, moldura parada (o caso da demonstração) | 0 m | 0° |
| Braço direito, que começa girado 90°, → contorno | 0 m | 0° |
| Moldura andou 8,9 cm e girou 30° no mesmo quadro, sem desenhar antes | 6 × 10⁻¹⁷ m | 3 × 10⁻⁶° |
| Mesa inteira movida 58 cm e girada 45° (como a âncora do AR vai fazer), moldura girada −15° | 1 × 10⁻¹⁶ m | 0° |
| 1.000 idas e voltas (prender e soltar), com a moldura mudando entre elas | no fim, 4 × 10⁻¹⁴ m do ponto de partida | 2 × 10⁻⁶° |
| **A mesma conta sem atualizar as matrizes antes** (moldura andou 8,9 cm) | **a peça pula 8,9 cm** | — |
| Limite: moldura com escala (2, 1, 1) e contorno girado 30° | 6 × 10⁻¹⁷ m | **15,9°** |

Os valores da ordem de 10⁻¹⁶ m são o limite do ponto flutuante, e os milionésimos de grau vêm do arredondamento da comparação: na prática, zero. A linha em negrito mostra o que as duas chamadas a `updateWorldMatrix` evitam: com a matriz do quadro anterior, a peça pula exatamente o que a moldura andou.

O limite é conhecido: uma matriz com escala diferente em cada eixo, somada a um giro, entorta a peça, e posição, rotação e escala não conseguem guardar isso. A posição continua certa, mas a peça sai girada. A nossa cena não usa escala em nenhum nó; se um dia usar, peça nenhuma pode ser filha de um nó com escala diferente em cada eixo.

## O relógio em cadências diferentes

A moldura deslizando com período de 4 s, simulada com o relógio da cena (`relogio.ts`) em quatro cadências, durante 8 s:

| Cadência | Ciclos com o relógio | Ciclos contando quadros (1/240 de ciclo por quadro) |
|---|---|---|
| 30 Hz | 2 | 1 |
| 60 Hz | 2 | 2 |
| 72 Hz | 2 | 2,4 |
| 144 Hz | 2 | 4,8 |

Com 8 s de aba escondida no meio de uma execução a 60 Hz: 12 s no relógio da parede e 4,12 s de cena. O maior passo possível move a moldura 2,36 cm, menos que a folga de 3 cm do encaixe.

**Como conferir com um cronômetro, em duas máquinas:** clique em "Deslizar a moldura" e conte as idas e voltas em 20 s. Em qualquer máquina são 5.
