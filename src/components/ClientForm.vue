<script setup>
import { reactive } from 'vue'
import MaskedInput from './MaskedInput.vue'
import { validateContact } from '@/utils/validation'

/** Formulário de cliente. Use a ref do componente para chamar validate(). */
const model = defineModel({ type: Object, required: true })
const errors = reactive({})

function validate() {
  const result = validateContact(model.value)
  Object.keys(errors).forEach((k) => delete errors[k])
  Object.assign(errors, result)
  return Object.keys(result).length === 0
}

defineExpose({ validate })
</script>

<template>
  <div class="row g-3">
    <div class="col-12">
      <label class="form-label" for="cli-name">Nome / Razão social *</label>
      <input
        id="cli-name"
        v-model="model.name"
        class="form-control"
        :class="{ 'is-invalid': errors.name }"
        autocomplete="off"
        maxlength="120"
      />
      <div class="invalid-feedback">{{ errors.name }}</div>
    </div>
    <div class="col-sm-6">
      <label class="form-label" for="cli-phone">Telefone / WhatsApp</label>
      <MaskedInput
        id="cli-phone"
        v-model="model.phone"
        mask="phone"
        placeholder="(00) 00000-0000"
        :class="{ 'is-invalid': errors.phone }"
      />
      <div class="invalid-feedback">{{ errors.phone }}</div>
    </div>
    <div class="col-sm-6">
      <label class="form-label" for="cli-email">E-mail</label>
      <input
        id="cli-email"
        v-model.trim="model.email"
        type="email"
        inputmode="email"
        class="form-control"
        :class="{ 'is-invalid': errors.email }"
        autocomplete="off"
      />
      <div class="invalid-feedback">{{ errors.email }}</div>
    </div>
    <div class="col-12">
      <label class="form-label" for="cli-doc">CPF ou CNPJ</label>
      <MaskedInput
        id="cli-doc"
        v-model="model.document"
        mask="document"
        :class="{ 'is-invalid': errors.document }"
      />
      <div class="invalid-feedback">{{ errors.document }}</div>
    </div>
    <div class="col-12">
      <label class="form-label" for="cli-address">Endereço</label>
      <textarea
        id="cli-address"
        v-model="model.address"
        class="form-control"
        rows="2"
        maxlength="300"
        placeholder="Rua, número, bairro, cidade - UF"
      ></textarea>
    </div>
  </div>
</template>
