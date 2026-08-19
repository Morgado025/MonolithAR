# MonolithAR

Base WebXR (VR + AR) em TypeScript + Vite + Three.js.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra o endereço **Local** que aparece no terminal (HTTPS autoassinado — aceite o aviso do navegador).

## Comandos

```bash
npm run dev        # servidor de desenvolvimento
npm run typecheck  # checagem de tipos
npm run build      # build de produção
npm run preview    # preview do build
```

## Páginas

- `index.html` — cena de teste com cubos manipuláveis em VR e hit-test em AR (base do projeto).
- `quebra-cabeca.html` — domínio, regimes e sonda de capacidades do módulo "Bancada" do Projeto Integrador.

## Estrutura

```
monolith-ar/
├── index.html
├── quebra-cabeca.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.ts                  # renderer, botões VR/AR, loop
    ├── scene.ts                  # cena, câmera, luzes, objetos
    ├── controllers.ts            # controles de VR (raycast, pegar/soltar)
    ├── ar.ts                      # hit-test de AR
    ├── vite-env.d.ts
    └── quebracabeca/
        ├── dominio/               # peças, encaixes e a tarefa do quebra-cabeça
        ├── modes/                 # os três regimes e o confronto com o navegador
        ├── devices/               # sonda de capacidades dentro da sessão XR
        ├── relatorio/             # diário visível e montagem do relatório em HTML
        └── main.ts                # composição da página
```

## Testar no celular / headset

Veja o guia completo de setup (túnel cloudflared, rede local, emulador desktop) no histórico do projeto.
