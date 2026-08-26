# Especificação do Projeto — MonolithAR

## Bloco A — A cena

### Seção 1. Identificação do grupo e da cena

**Grupo:** MonolithAR

**Integrantes:**
- Nicolas Valderramas Gomes Vaz
- Bruno Seidedos Pires dos Santos
- Rogério de Morais Bolognesi Neves
- Willian Isami Morita Shigekawa
- Cauã da Silva Reis Morgado

**Cena escolhida:** Quebra-cabeça de encaixe geométrico.

Um robô de brinquedo partido em cinco peças, que a pessoa monta encaixando cada parte no contorno correspondente de uma moldura.

**Por que esta cena:** o encaixe é a parte mais barata de simular e a mais cara de acertar. Definir peça, orientação e ordem certas exige uma regra de tolerância explícita, e essa mesma regra precisa continuar fazendo sentido girando pelos três regimes (mouse, controle de VR, dedo em AR). O grupo topa esse custo porque ele é reaproveitável: a sonda de capacidades que já existe no repositório nasceu resolvendo o mesmo problema de fundo, perguntar ao aparelho o que ele oferece antes de assumir qualquer coisa.

**Armadilha desta cena:** o encaixe geométrico parece fácil de simular (basta comparar duas posições) e por isso tenta o grupo a pular a parte difícil, que é decidir a folga certa e dar retorno diferente para cada tipo de erro. Uma peça que "gruda sozinha" ou que exige precisão de cirurgião são os dois sintomas de que a folga não foi pensada, só copiada de um valor redondo.

### Seção 2. O que a pessoa faz ali

A pessoa chega e vê uma moldura fixa com cinco contornos recortados (cabeça, tronco, braço esquerdo, braço direito, base) e as cinco peças correspondentes espalhadas ao redor dela, fora de qualquer contorno. Ela mira uma peça, que realça, aponta o gesto de apanhar (clique, gatilho ou toque, dependendo do regime) e a peça passa a acompanhar a mão. Ela move e gira a peça até aproximá-la do contorno que julga compatível e solta. Se a peça e a orientação estiverem dentro da folga aceita, ela trava no lugar com um retorno de sucesso; caso contrário, volta suavemente à posição anterior com um retorno que diz o que estava errado. Quando as cinco peças estão travadas, o robô aparece inteiro e reconhecível, e um retorno de conclusão fecha a tarefa.

Respostas às três perguntas da escolha da cena:

- **O que a pessoa faz com as mãos:** apanha, translada e rotaciona cada peça até o encaixe certo. Não existe nenhuma ação de apertar botão de menu no caminho principal.
- **O que muda com o visor:** o alcance físico do braço passa a ser real. Uma peça posicionada a mais de sessenta centímetros do centro da moldura deixa de ser alcançável por apontamento simples, e a pessoa precisa se aproximar fisicamente, coisa que não existe no regime de tela.
- **O que a câmera precisa provar:** que a moldura permanece presa ao mesmo ponto da mesa real enquanto a pessoa caminha ao redor dela, e não desliza junto com o celular.

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

Total: treze objetos únicos na cena, sem contagem que force otimização agressiva de desenho.

### Seção 4. O espaço e as escalas

A moldura mede quarenta por cinquenta centímetros e fica apoiada sobre uma mesa (tampo a cerca de setenta e cinco centímetros do chão). A cabeça tem oito centímetros de diâmetro, o tronco quinze por doze por seis centímetros, cada braço doze por quatro por quatro centímetros, e a base catorze por dez por cinco centímetros.

A cena usa uma única escala, real, nos três regimes. Não há uma versão reduzida para a câmera do celular e outra em tamanho real para o visor: a regra de tolerância de encaixe (Seção 7) é definida em centímetros absolutos, e ter duas escalas obrigaria a converter essa regra a cada regime, multiplicando o que pode dar errado sem ganhar nada em troca. A câmera do celular vê a moldura no tamanho de mesa que ela realmente tem, e o visor mostra a mesma coisa.

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

