<script setup lang="ts">
const title = ref('Hello Nuxt OG')
const tag   = ref('client-only')
const { gen, download } = useOg()

const preview = ref('')
watch([title, tag], async () => {
  preview.value = URL.createObjectURL(await gen(title.value, tag.value))
}, { immediate: true })
</script>

<template>
  <UContainer class="grid lg:grid-cols-2 gap-12 py-10">
    <UForm class="space-y-6">
      <UInput label="Title" v-model="title" size="lg" />
      <UInput label="Tag"   v-model="tag"   size="lg" />
      <UButton icon="i-lucide-download" @click="download(title, tag)">
        Download PNG
      </UButton>
    </UForm>

    <img :src="preview" class="rounded-xl shadow border" alt="preview"/>
  </UContainer>
</template> 