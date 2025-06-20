<template>
  <section class="home">
    <UCard>
      <h2>Bienvenue sur l’éditeur Markdown en ligne</h2>
      <p>
        Créez, éditez et sauvegardez vos fichiers Markdown directement depuis votre navigateur. Les contenus sont stockés dans un dossier dédié côté serveur.
      </p>
      <UButton to="/editor" color="primary">Commencer à éditer</UButton>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Page d'accueil simple, navigation vers l'éditeur
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}
h2 {
  margin-bottom: 1rem;
}
p {
  margin-bottom: 2rem;
}
</style>