| Aspecto | Na tela | No visor | Pela câmera |
|---|---|---|---|
| Como se olha | câmera orbital controlada por mouse ou toque, ao redor de um ponto fixo | pose real da cabeça, com seis graus de liberdade quando o aparelho concede `local-floor` | pose real da cabeça, lida pela câmera traseira, com a imagem da câmera como fundo |
| Como se aponta e age | cursor do mouse; apanhar é clicar sobre a peça | raio do controle (ou da mão rastreada); apanhar é acionar o gatilho | toque na tela sobre a peça projetada; um hit-test inicial escolhe onde a moldura se ancora na mesa |
| Escala da cena | escala real, mas vista de fora, sem noção de alcance físico | escala real, e agora o alcance do braço da pessoa passa a limitar de verdade o que ela alcança | escala real, ancorada a uma superfície de mesa real |
| O que a cena faz de diferente | é o único regime que funciona sem sensor além do mouse, e serve de base de testes | é o único em que girar uma peça usa a rotação real do pulso, não um botão | é o único em que a moldura precisa permanecer presa a um ponto do mundo real enquanto a pessoa caminha ao redor |
| O que não existe neste regime | não existe alcance físico: a câmera orbital não tem corpo | não existe imagem do mundo real: a moldura substitui o ambiente inteiro | não existe deslocamento de câmera sem mover o aparelho de verdade |

### Seção 10. Orçamento e desempenho

O inventário soma treze objetos únicos (Seção 3), cada peça com menos de dois mil triângulos e a moldura com menos de três mil. A meta de fluidez é sessenta quadros por segundo estáveis na tela e no regime de câmera; dentro do visor, qualquer queda sustentada abaixo de setenta e dois hertz é tratada como falha e não como lentidão aceitável, porque travamento com o visor no rosto produz mal-estar físico.

As cinco peças e os cinco marcadores de contorno repetem a mesma geometria compartilhada entre instâncias, mudando apenas material e cor: é repetição barata. Não há luz dinâmica por objeto nem sombra em tempo real além de um contato simples projetado no chão da moldura.

**Ordem de degradação**, do primeiro corte ao último: desligar a sombra de contato; trocar peças e moldura pela versão de menor contagem de polígonos já preparada; substituir o brilho de contorno contínuo por um pulso de cor sólida sem animação; e, como último recurso, reduzir a tarefa a três peças (cabeça, tronco, base) com um aviso na tela do regime de tela explicando a simplificação.

### Seção 11. Erros, limites e degradação

1. **O aparelho não suporta o regime pedido:** a página sempre abre no regime de tela, que funciona em qualquer máquina. Os botões de entrar em VR ou iniciar AR só aparecem se a sonda de capacidades já implementada confirmar suporte real via `isSessionSupported`; se não houver suporte, o botão correspondente nem aparece, e uma linha de texto diz qual regime este aparelho oferece.
2. **A permissão de câmera é negada:** a sessão de AR não abre, o sistema volta ao regime de tela automaticamente, e uma mensagem única explica que a permissão de câmera é necessária para este regime, com um botão para tentar de novo.
3. **O rastreamento se perde:** usando o mesmo contador de estabilidade já presente na sonda (`devices/estabilidade.ts`), quando a pose para de chegar por mais de alguns quadros seguidos, a peça que estava sendo segurada congela na última posição válida em vez de seguir uma pose inválida ou desaparecer; o controle volta assim que a pose retorna.
4. **A pessoa sai do espaço útil ou tenta alcançar algo fora do alcance do braço:** como o alcance é físico e real em todos os regimes, uma peça fora de alcance simplesmente não é atingida pelo apontamento. Não é tratado como erro do sistema, é consequência do desenho da cena; por isso o layout inicial mantém as cinco peças dentro de um raio de sessenta centímetros do centro da moldura.

## Bloco D — O trabalho

### Seção 12. Ativos, formatos e licenças

