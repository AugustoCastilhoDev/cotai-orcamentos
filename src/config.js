/**
 * Configuração do Cotaí.
 * Edite este arquivo antes de publicar (veja o README.md).
 */
export default {
  appName: 'Cotaí',
  slug: 'cotai',
  slogan: 'Orçamento pronto em 1 minuto',

  // Empresa responsável pelo app (rodapé, página Sobre e Privacidade)
  publisher: {
    name: 'Castilho Tech Soluções Digitais',
    legalName: 'Castilho Tech Soluções Digitais LTDA',
    cnpj: '68.552.491/0001-17',
    city: 'Leopoldina - MG',
    // Link do nome da empresa no rodapé. Vazio = abre a página "Sobre" do próprio app.
    url: '',
    // WhatsApp de contato (DDI + DDD + número, só dígitos)
    whatsapp: '5532999669302',
    whatsappMessage: 'Olá! Vim pelo Cotaí e gostaria de falar sobre um sistema sob medida.',
    // Instagram (usuário sem @). Deixe '' para não exibir.
    instagram: 'augustocastilho_dev'
  },

  // Apoio ao projeto via Pix (QR Code estático, gerado no próprio aparelho)
  pix: {
    // Chave Pix: e-mail, CPF/CNPJ (só números), telefone no formato +5532999998888
    // ou chave aleatória (EVP). Deixe vazio ('') para esconder o botão "Apoie este projeto".
    key: '+5532999669302',
    // Nome do recebedor (até 25 caracteres; acentos são removidos automaticamente)
    name: 'Augusto Corrêa Castilho',
    // Cidade do recebedor (até 15 caracteres; acentos são removidos automaticamente)
    city: 'LEOPOLDINA',
    // Mensagem opcional que aparece para quem paga (deixe '' para não usar)
    description: 'Apoio Cotai'
  }
}
