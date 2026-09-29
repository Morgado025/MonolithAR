# Especificação do Projeto — MonolithAR

## Bloco A — A cena

### Seção 1. Identificação do grupo e da cena

**Grupo:** MonolithAR

**Integrantes:**
- Nicolas Valderramas
- Bruno Seidedos
- Rogério de Morais
- Willian Isami
- Cauã Morgado

**Cena escolhida:** Quebra-cabeça de encaixe geométrico.

Um robô de brinquedo partido em cinco peças, que a pessoa monta encaixando cada parte no contorno correspondente de uma moldura.

É uma variação da proposta de mesmo nome do Projeto Integrador: lá, seis a doze peças entalhadas se atravessam até formar um cubo; aqui, cinco peças formam a silhueta de um robô deitada numa moldura. Por ser variação, a Seção 2 responde às quatro perguntas de cena fora da lista.

**Por que esta cena:** o encaixe é a parte mais barata de simular e a mais cara de acertar. Definir peça, orientação e ordem certas exige uma regra de tolerância explícita, e essa mesma regra precisa continuar fazendo sentido girando pelos três regimes (mouse, controle de VR, dedo em AR). O grupo topa esse custo porque ele é reaproveitável: a sonda de capacidades que já existe no repositório nasceu resolvendo o mesmo problema de fundo, perguntar ao aparelho o que ele oferece antes de assumir qualquer coisa.

**Armadilha desta cena:** o encaixe geométrico parece fácil de simular (basta comparar duas posições) e por isso tenta o grupo a pular a parte difícil, que é decidir a folga certa e dar retorno diferente para cada tipo de erro. Uma peça que "gruda sozinha" ou que exige precisão de cirurgião são os dois sintomas de que a folga não foi pensada, só copiada de um valor redondo.

### Seção 2. O que a pessoa faz ali

A pessoa chega e vê uma moldura fixa com cinco contornos recortados (cabeça, tronco, braço esquerdo, braço direito, base) e as cinco peças correspondentes espalhadas ao redor dela, fora de qualquer contorno. Ela mira uma peça, que realça, aponta o gesto de apanhar (clique, gatilho ou toque, dependendo do regime) e a peça passa a acompanhar a mão. Ela move e gira a peça até aproximá-la do contorno que julga compatível e solta. Se a peça e a orientação estiverem dentro da folga aceita, ela trava no lugar com um retorno de sucesso; caso contrário, volta suavemente à posição anterior com um retorno que diz o que estava errado. Quando as cinco peças estão travadas, o robô aparece inteiro e reconhecível, e um retorno de conclusão fecha a tarefa.

Respostas às quatro perguntas de cena fora da lista:

- **O que a pessoa faz com as mãos:** apanha, translada e rotaciona cada peça até o encaixe certo. Não existe nenhuma ação de apertar botão de menu no caminho principal.
- **O que muda com o visor:** o alcance físico do braço passa a ser real. Uma peça posicionada a mais de sessenta centímetros do centro da moldura deixa de ser alcançável por apontamento simples, e a pessoa precisa se aproximar fisicamente, coisa que não existe no regime de tela.
- **O que precisa provar contra uma mesa de verdade:** que a moldura permanece presa ao mesmo ponto da mesa real enquanto a pessoa caminha ao redor dela, e não desliza junto com o celular.
- **Que número produz que pode sair diferente do esperado, e contra qual alternativa:** a taxa de encaixes aceitos na primeira soltura e o número de tentativas por peça, com a folga da Seção 7, medidos com mouse, controle e toque. A alternativa é o encaixe com alinhamento automático (a peça salta para o contorno ao chegar perto); se o toque precisar de folga maior que o controle, a premissa de uma única lógica de encaixe para os três regimes cai.

### Seção 3. Inventário de objetos

