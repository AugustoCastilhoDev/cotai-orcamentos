<p align="center">
  <img src="public/pwa-192.png" alt="Cotaí" width="96" height="96" />
</p>

<h1 align="center">Cotaí</h1>
<p align="center"><strong>Orçamento pronto em 1 minuto.</strong></p>

<p align="center">
  Aplicativo web gratuito para pequenos negócios e autônomos (prestadores de serviço, lojas, oficinas e freelancers)
  criarem orçamentos profissionais em PDF e enviarem pelo WhatsApp direto do celular.<br />
  Funciona offline, pode ser instalado na tela inicial e <strong>nenhum dado sai do aparelho</strong>.
</p>

<p align="center">
  <img src="docs/lista.png" alt="Lista de orçamentos" width="230" />
  <img src="docs/orcamento.png" alt="Editor de orçamento" width="230" />
  <img src="docs/pdf.png" alt="PDF gerado" width="300" />
</p>

---

## Funcionalidades

- **Dados da empresa**: nome, CNPJ/CPF, telefone, e-mail, endereço, logo (reduzida automaticamente), cor do PDF,
  condições de pagamento e validade padrão.
- **Clientes**: cadastro simples com busca. Também dá para criar o cliente direto na tela do orçamento.
- **Catálogo**: produtos e serviços com unidade e preço, para montar orçamentos em poucos toques.
- **Orçamentos**:
  - numeração automática por ano (`2026-0001`)
  - itens do catálogo ou avulsos, com quantidade decimal (ex.: `2,5 m²`), unidade, valor unitário e subtotal
  - desconto em R$ ou %, frete/acréscimo e total geral
  - data, validade, prazo de entrega, condições de pagamento e observações
  - status: rascunho, enviado, aprovado e recusado
  - duplicar orçamento
- **Lista** com busca, filtro por status e por período (este mês, mês passado, 30/90 dias, ano ou datas personalizadas).
- **PDF profissional** gerado no navegador: logo, dados da empresa e do cliente, tabela de itens, totais, condições,
  validade e espaço para assinaturas, com valores no formato brasileiro (`R$ 1.234,56`).
- **Compartilhar**: no celular, envia o PDF como arquivo (Web Share API). Como alternativa, há um botão de WhatsApp
  com um resumo em texto e a opção de baixar o PDF.
- **Backup**: exporta e importa todos os dados em JSON.
- **PWA**: instalável e 100% funcional offline.
- **Validações e máscaras**: telefone, CPF, CNPJ (inclusive o **CNPJ alfanumérico**, válido desde julho de 2026) e moeda.
- **Apoie o projeto**: QR Code Pix estático e código copia e cola, gerados localmente (BR Code com CRC16).

## Privacidade

O Cotaí não tem backend. Tudo fica no IndexedDB do navegador do usuário. Não há cadastro, cookies de rastreamento,
analytics nem chamadas de rede em tempo de execução; os únicos links externos (WhatsApp e o link do rodapé) só abrem
quando o usuário toca neles. Por isso, **o backup é responsabilidade do usuário**, e o app avisa isso de forma clara na
tela de Backup.

## Stack

