<script setup>
import { ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import ClientForm from './ClientForm.vue'
import { useClientsStore, EMPTY_CLIENT } from '@/stores/clients'
import { useUiStore } from '@/stores/ui'

/** Cria ou edita um cliente. Emite "saved" com o cliente salvo. */
const props = defineProps({
  show: Boolean,
  client: { type: Object, default: null },
  initialName: { type: String, default: '' }
})
const emit = defineEmits(['close', 'saved'])

const clients = useClientsStore()
const ui = useUiStore()
const form = ref({ ...EMPTY_CLIENT })
const formRef = ref(null)
const saving = ref(false)

watch(
  () => props.show,
  (open) => {
    if (open) form.value = props.client ? { ...props.client } : { ...EMPTY_CLIENT, name: props.initialName }
  }
)

async function save() {
  if (!formRef.value.validate()) return
  saving.value = true
  try {
    const id = await clients.save(form.value)
    ui.toast(props.client ? 'Cliente atualizado.' : 'Cliente cadastrado.')
    emit('saved', clients.getById(id))
    emit('close')
  } catch (err) {
    console.error(err)
    ui.toast('Não foi possível salvar o cliente.', 'danger')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseModal :show="show" :title="client ? 'Editar cliente' : 'Novo cliente'" fullscreen-mobile @close="emit('close')">
    <form id="client-form" novalidate @submit.prevent="save">
      <ClientForm ref="formRef" v-model="form" />
    </form>
    <template #footer>
      <button type="button" class="btn btn-light" @click="emit('close')">Cancelar</button>
      <button type="submit" form="client-form" class="btn btn-primary" :disabled="saving">
        <i class="bi bi-check2"></i> Salvar cliente
      </button>
    </template>
  </BaseModal>
</template>