| Objeto | Quantos | Origem | Move? | Observação |
|---|---|---|---|---|
| Moldura | 1 | construída por código | não | contém os cinco contornos recortados, apoio fixo da cena |
| Peça: cabeça | 1 | construída por código, a substituir por modelo importado (ver Seção 12) | sim, apanhada pela pessoa | encaixe único |
| Peça: tronco | 1 | construída por código, a substituir por modelo importado | sim | encaixe único |
| Peça: braço esquerdo | 1 | construída por código, a substituir por modelo importado | sim | encaixe único |
| Peça: braço direito | 1 | construída por código, a substituir por modelo importado | sim | espelhado em relação ao esquerdo |
| Peça: base | 1 | construída por código, a substituir por modelo importado | sim | encaixe único, sustenta a silhueta em pé |
| Marcador de contorno | 5 | construído por código | não | realça o contorno quando uma peça se aproxima dele |
| Retículo de apontamento | até 2 (um por controle em VR) | construído por código | segue o controle | não existe no regime de tela, que usa cursor de mouse |
| Mesa (tampo e quatro pernas) | 1 | construída por código | não | entrou no Módulo 03 (Seção 14); só existe na janela e no visor — pela câmera, a mesa real faz esse papel |
| Painel do custo do quadro | 1 | construído por código, texto desenhado numa textura | não | entrou no Módulo 03 (Seção 14); preso à mesa, virado para quem monta |

Total: treze objetos previstos no Módulo 01, mais a mesa e o painel desde o Módulo 03. No regime em janela, sem os retículos, a cena desenha 17 malhas (moldura, 5 contornos, 5 peças, tampo, 4 pernas e painel): 17 chamadas de desenho e 426 triângulos por quadro, medidos (Seção 10).

### Seção 4. O espaço e as escalas

A moldura mede quarenta por cinquenta centímetros e fica apoiada sobre uma mesa (tampo a cerca de setenta e cinco centímetros do chão). A cabeça tem oito centímetros de diâmetro, o tronco quinze por doze por seis centímetros, cada braço doze por quatro por quatro centímetros, e a base catorze por dez por cinco centímetros.

A cena usa uma única escala, real, nos três regimes. Não há uma versão reduzida para a câmera do celular e outra em tamanho real para o visor: a regra de tolerância de encaixe (Seção 7) é definida em centímetros absolutos, e ter duas escalas obrigaria a converter essa regra a cada regime, multiplicando o que pode dar errado sem ganhar nada em troca. A câmera do celular vê a moldura no tamanho de mesa que ela realmente tem, e o visor mostra a mesma coisa.

**As medidas em metros**, como estão em `src/quebracabeca/dominio.ts` (uma unidade da cena é um metro). Largura é da esquerda para a direita de quem monta, profundidade vai da cabeça do robô até a base, e altura é o quanto a peça sobe acima da superfície onde está deitada.

| Objeto | Largura × profundidade × altura (m) | Observação |
|---|---|---|
| Tampo da mesa | 1,20 × 0,80 × 0,03 | face de cima a 0,75 do chão |
| Moldura | 0,40 × 0,50 × 0,02 | espessura fixada no Módulo 03 |
| Contorno | o mesmo contorno da peça × 0,003 | lâmina escura sobre a moldura |
| Cabeça | cilindro de 0,08 de diâmetro × 0,05 | espessura fixada no Módulo 03 |
| Tronco | 0,15 × 0,12 × 0,06 | |
| Braço (cada) | 0,04 × 0,12 × 0,04 | |
| Base | 0,14 × 0,10 × 0,05 | |
| Painel do custo | 0,56 × 0,30 | em pé no fundo da mesa, inclinado 20° para trás |

**A cena como árvore.** Cada objeto guarda a posição em relação ao pai, e não ao mundo; quando o pai se mexe, os filhos vão junto sem conta nenhuma. A árvore é montada em `src/quebracabeca/cena.ts` e aparece impressa, com recuo, na própria página.

```
sala
  mesa                      no chão
    tampo, 4 pernas         nunca saem da mesa
    superficie              nó vazio na face de cima do tampo (0,75 m)
      moldura
        5 contornos         recortes da moldura
      5 peças               soltas, fora da moldura
      painel                custo do quadro
```

Por que cada um é filho de quem:

- **Contorno → moldura.** O contorno é um recorte da moldura. Se a moldura anda, os cinco contornos andam junto, e uma peça já encaixada (que vai ser filha do contorno) também. Durante a tarefa a moldura fica parada (Seção 3); o botão "Deslizar a moldura" existe só para mostrar a hierarquia funcionando, porque parada ela não prova nada.
- **Moldura, peças e painel → superficie.** Tudo o que está apoiado na mesa fica pendurado num nó vazio na face de cima do tampo. No AR a mesa virtual não aparece; basta pendurar esse nó na âncora da mesa de verdade, e nada abaixo dele muda.
- **As peças começam na superficie, e não no contorno.** Montar o robô vai ser justamente passar cada peça da mesa para a mão e da mão para o contorno.
- **Painel → superficie, e não moldura.** O painel é um instrumento da mesa, não uma peça do quebra-cabeça, e não deve deslizar junto com a moldura.

