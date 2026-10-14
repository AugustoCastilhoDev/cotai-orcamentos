<script setup>
import { ref, reactive, computed } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import MaskedInput from '@/components/MaskedInput.vue'
import { useCompanyStore } from '@/stores/company'
import { useUiStore } from '@/stores/ui'
import { validateContact } from '@/utils/validation'
import { resizeImageFile } from '@/utils/image'

const company = useCompanyStore()
const ui = useUiStore()

const form = ref({ ...company.data })
const snapshot = ref(JSON.stringify(form.value))
const errors = reactive({})
const saving = ref(false)
const logoInput = ref(null)

const dirty = computed(() => JSON.stringify(form.value) !== snapshot.value)
const COLORS = ['#0f52ba', '#0b7a9c', '#198754', '#2f3e46', '#6f42c1', '#c2410c', '#b91c1c', '#111827']

onBeforeRouteLeave(async () => {
  if (!dirty.value) return true
  return ui.confirm({
    title: 'Sair sem salvar?',
    message: 'Os dados da empresa foram alterados e ainda não foram salvos.',
    okText: 'Sair sem salvar',
    cancelText: 'Continuar editando',
    danger: true
  })
})

async function onLogo(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  try {
    const { dataUrl } = await resizeImageFile(file, 400)
    form.value.logo = dataUrl
  } catch (err) {
    ui.toast(err.message, 'danger')
  }
}

function validate() {
  const result = validateContact(form.value, { nameLabel: 'Nome da empresa' })
  const days = Number(form.value.validityDays)
  if (!Number.isInteger(days) || days < 1 || days > 365) result.validityDays = 'Informe entre 1 e 365 dias'
  Object.keys(errors).forEach((k) => delete errors[k])
  Object.assign(errors, result)
  return Object.keys(result).length === 0
}

async function save() {
  if (!validate()) {
    ui.toast('Confira os campos destacados.', 'danger')
    return
  }
  saving.value = true
  try {
    await company.save({ ...form.value, name: form.value.name.trim() })
    snapshot.value = JSON.stringify(form.value)
    ui.toast('Dados da empresa salvos.')
  } catch (err) {
    console.error(err)
    ui.toast('Não foi possível salvar.', 'danger')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section>
    <h1 class="page-title">Minha empresa</h1>
    <p class="small text-secondary">Esses dados aparecem no cabeçalho do PDF dos orçamentos.</p>

    <form novalidate @submit.prevent="save">
      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Identificação</div>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label" for="c-name">Nome da empresa ou profissional *</label>
              <input id="c-name" v-model="form.name" class="form-control" :class="{ 'is-invalid': errors.name }" maxlength="120" />
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="c-doc">CNPJ ou CPF</label>
              <MaskedInput id="c-doc" v-model="form.document" mask="document" :class="{ 'is-invalid': errors.document }" />
              <div class="invalid-feedback">{{ errors.document }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="c-phone">Telefone / WhatsApp</label>
              <MaskedInput id="c-phone" v-model="form.phone" mask="phone" placeholder="(00) 00000-0000" :class="{ 'is-invalid': errors.phone }" />
              <div class="invalid-feedback">{{ errors.phone }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="c-email">E-mail</label>
              <input id="c-email" v-model.trim="form.email" type="email" inputmode="email" class="form-control" :class="{ 'is-invalid': errors.email }" />
              <div class="invalid-feedback">{{ errors.email }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label" for="c-address">Endereço</label>
              <input id="c-address" v-model="form.address" class="form-control" maxlength="200" placeholder="Rua, número, bairro, cidade - UF" />
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Aparência do PDF</div>
          <div class="row g-4">
            <div class="col-md-6">
              <label class="form-label d-block">Logo</label>
              <div class="d-flex align-items-center gap-3">
                <img v-if="form.logo" :src="form.logo" alt="Logo da empresa" class="logo-preview border" />
                <div v-else class="logo-preview border d-flex align-items-center justify-content-center text-secondary" style="width: 120px; height: 70px">
                  <i class="bi bi-image fs-3"></i>
                </div>
                <div class="d-flex flex-column gap-2">
                  <button type="button" class="btn btn-outline-primary btn-sm" @click="logoInput.click()">
                    <i class="bi bi-upload"></i> {{ form.logo ? 'Trocar' : 'Enviar logo' }}
                  </button>
                  <button v-if="form.logo" type="button" class="btn btn-outline-danger btn-sm" @click="form.logo = ''">
                    <i class="bi bi-trash"></i> Remover
                  </button>
                </div>
              </div>
              <input ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" class="d-none" @change="onLogo" />
              <div class="form-text">PNG ou JPG. A imagem é reduzida automaticamente.</div>
            </div>
            <div class="col-md-6">
              <label class="form-label d-block" for="c-color">Cor principal</label>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <button
                  v-for="c in COLORS"
                  :key="c"
                  type="button"
                  class="btn p-0 rounded-circle border"
                  :class="{ 'border-3 border-dark': form.color === c }"
                  :style="{ background: c, width: '32px', height: '32px' }"
                  :aria-label="`Cor ${c}`"
                  @click="form.color = c"
                ></button>
                <input id="c-color" v-model="form.color" type="color" class="form-control form-control-color" title="Escolher outra cor" />
              </div>
              <div class="mt-3 rounded overflow-hidden border small">
                <div class="px-2 py-1 fw-bold" :style="{ background: form.color, color: '#fff' }">ORÇAMENTO · prévia da cor</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="section-title">Padrões dos novos orçamentos</div>
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label" for="c-terms">Condições de pagamento</label>
              <textarea id="c-terms" v-model="form.paymentTerms" class="form-control" rows="3" maxlength="1000"></textarea>
            </div>
            <div class="col-6 col-md-3">
              <label class="form-label" for="c-validity">Validade (dias)</label>
              <input id="c-validity" v-model.number="form.validityDays" type="number" min="1" max="365" inputmode="numeric" class="form-control" :class="{ 'is-invalid': errors.validityDays }" />
              <div class="invalid-feedback">{{ errors.validityDays }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="sticky-actions d-flex align-items-center justify-content-end gap-3">
        <span v-if="dirty" class="small text-warning-emphasis">Alterações não salvas</span>
        <button type="submit" class="btn btn-primary px-4" :disabled="saving">
          <i class="bi bi-check2"></i> Salvar
        </button>
      </div>
    </form>
  </section>
</template>
