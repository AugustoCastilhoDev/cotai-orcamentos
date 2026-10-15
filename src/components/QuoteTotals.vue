<script setup>
import { computed } from 'vue'
import MoneyInput from './MoneyInput.vue'
import DecimalInput from './DecimalInput.vue'
import { calcTotals } from '@/utils/money'
import { formatMoney } from '@/utils/format'

/** Desconto, frete/acréscimo e totais. Edita o próprio objeto do orçamento. */
const quote = defineModel({ type: Object, required: true })
const totals = computed(() => calcTotals(quote.value))

function setDiscountType(type) {
  if (quote.value.discountType === type) return
  quote.value.discountType = type
  quote.value.discountValue = 0
}
</script>

<template>
  <div class="row g-3">
    <div class="col-md-6">
      <label class="form-label">Desconto</label>
      <div class="input-group">
        <button
          type="button"
          class="btn"
          :class="quote.discountType === 'value' ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setDiscountType('value')"
        >
          R$
        </button>
        <button
          type="button"
          class="btn"
          :class="quote.discountType === 'percent' ? 'btn-primary' : 'btn-outline-secondary'"
          @click="setDiscountType('percent')"
        >
          %
        </button>
        <MoneyInput v-if="quote.discountType === 'value'" v-model="quote.discountValue" prefix="" aria-label="Desconto em reais" />
        <DecimalInput v-else v-model="quote.discountValue" :max="100" class="text-end" aria-label="Desconto em porcentagem" />
      </div>
    </div>
    <div class="col-md-6">
      <label class="form-label">Frete / acréscimo</label>
      <div class="input-group">
        <input v-model="quote.extraLabel" class="form-control" style="max-width: 45%" maxlength="30" aria-label="Descrição do acréscimo" placeholder="Frete" />
        <MoneyInput v-model="quote.extra" prefix="" aria-label="Valor do acréscimo" />
      </div>
    </div>

    <div class="col-12">
      <table class="w-100 totals-table tabular">
        <tbody>
          <tr>
            <td class="text-secondary">Subtotal</td>
            <td class="text-end">{{ formatMoney(totals.subtotal) }}</td>
          </tr>
          <tr v-if="totals.discount">
            <td class="text-secondary">Desconto</td>
            <td class="text-end text-danger">- {{ formatMoney(totals.discount) }}</td>
          </tr>
          <tr v-if="totals.extra">
            <td class="text-secondary">{{ quote.extraLabel || 'Acréscimo' }}</td>
            <td class="text-end">+ {{ formatMoney(totals.extra) }}</td>
          </tr>
          <tr class="border-top">
            <td class="fw-bold pt-2">Total</td>
            <td class="text-end pt-2"><span class="money grand-total marker">{{ formatMoney(totals.total) }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