## Bloco B — As regras

### Seção 5. As ações do usuário

| Ação | O que a pessoa faz | O que o sistema faz | Se não puder |
|---|---|---|---|
| Apontar | mira uma peça ou marcador | o objeto mirado realça (contorno emissivo) | nada acontece, sem realce |
| Apanhar | aciona sobre o objeto mirado (clique, gatilho ou toque) | a peça passa a acompanhar a mão ou o cursor | avisa que não há peça sob a mira |
| Mover e orientar | desloca e gira a peça segurada | a peça acompanha posição e rotação em tempo real | sempre permitido enquanto a peça está na mão |
| Soltar | solta a peça segurada | se a posição e o ângulo estiverem dentro da folga do encaixe compatível, a peça trava; caso contrário, ela retorna suavemente à posição anterior | recusa e diz o motivo (peça errada para este contorno, ou peça certa fora da folga de ângulo) |

### Seção 6. A tarefa e sua validação

**Estado inicial:** as cinco peças em posições fixas de partida ao redor da moldura, nenhum dos cinco contornos preenchido.

**Estado final (sucesso):** os cinco contornos preenchidos, cada um com a peça compatível declarada em `dominio.ts`, dentro da folga de posição e ângulo definida na Seção 7.

**Ordem:** livre. Qualquer contorno pode ser preenchido em qualquer momento; o que conta é o conjunto final, não a sequência. Essa escolha segue o próprio domínio real: montar um robô de encaixe não exige montar a cabeça antes do braço.

**Validação:** o sistema mantém uma contagem de contornos preenchidos corretamente e declara sucesso quando essa contagem chega a cinco.

### Seção 7. Regras de encaixe e tolerâncias

Para os cinco encaixes, valem os mesmos dois números como ponto de partida:

- **Folga de posição:** três centímetros. A peça é aceita se o centro dela estiver a até três centímetros do centro do contorno.
- **Folga de ângulo:** quinze graus. A peça é aceita se a rotação dela em relação ao contorno estiver dentro de quinze graus do alinhamento correto.

Um valor uniforme para as cinco peças é uma simplificação deliberada para a primeira versão testável, não uma decisão final. O raciocínio: folgas acima de cinco centímetros deixam a peça saltar para o lugar sem que a pessoa perceba ter feito pontaria; folgas abaixo de um centímetro cobram uma precisão de mão que o jitter normal de um controle de VR já inviabiliza sozinho. Três centímetros e quinze graus ficam no meio desse intervalo e são o que o grupo vai testar primeiro; o valor final depende do teste no aparelho, como a própria tarefa prevê para números provisórios.

### Seção 8. Retorno ao usuário

| Situação | Forma do retorno |
|---|---|
| Peça ou marcador mirado | contorno emissivo acende |
| Peça apanhada | leve aumento de escala e do brilho, para diferenciar de estar só mirada |
| Encaixe aceito | a peça trava, o contorno do encaixe pisca em verde por um instante, e soa um clique curto |
| Encaixe recusado (peça errada para o contorno) | a peça retorna à posição anterior, o contorno pisca em vermelho, soa um tom curto e grave |
| Encaixe recusado (peça certa, ângulo fora da folga) | o contorno pisca em amarelo em vez de vermelho, distinguindo esse caso do anterior |
| Tarefa concluída (cinco de cinco) | todas as peças brilham por um segundo e soa um tom de conclusão |

Nenhuma dessas formas depende de texto flutuante. Dentro de um visor, cor, brilho e som chegam mais rápido que qualquer letra pequena.

## Bloco C — A máquina

### Seção 9. Os três regimes

**A declaração**, como está em `src/quebracabeca/regimes.ts`, sem reescrita:

