# obsiWeb

obsiWeb est une application web de prise de notes moderne, rapide et minimaliste, construite avec Nuxt 3, Vue 3, Tiptap et TailwindCSS. Elle permet de gérer des notes hiérarchisées (dossiers/fichiers), d’éditer du contenu riche (Markdown, code, listes, etc.) et de profiter d’une expérience utilisateur fluide et responsive.

## Fonctionnalités principales

- **Gestion de notes et dossiers** :
  - Création, suppression, renommage de notes et dossiers
  - Organisation hiérarchique (dossiers imbriqués)
  - Sélection multiple et actions groupées
- **Édition riche** :
  - Éditeur Tiptap avec prise en charge du Markdown, titres, listes, citations, code, etc.
  - Blocs de code multilangages avec coloration syntaxique (highlight.js)
  - Mode édition/lecture
- **Recherche et navigation** :
  - Navigation rapide entre notes et dossiers
  - Liens internes entre notes
- **Expérience utilisateur** :
  - Interface responsive et épurée (UI Nuxt, TailwindCSS)
  - Icônes Lucide
  - Actions accessibles via la barre d’outils contextuelle

## Structure du projet

```
obsiWeb/
├── assets/           # Feuilles de style CSS (main, highlightjs)
├── components/       # Composants Vue (NotesGrid, NoteItem, NotesToolbar, TiptapEditor...)
├── composables/      # Fonctions utilitaires Vue (useNotes, useNoteActions...)
├── layouts/          # Layouts Nuxt
├── notes/            # Notes Markdown (arborescence dossiers/fichiers)
├── pages/            # Pages Nuxt (index, about, notes/[...slug].vue)
├── public/           # Fichiers statiques (favicon, robots.txt)
├── server/           # API serverless (CRUD notes)
├── services/         # Services métiers (noteService)
├── types/            # Types TypeScript
├── utils/            # Fonctions utilitaires
├── nuxt.config.ts    # Configuration Nuxt
├── tailwind.config.js# Configuration TailwindCSS
├── package.json      # Dépendances et scripts
└── ...
```

## Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd obsiWeb
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   # ou pnpm install / yarn install / bun install
   ```

## Démarrage en développement

```bash
npm run dev
# ou pnpm dev / yarn dev / bun run dev
```

L’application sera accessible sur http://localhost:3000

## Build production

```bash
npm run build
npm run preview
```

## Technologies principales

- [Nuxt 3](https://nuxt.com/) (Vue 3, SSR, file-based routing)
- [Tiptap](https://tiptap.dev/) (éditeur riche)
- [TailwindCSS](https://tailwindcss.com/) (UI moderne)
- [highlight.js](https://highlightjs.org/) (coloration code)
- [UI Nuxt](https://ui.nuxt.com/) (composants UI)
- [TypeScript](https://www.typescriptlang.org/)

## Personnalisation

- Ajoutez vos notes dans le dossier `notes/` (format Markdown)
- Modifiez les composants dans `components/` pour adapter l’UI
- Ajoutez de nouveaux endpoints API dans `server/api/` si besoin

## Contribution

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'Ajout de ma feature'`)
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## Licence

[MIT](./LICENSE)

---

_obsiWeb – Application de prise de notes moderne et minimaliste._
