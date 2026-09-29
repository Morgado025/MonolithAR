# MonolithAR

Um quebra-cabeça de encaixe em WebXR: um robô de brinquedo partido em cinco peças, que se monta encaixando cada parte no contorno correspondente de uma moldura. O mesmo endereço serve a cena em três regimes — numa janela do navegador, dentro de um visor (VR) e pousada sobre uma mesa de verdade pela câmera do celular (AR). Projeto Integrador de Realidade Aumentada e Virtual (UNIMAR).

A especificação completa está em [`docs/especificacao.md`](docs/especificacao.md).

## O que já funciona (fim do Módulo 03)

- **Regime em janela:** a cena abre com a mesa, a moldura, os cinco contornos e as cinco peças, em formas simples e em escala real (um metro por unidade), montada como árvore. A câmera gira em volta da moldura com o mouse ou o dedo.
- **Troca de pai:** uma peça passa a ser filha do seu contorno (e volta para a mesa) sem sair do lugar. A página mostra a posição no mundo antes e depois.
- **Laço pelo relógio:** a cena anda pelo tempo que passou, e não pela quantidade de quadros, e não dá pulo quando a aba fica escondida.
- **Custo do quadro dentro da cena:** um painel em cima da mesa mostra, a cada segundo, o custo médio e o pior, quantos quadros passaram do teto de 13,9 ms, quadros por segundo, chamadas de desenho e triângulos.
- **Sonda de capacidades:** pergunta ao aparelho que sessões ele suporta, que recursos libera, que controles declara e quantos graus de liberdade rastreia, e mostra o resultado na própria página.

**Ainda não funciona:** a cena não é desenhada dentro das sessões de VR e AR (a sonda abre a sessão só para perguntar), e ainda não há apanhar, mover nem encaixar peças — vêm nos módulos de interação.

## Em quais aparelhos já foi visto funcionando

Tabela completa, com os números medidos e a máquina de cada medição, em [`docs/aparelhos-testados.md`](docs/aparelhos-testados.md).

| Aparelho | Abriu | Não abriu |
|---|---|---|
| Notebook Windows 11 (Acer Nitro ANV15-51), Chromium 152 e Edge 154 | janela | VR, AR (sem hardware XR) |
| Celular Motorola Moto G20, Chrome para Android | janela; sessão de AR aberta pela sonda (recursos lidos, a cena ainda não é desenhada nela) | VR não foi aberto (a sonda escolhe o AR) |
| Celular Motorola Moto G20, Firefox para Android | janela | VR, AR ("sem resposta": o Firefox para Android não tem WebXR) |

## Como pôr para rodar

Precisa do Node.js 20.19 ou mais novo.

```bash
npm install
npm run dev
```

Abra `https://localhost:5173/quebra-cabeca.html`. O certificado é autoassinado (WebXR exige HTTPS): aceite o aviso do navegador.

**Em outro aparelho (celular ou visor), na mesma rede Wi-Fi:** use o endereço **Network** que o `npm run dev` imprime, por exemplo `https://192.168.0.10:5173/quebra-cabeca.html`, e aceite o aviso do certificado no aparelho. Sem HTTPS o navegador esconde a API de WebXR, e a tabela de regimes mostra "sem resposta": o problema é o endereço, não o aparelho.

**Build de produção:**

```bash
npm run build     # checa os tipos e gera build/
npm run preview   # serve o build em HTTPS
```

## Demonstração, em quatro passos

1. Abra a página: a cena mostra a mesa, a moldura com os cinco contornos e as cinco peças soltas em volta.
2. Clique em **Deslizar a moldura**: os contornos vão junto porque são filhos dela; as peças soltas ficam.
3. Escolha uma peça e clique em **Prender ao contorno**: ela não se move, e a tabela "Trocas de pai" mostra a posição no mundo antes e depois. Com a moldura deslizando, a peça agora vai junto. **Soltar na mesa** devolve a peça à mesa, de novo sem movê-la.
4. O painel **Custo do quadro**, em cima da mesa, mostra o custo medido e o teto.

## Como as peças se ligam

A decisão que amarra tudo: **a mesma árvore serve aos três regimes.** Nada na cena é escrito para um regime só, e o que muda entre eles fica em três pontos:

- **De quem o nó `superficie` é filho.** Na janela e no VR, da mesa virtual. No AR, vai passar a ser filho da âncora presa à mesa real, com a mesma troca de pai do `trocarDePai.ts`, e a moldura, os contornos e as peças vão junto sem conta nenhuma.
- **Quem entrega os quadros ao laço.** Na janela é o navegador; numa sessão de VR ou AR, é a sessão. Por isso o laço usa `setAnimationLoop` e anda pelo relógio: o mesmo código serve às duas cadências.
- **O que o aparelho oferece.** A sonda pergunta antes e guarda a resposta em `ultimoResultado`. Nada deve contar com `hit-test`, âncoras ou `local-floor` sem que o aparelho tenha concedido.

No código, cada arquivo cuida de um assunto dos slides, e é o `main.ts` que junta tudo: monta a cena, liga o laço, os botões e a sonda.

## Páginas

- `quebra-cabeca.html` — o quebra-cabeça: a cena, a estrutura da árvore, o domínio, os regimes e a sonda de capacidades.
- `index.html` — cena de teste com cubos manipuláveis em VR e hit-test em AR (base do repositório).

## Estrutura

```
src/
├── main.ts, scene.ts, controllers.ts, ar.ts   # base de teste (index.html)
└── quebracabeca/
    ├── main.ts             # a página: monta a cena, o laço, os botões e a sonda
    ├── dominio.ts          # a tarefa, as peças e as medidas em metros
    ├── cena.ts             # a cena montada como árvore
    ├── trocarDePai.ts      # muda o pai de um objeto sem tirá-lo do lugar
    ├── relogio.ts          # quantos segundos passaram desde o quadro anterior
    ├── medidor.ts          # o custo do quadro e o teto de 13,9 ms
    ├── painel.ts           # o painel do custo, dentro da cena
    ├── regimes.ts          # os três regimes e a pergunta isSessionSupported
    ├── sonda.ts            # a sonda de capacidades dentro da sessão XR
    └── pagina.ts           # o diário e as tabelas que aparecem na página
docs/
├── especificacao.md        # as 14 seções, com o registro de decisões
└── aparelhos-testados.md   # onde abriu, o que não abriu, e os números medidos
```

## Comandos

```bash
npm run dev        # servidor de desenvolvimento (HTTPS, acessível na rede local)
npm run typecheck  # checagem de tipos
npm run build      # checagem de tipos + build de produção
npm run preview    # serve o build
```