| Regime | O que faz com o mundo | Espaço de referência | O que se rastreia | Contra o que se registra | Composição esperada | Papel |
|---|---|---|---|---|---|---|
| Quebra-cabeça em janela (`inline`) | exibe | `viewer` | nada do corpo; a câmera obedece ao mouse ou ao toque | o ponto zero que nós mesmos escolhemos para a cena: o chão, embaixo do centro da mesa | `opaque` | é o caso base e o destino de quem não tem headset — o quebra-cabeça inteiro precisa ser montável só nesta janela |
| Quebra-cabeça em realidade virtual (`immersive-vr`) | substitui | `local-floor` | a pose da cabeça e das duas mãos, com seis graus de liberdade | o chão do espaço físico onde a pessoa está, o que faz a moldura nascer numa altura de mesa fixa em vez de flutuar | `opaque` | é onde escala corporal e alcance de braço passam a existir de verdade |
| Quebra-cabeça em realidade aumentada (`immersive-ar`) | preserva | `local-floor` | a pose da cabeça, das mãos e as superfícies que o aparelho encontra no ambiente | uma superfície real escolhida (a mesa da sala), à qual a moldura permanece presa enquanto a pessoa caminha ao redor | `alpha-blend` | é o único regime em que errar o registro é visível a olho nu — a moldura desliza sobre a mesa real |

**O que já foi provado e o que ainda é promessa** (fim do Módulo 03):

- **Janela:** provado. A cena abre com os objetos da Seção 3 em escala real, a câmera gira em volta da moldura, e o registro é contra o ponto zero da própria cena (o chão, embaixo do centro da mesa).
- **Visor:** a sonda pergunta se o aparelho entra no regime e o que a sessão concede, mas a cena ainda não é desenhada dentro da sessão. Falta provar que a moldura nasce a 0,75 m do chão real com `local-floor`.
- **Câmera:** mesma situação. O nó `superficie` já existe para pender da âncora, mas o registro contra a mesa real, e a moldura presa a ela enquanto a pessoa anda, ainda são promessa.

**Os regimes lado a lado:**

| Aspecto | Na tela | No visor | Pela câmera |
|---|---|---|---|
| Como se olha | câmera orbital controlada por mouse ou toque, ao redor de um ponto fixo | pose real da cabeça, com seis graus de liberdade quando o aparelho concede `local-floor` | pose real da cabeça, lida pela câmera traseira, com a imagem da câmera como fundo |
| Como se aponta e age | cursor do mouse; apanhar é clicar sobre a peça | raio do controle (ou da mão rastreada); apanhar é acionar o gatilho | toque na tela sobre a peça projetada; um hit-test inicial escolhe onde a moldura se ancora na mesa |
| Escala da cena | escala real, mas vista de fora, sem noção de alcance físico | escala real, e agora o alcance do braço da pessoa passa a limitar de verdade o que ela alcança | escala real, ancorada a uma superfície de mesa real |
| O que a cena faz de diferente | é o único regime que funciona sem sensor além do mouse, e serve de base de testes | é o único em que girar uma peça usa a rotação real do pulso, não um botão | é o único em que a moldura precisa permanecer presa a um ponto do mundo real enquanto a pessoa caminha ao redor |
| O que não existe neste regime | não existe alcance físico: a câmera orbital não tem corpo | não existe imagem do mundo real: a moldura substitui o ambiente inteiro | não existe deslocamento de câmera sem mover o aparelho de verdade |

### Seção 10. Orçamento e desempenho

O inventário soma treze objetos únicos (Seção 3; quinze desde o Módulo 03, com a mesa e o painel), cada peça com menos de dois mil triângulos e a moldura com menos de três mil. A meta de fluidez é sessenta quadros por segundo estáveis na tela e no regime de câmera; dentro do visor, qualquer queda sustentada abaixo de setenta e dois hertz é tratada como falha e não como lentidão aceitável, porque travamento com o visor no rosto produz mal-estar físico.

~~As cinco peças e os cinco marcadores de contorno repetem a mesma geometria compartilhada entre instâncias, mudando apenas material e cor: é repetição barata.~~ Corrigido no Módulo 03: as cinco formas são diferentes entre si, e cada peça e cada contorno tem a sua própria geometria. São 17 malhas, 17 chamadas de desenho por quadro. Não há luz dinâmica por objeto nem sombra em tempo real além de um contato simples projetado no chão da moldura (a sombra de contato ainda não existe).

**O teto do quadro: 13,9 ms** (`src/quebracabeca/medidor.ts`). É o tempo entre duas imagens num visor a 72 Hz, a menor frequência que esta seção aceita. Usamos um teto só, o mais apertado: se a cena cabe em 13,9 ms, cabe também na tela a 60 Hz (16,7 ms).

