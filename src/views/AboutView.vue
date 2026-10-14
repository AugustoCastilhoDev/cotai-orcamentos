<script setup>
import config from '@/config'
import { maskPhone } from '@/utils/masks'

const p = config.publisher
const phoneDisplay = maskPhone(p.whatsapp.replace(/^55/, ''))
const waLink = `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(p.whatsappMessage)}`
</script>

<template>
  <section class="mx-auto" style="max-width: 680px">
    <div class="text-center mb-4">
      <img src="/pwa-192.png" alt="" width="72" height="72" class="rounded-4 mb-3 shadow-sm" />
      <h1 class="page-title">Sobre o {{ config.appName }}</h1>
      <p class="text-secondary mb-0">{{ config.slogan }}</p>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <p>
          O {{ config.appName }} nasceu para resolver um problema simples: fazer orçamentos profissionais de forma
          rápida, sem planilhas e sem complicação. Você cadastra seus itens, monta o orçamento e envia em PDF direto
          pelo WhatsApp, tudo pelo celular.
        </p>
        <p class="mb-0">
          O app é gratuito e seus dados ficam salvos apenas no seu aparelho. Nenhuma informação é enviada para
          servidores.
        </p>
      </div>
    </div>

    <div class="card mb-3">
      <div class="card-body">
        <h2 class="h5 fw-bold">Quem está por trás</h2>
        <p>
          O {{ config.appName }} é um produto da <strong>{{ p.name }}</strong>, empresa de {{ p.city.replace(' - ', '/') }}
          especializada em desenvolvimento de software sob medida, consultoria e suporte em tecnologia para pequenos e
          médios negócios.
        </p>
        <p class="mb-0">
          Criamos sistemas de gestão, automações e aplicações personalizadas que resolvem problemas reais do dia a dia
          das empresas.
        </p>
      </div>
    </div>

    <div class="card mb-3 text-center border border-success-subtle">
      <div class="card-body py-4">
        <p class="fw-semibold fs-5 mb-3">Precisa de uma solução sob medida para o seu negócio?</p>
        <a :href="waLink" target="_blank" rel="noopener" class="btn btn-success btn-lg">
          <i class="bi bi-whatsapp"></i> Fale com a gente no WhatsApp
        </a>
        <p class="text-secondary small mt-2 mb-0 tabular">{{ phoneDisplay }}</p>
      </div>
    </div>

    <p class="text-center small text-secondary">
      {{ p.legalName }}<br />
      CNPJ {{ p.cnpj }} · {{ p.city.replace(' - ', '/') }}
    </p>
  </section>
</template>
