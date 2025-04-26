<script setup lang="ts">
import { ref } from 'vue'

const { download, generatePreviewDataUrl } = useOg()

const title = ref('Hello World')
const tag = ref('Nuxt UI')
const backgroundColor = ref('#6366F1') // Default background (Indigo 500)
const textColor = ref('#FFFFFF')       // Default text (White)
const titleFontSize = ref(64)        // Default title font size

// Pass new refs to the composable
const previewUrl = generatePreviewDataUrl(title, tag, backgroundColor, textColor, titleFontSize)

function handleDownload() {
  // Pass current values to download
  download(title.value, tag.value, {
    backgroundColor: backgroundColor.value,
    textColor: textColor.value,
    titleFontSize: titleFontSize.value
  })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">

      <!-- Input Form Card -->
      <UCard class="shadow-xl">
        <template #header>
          <h1 class="text-2xl font-bold text-center text-gray-800 dark:text-gray-200">OG Image Generator</h1>
        </template>

        <UFormGroup label="Title" class="mb-4">
          <UInput v-model="title" placeholder="Enter title..." size="lg" />
        </UFormGroup>

        <UFormGroup label="Tag (Optional)" class="mb-4">
          <UInput v-model="tag" placeholder="Enter tag..." size="lg" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-4 mb-4">
            <UFormGroup label="Background">
              <UInput v-model="backgroundColor" type="color" size="lg" class="w-full"/>
            </UFormGroup>
            <UFormGroup label="Text Color">
              <UInput v-model="textColor" type="color" size="lg" class="w-full"/>
            </UFormGroup>
        </div>

        <UFormGroup label="Title Font Size" class="mb-6">
            <URange v-model="titleFontSize" :min="16" :max="128" size="lg"/>
            <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">{{ titleFontSize }}px</span>
        </UFormGroup>

        <UButton block size="lg" icon="i-heroicons-arrow-down-tray" @click="handleDownload">
          Download OG Image
        </UButton>
      </UCard>

      <!-- Live Preview Card -->
      <UCard class="shadow-xl flex flex-col items-center justify-center aspect-video">
         <template #header>
           <h2 class="text-xl font-semibold text-center text-gray-700 dark:text-gray-300">Live Preview</h2>
         </template>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-md w-full h-full flex items-center justify-center">
           <img v-if="previewUrl" :src="previewUrl" alt="OG Image Preview" class="max-w-full max-h-full object-contain" >
           <span v-else class="text-gray-500 dark:text-gray-400">Generating preview...</span>
        </div>
      </UCard>

    </div>
  </div>
</template>