O que é comparado com o teto é o **custo**: o tempo que o nosso código gasta em cada quadro (andar a cena e pedir o desenho). É uma condição necessária, não suficiente, porque o trabalho da placa de vídeo fica fora dessa conta. O painel dentro da cena mostra, a cada segundo, a média e o pior custo daquele segundo, quantos quadros passaram do teto, quantos quadros por segundo saíram, e as chamadas de desenho e triângulos. A leitura recomeça do zero a cada segundo: numa média desde que a página abriu, um travamento de um segundo sumiria.

**Decisões medidas** (notebook Acer Nitro ANV15-51, detalhes em `docs/aparelhos-testados.md`):

- A textura do painel tem 560 × 300 pixels. Na primeira versão, com 1120 × 600, cada atualização travava um quadro por 20 a 40 ms: 19 quadros acima de 13,9 ms em 20 s. Com 560 × 300, nenhum.
- O painel é redesenhado uma vez por segundo, e não a cada quadro. Mandar a textura para a placa é caro, e um número que muda 60 vezes por segundo nem dá para ler.
- O primeiro quadro custa 55 a 70 ms (compilação dos shaders e envio da geometria para a placa). Pré-compilar com `renderer.compile()` tirou só uns 25 ms e não compensou; esse pico aparece só na primeira leitura do painel.

**O maior passo do relógio: 0,15 s** (`src/quebracabeca/relogio.ts`). Se a aba ficar escondida (ou a máquina suspender, ou o menu do visor abrir) e voltar segundos depois, a cena anda no máximo 0,15 s de uma vez em vez de dar um pulo. O valor vem da Seção 7: a moldura desliza a no máximo 16 cm/s, e 0,15 s disso dá 2,4 cm, menos que a folga de 3 cm do encaixe.

**Ordem de degradação**, do primeiro corte ao último: desligar a sombra de contato; trocar peças e moldura pela versão de menor contagem de polígonos já preparada; substituir o brilho de contorno contínuo por um pulso de cor sólida sem animação; e, como último recurso, reduzir a tarefa a três peças (cabeça, tronco, base) com um aviso na tela do regime de tela explicando a simplificação.

### Seção 11. Erros, limites e degradação

1. **O aparelho não suporta o regime pedido:** a página sempre abre no regime de tela, que funciona em qualquer máquina. Os botões de entrar em VR ou iniciar AR só aparecem se a sonda de capacidades já implementada confirmar suporte real via `isSessionSupported`; se não houver suporte, o botão correspondente nem aparece, e uma linha de texto diz qual regime este aparelho oferece.
2. **A permissão de câmera é negada:** a sessão de AR não abre, o sistema volta ao regime de tela automaticamente, e uma mensagem única explica que a permissão de câmera é necessária para este regime, com um botão para tentar de novo.
3. **O rastreamento se perde:** quando a pose para de chegar por mais de alguns quadros seguidos, a peça que estava sendo segurada congela na última posição válida em vez de seguir uma pose inválida ou desaparecer; o controle volta assim que a pose retorna.
4. **A pessoa sai do espaço útil ou tenta alcançar algo fora do alcance do braço:** como o alcance é físico e real em todos os regimes, uma peça fora de alcance simplesmente não é atingida pelo apontamento. Não é tratado como erro do sistema, é consequência do desenho da cena; por isso o layout inicial mantém as cinco peças dentro de um raio de sessenta centímetros do centro da moldura.
5. **O laço fica parado e volta (aba em segundo plano, máquina suspensa, menu do sistema do visor):** o primeiro quadro de volta pode chegar segundos depois do anterior. O relógio avança a cena no máximo 0,15 s (Seção 10) e ignora o resto, então nada pula na cena.

## Bloco D — O trabalho

### Seção 12. Ativos, formatos e licenças

| Arquivo | Origem | Licença | Endereço |
|---|---|---|---|
| Geometria da moldura, dos contornos e da mesa | construída por código | própria (código do grupo) | `src/quebracabeca/cena.ts`, medidas em `src/quebracabeca/dominio.ts` |
| Peças atuais (formas primitivas) | construídas por código | própria | `src/quebracabeca/cena.ts` |
| Painel do custo do quadro (texto numa textura) | desenhado por código | própria | `src/quebracabeca/painel.ts` |
| Modelos de robô definitivos | modelo importado, ainda a escolher | prevista licença livre (CC0) | a definir, ver Seção 14 |
| Sons de encaixe, erro e conclusão | a criar ou importar, ainda a escolher | prevista licença livre (CC0) | a definir, ver Seção 14 |

