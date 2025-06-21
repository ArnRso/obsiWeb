<template>
  <section class="home">
    <UCard class="max-w-2xl w-full mx-auto p-0 overflow-hidden">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-notebook" class="size-6 text-primary" />
          <span class="text-2xl font-bold tracking-tight">obsi web</span>
        </div>
      </template>
      <div class="py-6 px-6">
        <h2 class="text-xl font-semibold mb-2">
          Votre espace de notes moderne, en ligne
        </h2>
        <p class="mb-6 text-gray-700">
          obsi web vous permet de créer, organiser et retrouver toutes vos notes
          markdown dans une interface élégante et intuitive.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <UCard
            variant="subtle"
            class="flex items-center gap-3 py-2 px-3 bg-primary/5 border border-primary/10"
          >
            <div
              class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10"
            >
              <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
            </div>
            <span class="font-medium text-sm"
              >Édition markdown en temps réel</span
            >
          </UCard>
          <UCard
            variant="subtle"
            class="flex items-center gap-3 py-2 px-3 bg-primary/5 border border-primary/10"
          >
            <div
              class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10"
            >
              <UIcon name="i-lucide-folder-tree" class="size-5 text-primary" />
            </div>
            <span class="font-medium text-sm"
              >Organisation par dossiers & sous-dossiers</span
            >
          </UCard>
          <UCard
            variant="subtle"
            class="flex items-center gap-3 py-2 px-3 bg-primary/5 border border-primary/10"
          >
            <div
              class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10"
            >
              <UIcon name="i-lucide-search" class="size-5 text-primary" />
            </div>
            <span class="font-medium text-sm">Recherche instantanée</span>
          </UCard>
          <UCard
            variant="subtle"
            class="flex items-center gap-3 py-2 px-3 bg-primary/5 border border-primary/10"
          >
            <div
              class="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10"
            >
              <UIcon name="i-lucide-edit" class="size-5 text-primary" />
            </div>
            <span class="font-medium text-sm"
              >Renommage, suppression, déplacement</span
            >
          </UCard>
        </div>
        <div class="flex justify-center">
          <UButton to="/notes" color="primary" size="lg" icon="i-lucide-rocket">
            Explorer mes notes
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Présentation d'accueil moderne avec Nuxt UI
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
}
</style>
