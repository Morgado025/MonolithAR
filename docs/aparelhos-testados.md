# Aparelhos testados e números medidos

## Onde o ambiente já foi aberto

Só entra aqui o que alguém do grupo abriu de fato, no endereço `quebra-cabeca.html`.

| Aparelho | Regime que abriu | O que não abriu |
|---|---|---|
| Notebook Acer Nitro ANV15-51 — Windows 11, Core i5-13420H, GeForce RTX 4050 Laptop, tela de 144 Hz; navegador Chromium 152 | Janela: a cena com os objetos da Seção 3 e a troca de pai. A consulta de regimes respondeu "suportado" para a janela. | VR e AR: `isSessionSupported` respondeu "não suportado" nos dois (o notebook não tem hardware de XR). |
| O mesmo notebook, Microsoft Edge 154 (modo sem interface) | Janela: a cena, a troca de pai com a moldura deslizando e o painel de custo medindo. | Não testado em sessão. |
| Chrome headless em servidor, sem placa de vídeo (Módulo 02) | Janela: a página do Módulo 02 abriu e a consulta de regimes respondeu. A cena do Módulo 03 não foi aberta nele. | VR e AR: não suportados. |

**Falta antes da etiqueta `modulo-03`:** abrir o mesmo endereço num aparelho de outra classe (celular Android com Chrome e ARCore, ou um Quest) e na máquina da apresentação, e acrescentar uma linha para cada um. O relatório da sonda tem de sair diferente em cada classe de aparelho.

## Custo do quadro

**Lido no painel dentro da cena**, depois de uns segundos com a moldura deslizando:

| Máquina | Tela | Custo médio | Pior custo | Acima do teto (13,9 ms) | Quadros por segundo | Chamadas · triângulos |
|---|---|---|---|---|---|---|
| Acer Nitro ANV15-51, Edge 154 | 144 Hz | 0,44 ms | 1,20 ms | 0 de 145 | 144 | 17 · 426 |
| (máquina da apresentação) | | | | | | |

**Medido em laço, sem esperar a tela**, no mesmo notebook: a cena real (`cena.ts`, `painel.ts`, `medidor.ts`), 1.200 quadros por rodada, canvas de 960 × 600, moldura deslizando e painel atualizando uma vez por segundo. Três rodadas:

| Custo médio | p95 | Pior quadro | Acima de 13,9 ms |
|---|---|---|---|
| 0,20 a 0,27 ms | 0,4 a 0,5 ms | 3,1 ms | 0 de 3.600 |

O custo é o tempo do nosso código no quadro. Ele cabe com folga no teto, mas não inclui o trabalho da placa de vídeo, então é condição necessária e não suficiente para caber no visor.

Números que explicam decisões (mesmo notebook, primeira versão do painel):

- **Tamanho da textura do painel:** com 1120 × 600 pixels, 19 quadros acima de 13,9 ms em 20 s (picos de 20 a 40 ms logo depois de cada atualização da textura). Com 560 × 300, nenhum. Ficou 560 × 300.
- **Primeiro quadro:** 55 a 70 ms (compilação dos shaders e envio da geometria). Com `renderer.compile()` antes, 34 a 40 ms; não compensou. Esse pico só aparece na primeira leitura do painel.

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