As peças atuais são formas geométricas simples construídas por código, o que já cobre a parte do trabalho que exige construção própria. A parte que ainda falta, modelos e sons prontos importados de terceiros, é uma decisão em aberto declarada na Seção 14, e não um objeto fictício: o grupo não vai publicar como cena própria nenhum ativo de demonstração que já venha pronto com a ferramenta.

### Seção 13. Plano de construção por blocos

| Bloco | O que estará funcionando ao fim dele |
|---|---|
| 1 (entregue no Módulo 02) | Sonda de capacidades operacional: `isSessionSupported` por regime, distinção entre suportado, negado, indeterminado e sem API, relatório visível na própria página. |
| 2 (entregue no Módulo 03, só no regime em janela) | Domínio do quebra-cabeça modelado (peças, contornos, tarefa); a cena montada como árvore, em geometria crua e escala real; a troca de pai que preserva a posição no mundo; o laço contra o relógio e o painel do custo do quadro dentro da cena. Desenhar a cena dentro das sessões de VR e AR passou para o bloco 4 (Seção 14). |
| 3 | As quatro ações da Seção 5 funcionando no regime de tela, com a regra de encaixe e tolerância aplicada; a tarefa é validável (cinco de cinco) sem precisar de VR nem AR. |
| 4 | A cena desenhada dentro das sessões de VR e AR, e as mesmas ações portadas para VR (raio de controle, apanhar e soltar pelo gatilho) e para AR (toque na tela, hit-test ancorando a moldura numa mesa real), com o retorno completo da Seção 8 nos três regimes. |
| 5 | Ordem de degradação implementada (o teto do quadro já existe desde o Bloco 2), os casos da Seção 11 tratados, e os ativos provisórios trocados pelos modelos e sons definitivos. |

A regra de sempre ter algo que roda está satisfeita desde o Bloco 1, e a partir do Bloco 2 o que roda é a própria cena: a página `quebra-cabeca.html` abre no regime em janela, em qualquer máquina, sem equipamento.

### Seção 14. Riscos, decisões em aberto e declarações

**Riscos:**
- A folga de três centímetros e quinze graus é um chute inicial fundamentado apenas em raciocínio, não em teste no aparelho. Mitigação: testar no Bloco 4, assim que houver acesso a um headset ou celular real, e ajustar antes do Bloco 5.
- Os modelos tridimensionais definitivos do robô ainda não foram escolhidos. Mitigação: manter as peças em formas primitivas como alternativa definitiva, e não só provisória, caso nenhum modelo livre caiba no orçamento de polígonos da Seção 10.
- O comportamento real do regime de AR (Bloco 4) ainda não foi visto, porque a cena ainda não é desenhada dentro da sessão. O que já se sabe: no celular Moto G20 com Chrome, a sonda abriu uma sessão `immersive-ar` e o aparelho concedeu `local-floor`, `hit-test`, `anchors` e `plane-detection`, com seis graus de liberdade e composição `alpha-blend`, igual à declarada; só o `hand-tracking` veio negado. O mesmo celular no Firefox responde "sem resposta" (não tem WebXR), e o notebook Windows, "não suportado" para VR e AR (`docs/aparelhos-testados.md`). O VR ainda não foi aberto em sessão: falta testar num visor.

**Decisões em aberto:**
- Origem final dos modelos tridimensionais (um pacote livre específico, ainda a escolher, ou manter as primitivas atuais).
- Se a ordem de encaixe deve continuar livre ou se, depois de testes com outras pessoas, faz sentido sugerir (sem obrigar) uma ordem inicial para reduzir a confusão de quem nunca viu a cena.
- A cabeça, um cilindro, é simétrica em torno do eixo vertical: girá-la sobre a moldura não muda nada, e a folga de 15° da Seção 7 só pode valer para a inclinação dela. O que quebra essa simetria (a antena, os olhos) chega com a modelagem; até lá, a regra angular da cabeça confere só inclinação. Percebido ao montar a cena no Módulo 03.

**Registro de decisões que mudaram desde o Módulo 01:**

