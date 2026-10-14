<script setup>
import config from '@/config'

const p = config.publisher
</script>

<template>
  <section class="mx-auto" style="max-width: 680px">
    <h1 class="page-title mb-3">Privacidade</h1>
    <div class="card">
      <div class="card-body">
        <p class="lead fs-6 fw-semibold">
          <i class="bi bi-shield-check text-success"></i>
          O {{ config.appName }} não coleta, não envia e não armazena seus dados em servidores.
        </p>

        <h2 class="h6 fw-bold mt-4">Onde ficam os dados</h2>
        <p>
          Tudo o que você cadastra (dados da empresa, clientes, catálogo e orçamentos) é salvo apenas no banco de dados
          local do seu navegador, neste aparelho. Os PDFs são gerados no próprio aparelho.
        </p>

        <h2 class="h6 fw-bold mt-4">O que não fazemos</h2>
        <ul>
          <li>Não há cadastro, login ou conta.</li>
          <li>Não usamos cookies de rastreamento, analytics ou anúncios.</li>
          <li>O app não faz chamadas de rede com seus dados. Depois de aberto pela primeira vez, ele funciona offline.</li>
        </ul>

        <h2 class="h6 fw-bold mt-4">Quando algo sai do aparelho</h2>
        <p>
          Somente quando <strong>você</strong> decide: ao compartilhar um PDF, abrir o WhatsApp ou exportar um backup.
          Nesses casos, o conteúdo vai para o aplicativo ou local que você escolher.
        </p>

        <h2 class="h6 fw-bold mt-4">Cuidados</h2>
        <p>
          Se você limpar os dados do navegador, desinstalar o app ou trocar de aparelho, as informações serão perdidas.
          Faça backups regularmente na tela <RouterLink to="/backup">Backup</RouterLink>.
        </p>

        <h2 class="h6 fw-bold mt-4">Responsável</h2>
        <p class="mb-0">
          O {{ config.appName }} é desenvolvido e mantido pela <strong>{{ p.legalName }}</strong>,
          CNPJ {{ p.cnpj }}, {{ p.city.replace(' - ', '/') }}. Dúvidas sobre privacidade:
          <a :href="`https://wa.me/${p.whatsapp}`" target="_blank" rel="noopener">fale conosco pelo WhatsApp</a>.
        </p>
      </div>
    </div>
  </section>
</template>