| | |
|---|---|
| Interface | [Vue 3](https://vuejs.org) (Composition API) + [Vite](https://vite.dev) |
| Estilo | [Bootstrap 5](https://getbootstrap.com) (via Sass, sem jQuery e sem o JS do Bootstrap) + Bootstrap Icons |
| Estado | [Pinia](https://pinia.vuejs.org) |
| Dados | IndexedDB com [Dexie](https://dexie.org) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) (carregados sob demanda) |
| QR Code | [qrcode](https://github.com/soldair/node-qrcode) |
| PWA | [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox) |

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
git clone https://github.com/AugustoCastilhoDev/cotai-orcamentos.git
cd cotai-orcamentos
npm install
npm run dev        # servidor de desenvolvimento em http://localhost:5173
```

Para testar a versão de produção (com service worker e modo offline):

```bash
npm run build      # gera a pasta dist/
npm run preview    # serve o build em http://localhost:4173
```

> Para testar no celular na mesma rede Wi-Fi, use `npm run dev -- --host` e acesse o IP do computador.
> A Web Share API e o service worker exigem HTTPS (ou `localhost`), então o compartilhamento de arquivo só funciona
> de verdade depois do deploy.

## Configuração (`src/config.js`)

Todas as informações que mudam de uma instalação para outra ficam em [`src/config.js`](src/config.js):

| Campo | Para que serve |
|---|---|
| `appName`, `slogan` | Nome e slogan exibidos no app e no rodapé do PDF ("Gerado com Cotaí") |
| `publisher.name`, `legalName`, `cnpj`, `city` | Empresa responsável, exibida no rodapé, em **Sobre** e em **Privacidade** |
| `publisher.url` | Link do nome da empresa no rodapé. Se vazio, abre a página **Sobre** |
| `publisher.whatsapp` | Número do botão "Fale com a gente" (DDI + DDD + número, só dígitos, ex.: `5532999998888`) |
| `publisher.whatsappMessage` | Mensagem inicial da conversa no WhatsApp |
| `pix.key` | Chave Pix para o botão "Apoie este projeto". Deixe `''` para esconder o botão |
| `pix.name` | Nome do recebedor (até 25 caracteres; acentos removidos automaticamente) |
| `pix.city` | Cidade do recebedor (até 15 caracteres) |
| `pix.description` | Mensagem opcional mostrada a quem paga |

Formatos de chave Pix aceitos: e-mail, CPF/CNPJ (só números), telefone com `+55` (ex.: `+5532999998888`) ou chave
aleatória. **Depois de alterar a chave, teste o QR Code** pagando R$ 0,01 pelo app do seu banco.

Outros ajustes:

- **Ícones**: troque `public/pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png`, `apple-touch-icon.png` e `favicon.png`.
- **Nome no manifesto do PWA** e cor do tema: em [`vite.config.js`](vite.config.js).
- **Cor principal da interface**: `$primary` em [`src/styles/main.scss`](src/styles/main.scss).

## Deploy no Cloudflare Pages

O app é um site estático. As rotas da SPA (`/clientes`, `/orcamentos/1`...) funcionam ao recarregar a página ou
abrir um link direto sem nenhum arquivo extra: no Pages, um projeto sem `404.html` já é servido em modo SPA, e no
Worker isso é definido no [`wrangler.jsonc`](wrangler.jsonc).

> **Não crie um `public/_redirects` com `/* /index.html 200`.** A Cloudflare considera essa regra um loop infinito e
> o deploy como Worker falha com o erro `Invalid _redirects configuration ... [code: 100324]`.

1. Envie o projeto para um repositório no GitHub.
2. No painel da Cloudflare, abra **Workers & Pages → Create → Pages → Connect to Git**.
3. Autorize o GitHub e selecione o repositório `cotai-orcamentos`.
4. Em **Set up builds and deployments**, preencha:
   - **Framework preset**: `Vue` (ou `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - (opcional) em **Environment variables**, defina `NODE_VERSION` = `22`
5. Clique em **Save and Deploy**. Em cerca de 1 minuto o app estará em `https://<projeto>.pages.dev`.
6. (Opcional) Em **Custom domains**, adicione um domínio próprio.

### Se o projeto foi criado como Worker

A Cloudflare às vezes cria o projeto em **Workers** (com o deploy command `npx wrangler deploy`) em vez de **Pages**.
Isso também funciona: o arquivo [`wrangler.jsonc`](wrangler.jsonc) publica a pasta `dist` como site estático, com
`not_found_handling: "single-page-application"` para as rotas da SPA. Use **Build command** `npm run build` e
**Deploy command** `npx wrangler deploy`. O app fica em `https://cotai-orcamentos.<sua-conta>.workers.dev`.

A partir daí, cada `git push` na branch principal publica uma nova versão automaticamente. O service worker
atualiza o app instalado nos aparelhos na próxima vez que ele for aberto com internet.

## Estrutura do projeto

```
src/
├─ config.js            # configurações (Pix, empresa responsável, nome do app)
├─ main.js, App.vue, router.js
├─ db/                  # banco IndexedDB (Dexie)
├─ stores/              # Pinia: company, clients, catalog, quotes, ui
├─ composables/         # PDF, compartilhamento, backup, ações do orçamento
├─ components/          # modais, campos com máscara, editor de itens, totais, Pix...
├─ views/               # telas: orçamentos, editor, clientes, catálogo, empresa, backup, sobre, privacidade
├─ utils/               # pix (BR Code + CRC16), CPF/CNPJ, máscaras, formatação Intl, cálculos em centavos
└─ styles/main.scss     # tema Bootstrap
```

Os valores monetários são guardados em **centavos (inteiros)** para evitar erros de arredondamento. Cada orçamento
guarda uma cópia dos dados do cliente, então editar o cadastro depois não altera orçamentos já enviados.

---

<p align="center">
  Um produto <strong>Castilho Tech Soluções Digitais</strong> · Leopoldina/MG<br />
  Precisa de um sistema sob medida para o seu negócio?
  <a href="https://wa.me/5532999669302">Fale com a gente no WhatsApp</a>
</p>
