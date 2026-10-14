<script setup>
import { ref } from 'vue'
import MoneyInput from './MoneyInput.vue'
import DecimalInput from './DecimalInput.vue'
import CatalogPickerModal from './CatalogPickerModal.vue'
import { newItemUid } from '@/stores/quotes'
import { UNITS } from '@/stores/catalog'
import { itemSubtotal } from '@/utils/money'
import { formatMoney } from '@/utils/format'

const items = defineModel({ type: Array, required: true })
const showPicker = ref(false)

function addFromCatalog(cat) {
  // Mesmo item do catálogo já presente: soma 1 na quantidade
  const existing = items.value.find((it) => it.catalogId === cat.id && it.unitPrice === cat.price)
  if (existing) {
    existing.quantity = (Number(existing.quantity) || 0) + 1
    return
  }
  items.value.push({
    uid: newItemUid(),
    catalogId: cat.id,
    description: cat.description,
    quantity: 1,
    unit: cat.unit,
    unitPrice: cat.price
  })
}

function addBlank() {
  items.value.push({ uid: newItemUid(), catalogId: null, description: '', quantity: 1, unit: 'un', unitPrice: 0 })
  // Foca a descrição do novo item
  setTimeout(() => {
    const inputs = document.querySelectorAll('.item-desc')
    inputs[inputs.length - 1]?.focus()
  }, 50)
}

function remove(index) {
  items.value.splice(index, 1)
}

function move(index, dir) {
  const target = index + dir
  if (target < 0 || target >= items.value.length) return
  const [it] = items.value.splice(index, 1)
  items.value.splice(target, 0, it)
}
</script>

<template>
  <div>
    <div v-if="!items.length" class="text-center text-secondary small py-3 border rounded border-dashed mb-3">
      Nenhum item ainda. Adicione do catálogo ou crie um item avulso.
    </div>

    <div class="mb-3">
      <div v-for="(it, i) in items" :key="it.uid" class="item-row">
        <div class="d-flex gap-2 align-items-start mb-2">
          <span class="badge text-bg-light border mt-2">{{ i + 1 }}</span>
          <textarea
            v-model="it.description"
            class="form-control item-desc"
            rows="1"
            maxlength="300"
            placeholder="Descrição do item"
            :aria-label="`Descrição do item ${i + 1}`"
          ></textarea>
          <div class="d-flex flex-column">
            <button type="button" class="btn btn-sm btn-link text-secondary p-0 px-1" :disabled="i === 0" title="Mover para cima" @click="move(i, -1)">
              <i class="bi bi-chevron-up"></i>
            </button>
            <button type="button" class="btn btn-sm btn-link text-secondary p-0 px-1" :disabled="i === items.length - 1" title="Mover para baixo" @click="move(i, 1)">
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>
        </div>
        <div class="row g-2 align-items-end">
          <div class="col-3 col-md-2">
            <label class="form-label small text-secondary mb-1">Qtd.</label>
            <DecimalInput v-model="it.quantity" />
          </div>
          <div class="col-3 col-md-2">
            <label class="form-label small text-secondary mb-1">Un.</label>
            <input v-model="it.unit" class="form-control" list="quote-units" maxlength="12" />
          </div>
          <div class="col-6 col-md-4">
            <label class="form-label small text-secondary mb-1">Valor unit.</label>
            <MoneyInput v-model="it.unitPrice" prefix="" />
          </div>
          <div class="col-9 col-md-3 text-md-end">
            <div class="small text-secondary">Subtotal</div>
            <div class="fw-bold tabular">{{ formatMoney(itemSubtotal(it)) }}</div>
          </div>
          <div class="col-3 col-md-1 text-end">
            <button type="button" class="btn btn-outline-danger btn-sm" title="Remover item" @click="remove(i)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
    <datalist id="quote-units">
      <option v-for="u in UNITS" :key="u" :value="u" />
    </datalist>

    <div class="d-flex gap-2">
      <button type="button" class="btn btn-outline-primary flex-fill" @click="showPicker = true">
        <i class="bi bi-journal-plus"></i> Do catálogo
      </button>
      <button type="button" class="btn btn-outline-secondary flex-fill" @click="addBlank">
        <i class="bi bi-plus-lg"></i> Item avulso
      </button>
    </div>

    <CatalogPickerModal :show="showPicker" @close="showPicker = false" @pick="addFromCatalog" />
  </div>
</template>
