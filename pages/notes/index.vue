<template>
  <section>
    <UCard>
      <h2 class="text-lg font-bold mb-4">Notes</h2>
      <div v-if="pending" class="text-muted">Chargement...</div>
      <div v-else-if="error" class="text-error">Erreur lors du chargement des notes</div>
      <div v-else>
        <UTree :items="tree" color="neutral" class="w-full">
          <template #item="{ item }">
            <UButton
              v-if="item.type === 'file'"
              :to="`/notes/${item.path.replace(/\.md$/, '').split('/').map(encodeURIComponent).join('/')}`"
              color="primary"
              variant="link"
              class="truncate w-full text-left"
            >
              <UIcon :name="item.icon" class="mr-2" />{{ item.label }}
            </UButton>
            <span v-else class="font-semibold"><UIcon :name="item.icon" class="mr-2" />{{ item.label }}</span>
          </template>
        </UTree>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/notes')
const files: string[] = data?.value?.files || []

type TreeNode = {
  label: string
  path: string
  type: 'file' | 'folder'
  icon: string
  defaultExpanded?: boolean
  children?: TreeNode[]
}

function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode[] = []
  for (const file of paths) {
    const parts = file.split('/')
    let current = root
    let currentPath = ''
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      currentPath = currentPath ? currentPath + '/' + part : part
      let node = current.find((n) => n.label === (i < parts.length - 1 ? part + '/' : part))
      if (!node) {
        if (i < parts.length - 1) {
          node = {
            label: part + '/',
            path: currentPath,
            type: 'folder',
            icon: 'lucide:folder',
            defaultExpanded: false, // fermé par défaut
            children: []
          }
        } else {
          node = {
            label: part,
            path: currentPath,
            type: 'file',
            icon: 'lucide:file-text'
          }
        }
        current.push(node)
      }
      if (i < parts.length - 1 && node.children) current = node.children
    }
  }
  return root
}

const tree = computed(() => buildTree(files))
</script>

<style scoped>
.i-lucide-folder {
  color: #fbbf24;
}
.i-lucide-file-text {
  color: #64748b;
}
</style>
