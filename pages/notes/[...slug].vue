<template>
  <section>
    <UCard>
      <div v-if="pending">Chargement...</div>
      <div v-else-if="error">Note introuvable</div>
      <div v-else>
        <h2 class="text-lg font-bold mb-4">{{ title }}</h2>
        <div>{{ content }}</div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
const { slug } = useRoute().params
const path = Array.isArray(slug) ? slug.join('/') : slug
const { data, pending, error } = await useFetch(`/api/note?path=${encodeURIComponent(path)}.md`)

let title = ''
let content = ''
if (data.value && 'content' in data.value && data.value.content) {
  // Extraction du frontmatter YAML (optionnel)
  const match = data.value.content.match(/^---([\s\S]*?)---\n([\s\S]*)$/)
  if (match) {
    const frontmatter = match[1]
    content = match[2]
    const titleMatch = frontmatter.match(/title:\s*(.*)/)
    if (titleMatch) title = titleMatch[1].trim()
  } else {
    content = data.value.content
    title = path
  }
}
</script>
