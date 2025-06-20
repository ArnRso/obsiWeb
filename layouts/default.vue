<template>
  <UApp>
    <UContainer>
      <header class="flex items-center justify-between py-4 border-b border-gray-200 mb-6">
        <h1 class="text-xl font-bold">Mon Site</h1>
        <nav class="flex gap-2">
          <UButton to="/" color="primary" variant="link">Accueil</UButton>
          <UButton to="/about" color="primary" variant="link">À propos</UButton>
        </nav>
      </header>
      <UMain>
        <NuxtPage />
      </UMain>
    </UContainer>
  </UApp>
</template>

<script setup lang="ts">
// Utilisation des composants Nuxt UI
</script>

<style scoped>
</style>