| Módulo | Como estava | Como ficou | Por quê |
|---|---|---|---|
| 03 | A Seção 4 dizia que a moldura fica "apoiada sobre uma mesa", mas o inventário não tinha mesa | Mesa virtual (tampo e quatro pernas) no inventário, só na janela e no visor | Sem ela a moldura flutua a 0,75 m nos dois regimes que não mostram o mundo real. Pela câmera ela não é desenhada: a mesa real faz o papel, e o nó `superficie` passa a pender da âncora. |
| 03 | Nenhum painel na cena | Painel do custo do quadro, preso à superfície da mesa | O custo precisa ser legível de dentro da cena; no visor não existe canto de tela. |
| 03 | A Seção 4 não fixava a espessura da moldura nem a da cabeça | Moldura de 2 cm; cabeça cilíndrica de 8 cm de diâmetro por 5 cm | A árvore não se monta sem as três dimensões de cada objeto. |
| 03 | A Seção 10 dizia que peças e contornos repetem a mesma geometria | Cada malha tem a sua geometria | As cinco formas são diferentes; percebido ao montar. Os dois braços poderiam dividir uma, mas a economia é desprezível e complicava o código. |
| 03 | A declaração da janela dizia que ela registra contra "a origem arbitrária da própria cena, fixada por quem a modelou" | "o ponto zero que nós mesmos escolhemos para a cena: o chão, embaixo do centro da mesa" | Mesmo sentido, mais concreto, e com as nossas palavras: a frase antiga repetia a do projeto de referência. |
| 03 | Com "sem resposta" em página segura, a página não explicava o motivo, e o alerta da sonda culpava o aparelho | A página e o alerta dizem que o navegador não tem WebXR e sugerem o Chrome ou o navegador do Quest | Achado do teste no Moto G20 com Firefox para Android: a página estava em HTTPS, mas o navegador não tem WebXR. O limite era do navegador, não do aparelho. |
| 03 | Quando a sessão era recusada com `NotSupportedError`, a página dizia "ele não suporta este modo" | A página diz que o aparelho recusou a sessão e sugere tentar de novo e aceitar a permissão | Achado do teste no Moto G20 com Chrome: a primeira tentativa foi recusada com esse erro e a segunda abriu. O Chrome usa o mesmo erro por vários motivos, então "não suporta" afirmava demais. |
| 03 | A sonda também contava quadros sem pose (estabilidade) e classificava o aparelho num tipo; o código estava em 24 arquivos | A sonda responde só o que o Módulo 02 pede (sessões, recursos, espaços e graus, controles); o código ficou em 10 arquivos | Todos do grupo precisam conseguir explicar qualquer arquivo. A contagem de quadros sem pose volta quando existir peça segurada (Seção 11, caso 3). |
| 03 | O Bloco 2 desenharia a cena nos três regimes | O Bloco 2 desenha só na janela; VR e AR passam ao Bloco 4 | Desenhar dentro da sessão exige o laço entregue pela sessão e o registro contra o chão e contra a mesa, que são módulos adiante. O Módulo 03 cobra a estrutura, e ela é a mesma nos três regimes. |
| 03 | O código do relatório previa levar o relatório da sonda para dentro da cena quando ela existisse | O relatório da sonda continua em HTML; só o custo do quadro foi para a cena | O relatório é lido antes de entrar em sessão, para escolher o regime; o custo é lido durante. |
| 03 | A Seção 2 respondia a três perguntas | Responde às quatro | A cena é variação da proposta da lista (cinco peças numa moldura, e não seis a doze formando um cubo), e cena fora da lista responde às quatro. |

**Declaração de uso de ferramentas de inteligência artificial:**

Este documento foi redigido por Cauã com apoio de um assistente de IA (Claude), a partir do domínio já implementado e testado no repositório (`src/quebracabeca/dominio.ts`) e da estrutura de regimes e sonda de capacidades já existente no projeto. As decisões numéricas desta especificação (folgas de encaixe, medidas em centímetros, orçamento de objetos, ordem de degradação) são sugestões de ponto de partida propostas pela IA a partir de valores usuais em projetos WebXR semelhantes; nenhuma delas foi testada num headset ou celular físico até o momento desta entrega, o que está declarado explicitamente onde relevante ao longo do documento, em vez de apresentado como medição real.

A distinção entre suporte suportado, negado e indeterminado, citada em várias seções, foi executada primeiro contra um navegador Chrome headless durante o desenvolvimento e, no Módulo 03, contra hardware de AR real: um celular Moto G20 com Chrome, em que a sonda abriu a sessão e leu recursos concedidos e negados. Ainda não foi executada contra um visor de VR.
