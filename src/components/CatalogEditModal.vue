<script setup>
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import MoneyInput from './MoneyInput.vue'
import { useCatalogStore, EMPTY_CATALOG_ITEM, UNITS } from '@/stores/catalog'
import { useUiStore } from '@/stores/ui'

const props = defineProps({
  show: Boolean,
  item: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const catalog = useCatalogStore()
const ui = useUiStore()
const form = ref({ ...EMPTY_CATALOG_ITEM })
const error = ref('')

watch(
  () => props.show,
  (open) => {
    if (open) {
      form.value = props.item ? { ...props.item } : { ...EMPTY_CATALOG_ITEM }
      error.value = ''
    }
  }
)

async function save() {
  if (!form.value.description.trim()) {
    error.value = 'Descrição é obrigatória'
    return
  }
  try {
    await catalog.save(form.value)
    ui.toast(props.item ? 'Item atualizado.' : 'Item adicionado ao catálogo.')
    emit('saved')
    emit('close')
  } catch (err) {
    console.error(err)
    ui.toast('Não foi possível salvar o item.', 'danger')
  }
}
</script>

<template>
  <BaseModal :show="show" :title="item ? 'Editar item' : 'Novo item do catálogo'" @close="emit('close')">
    <form id="catalog-form" novalidate @submit.prevent="save">
      <div class="btn-group w-100 mb-3" role="group" aria-label="Tipo">
        <input id="kind-servico" v-model="form.kind" type="radio" class="btn-check" value="servico" />
        <label class="btn btn-outline-primary" for="kind-servico"><i class="bi bi-tools"></i> Serviço</label>
        <input id="kind-produto" v-model="form.kind" type="radio" class="btn-check" value="produto" />
        <label class="btn btn-outline-primary" for="kind-produto"><i class="bi bi-box"></i> Produto</label>
      </div>
      <div class="mb-3">
        <label class="form-label" for="cat-desc">Descrição *</label>
        <textarea
          id="cat-desc"
          v-model="form.description"
          class="form-control"
          :class="{ 'is-invalid': error }"
          rows="2"
          maxlength="300"
          placeholder="Ex.: Instalação de tomada"
        ></textarea>
        <div class="invalid-feedback">{{ error }}</div>
      </div>
      <div class="row g-3">
        <div class="col-5">
          <label class="form-label" for="cat-unit">Unidade</label>
          <input id="cat-unit" v-model="form.unit" class="form-control" list="units-list" maxlength="12" />
          <datalist id="units-list">
            <option v-for="u in UNITS" :key="u" :value="u" />
          </datalist>
        </div>
        <div class="col-7">
          <label class="form-label" for="cat-price">Preço</label>
          <MoneyInput id="cat-price" v-model="form.price" />
        </div>
      </div>
    </form>
    <template #footer>
      <button type="button" class="btn btn-light" @click="emit('close')">Cancelar</button>
      <button type="submit" form="catalog-form" class="btn btn-primary"><i class="bi bi-check2"></i> Salvar</button>
    </template>
  </BaseModal>
</template>