| Arquivo | Origem | Licença | Endereço |
|---|---|---|---|
| Geometria da moldura | construída por código | própria (código do grupo) | `src/quebracabeca/` |
| Peças atuais (formas primitivas) | construídas por código | própria | `src/quebracabeca/` |
| Modelos de robô definitivos | modelo importado, ainda a escolher | prevista licença livre (CC0) | a definir, ver Seção 14 |
| Sons de encaixe, erro e conclusão | a criar ou importar, ainda a escolher | prevista licença livre (CC0) | a definir, ver Seção 14 |

As peças atuais são formas geométricas simples construídas por código, o que já cobre a parte do trabalho que exige construção própria. A parte que ainda falta, modelos e sons prontos importados de terceiros, é uma decisão em aberto declarada na Seção 14, e não um objeto fictício: o grupo não vai publicar como cena própria nenhum ativo de demonstração que já venha pronto com a ferramenta.

### Seção 13. Plano de construção por blocos

| Bloco | O que estará funcionando ao fim dele |
|---|---|
| 1 (já entregue) | Sonda de capacidades operacional: `isSessionSupported` por regime, distinção entre suportado, negado, indeterminado e sem API, relatório visível na própria página. |
| 2 | Domínio do quebra-cabeça modelado (peças, contornos, tarefa) e a moldura com as cinco peças desenhadas nos três regimes, cena estática, sem interação ainda. |
| 3 | As quatro ações da Seção 5 funcionando no regime de tela, com a regra de encaixe e tolerância aplicada; a tarefa é validável (cinco de cinco) sem precisar de VR nem AR. |
| 4 | As mesmas ações portadas para VR (raio de controle, apanhar e soltar pelo gatilho) e para AR (toque na tela, hit-test ancorando a moldura numa mesa real), com o retorno completo da Seção 8 nos três regimes. |
| 5 | Orçamento e ordem de degradação implementados, os quatro casos da Seção 11 tratados, e os ativos provisórios trocados pelos modelos e sons definitivos. |

A regra de sempre ter algo que roda já está satisfeita pelo Bloco 1, que existe e responde no repositório desde antes desta especificação.

### Seção 14. Riscos, decisões em aberto e declarações

**Riscos:**
- A folga de três centímetros e quinze graus é um chute inicial fundamentado apenas em raciocínio, não em teste no aparelho. Mitigação: testar no Bloco 4, assim que houver acesso a um headset ou celular real, e ajustar antes do Bloco 5.
- Os modelos tridimensionais definitivos do robô ainda não foram escolhidos. Mitigação: manter as peças em formas primitivas como alternativa definitiva, e não só provisória, caso nenhum modelo livre caiba no orçamento de polígonos da Seção 10.
- O comportamento real do regime de AR (Bloco 4) depende de um aparelho Android com ARCore que o grupo ainda não testou nesta cena. O que a sonda já confirmou até aqui veio de um navegador headless em servidor, que declara suporte a AR e VR como negado por não ter hardware XR algum.

**Decisões em aberto:**
- Origem final dos modelos tridimensionais (um pacote livre específico, ainda a escolher, ou manter as primitivas atuais).
- Se a ordem de encaixe deve continuar livre ou se, depois de testes com outras pessoas, faz sentido sugerir (sem obrigar) uma ordem inicial para reduzir a confusão de quem nunca viu a cena.

**Declaração de uso de ferramentas de inteligência artificial:**

Este documento foi redigido por Cauã com apoio de um assistente de IA (Claude), a partir do domínio já implementado e testado no repositório (`src/quebracabeca/dominio/dominio.ts`) e da estrutura de regimes e sonda de capacidades já existente no projeto. As decisões numéricas desta especificação (folgas de encaixe, medidas em centímetros, orçamento de objetos, ordem de degradação) são sugestões de ponto de partida propostas pela IA a partir de valores usuais em projetos WebXR semelhantes; nenhuma delas foi testada num headset ou celular físico até o momento desta entrega, o que está declarado explicitamente onde relevante ao longo do documento, em vez de apresentado como medição real.

A distinção entre suporte suportado, negado e indeterminado, citada em várias seções, já foi executada de verdade contra um navegador Chrome headless durante o desenvolvimento do projeto, confirmando que a lógica da sonda funciona; ainda não foi executada contra hardware de VR ou AR real.
