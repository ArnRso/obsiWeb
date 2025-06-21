import { computed } from "vue";
import type {
  NoteContent,
  NotesApiResponse,
  ContentResolverResult,
  BreadcrumbItem,
  ContentData,
} from "~/types/notes";

/**
 * Composable pour résoudre le contenu d'un slug (fichier ou dossier)
 * Supporte le SSR et la réactivité côté client
 * @param slug - Le slug provenant du routeur (string ou string[])
 * @returns L'objet avec le type de contenu et les données associées
 */
export function useContentResolver(
  slug: string | string[]
): ContentResolverResult {
  // Normaliser le path depuis le slug
  const path = computed(() => {
    if (Array.isArray(slug)) {
      return slug.join("/");
    }
    return slug || "";
  });

  // Fonction pour détecter le type de contenu basé sur le path
  const detectContentType = (pathStr: string): "file" | "folder" => {
    // Si le path se termine par .md, c'est un fichier
    if (pathStr.endsWith(".md")) {
      return "file";
    }

    // Si le path contient une extension, c'est probablement un fichier
    const lastSegment = pathStr.split("/").pop() || "";
    if (lastSegment.includes(".") && !lastSegment.startsWith(".")) {
      return "file";
    }

    // Sinon, c'est un dossier
    return "folder";
  };

  // Fonction pour charger le contenu d'un dossier
  const loadFolderContent = async (pathStr: string): Promise<ContentData> => {
    const response = await $fetch<NotesApiResponse>(
      `/api/notes?dir=${encodeURIComponent(pathStr)}`
    );

    if (response.currentType === "folder") {
      return {
        type: "folder",
        items: response.items || [],
        note: null,
      };
    } else if (response.currentType === "file") {
      // Si l'API dit que c'est un fichier, on le traite comme tel
      return await loadFileContent(pathStr);
    } else {
      return {
        type: "notfound",
        items: [],
        note: null,
      };
    }
  };

  // Fonction pour charger le contenu d'un fichier
  const loadFileContent = async (pathStr: string): Promise<ContentData> => {
    // Nettoyer le path pour l'API note
    const cleanPath = pathStr
      .replace(/\.md$/, "")
      .replace(/^notes\//, "")
      .replace(/^\//, "");

    const rawContent = await $fetch(
      `/api/note?path=${encodeURIComponent(cleanPath)}`
    );

    if (
      rawContent &&
      typeof rawContent === "object" &&
      "content" in rawContent &&
      typeof rawContent.content === "string"
    ) {
      return {
        type: "file",
        items: [],
        note: {
          title:
            cleanPath.split("/").pop()?.replace(/\.md$/, "") ||
            "Note sans titre",
          body: rawContent.content,
          _path: `/notes/${cleanPath}`,
        } as NoteContent,
      };
    } else {
      // Si le fichier n'est pas trouvé, vérifier si c'est peut-être un dossier
      try {
        return await loadFolderContent(pathStr);
      } catch {
        return {
          type: "notfound",
          items: [],
          note: null,
        };
      }
    }
  };

  // Fonction principale de résolution du contenu
  const resolveContent = async (pathStr: string): Promise<ContentData> => {
    try {
      // D'abord, essayer de détecter le type basé sur le path
      const detectedType = detectContentType(pathStr);

      if (detectedType === "file") {
        return await loadFileContent(pathStr);
      } else {
        return await loadFolderContent(pathStr);
      }
    } catch (err) {
      console.error("Erreur lors de la résolution du contenu:", err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  // Utiliser useAsyncData pour le SSR et la réactivité
  const { data, pending, error, refresh } = useAsyncData(
    `content-${path.value}`,
    async () => {
      return await resolveContent(path.value);
    },
    {
      server: true,
      default: (): ContentData => ({
        type: "loading",
        items: [],
        note: null,
      }),
      watch: [path],
    }
  );

  // Propriétés calculées pour faciliter l'utilisation
  const contentType = computed(() => data.value?.type || "loading");
  const items = computed(() => data.value?.items || []);
  const note = computed(() => data.value?.note || null);

  const isFile = computed(() => contentType.value === "file");
  const isFolder = computed(() => contentType.value === "folder");
  const isNotFound = computed(() => contentType.value === "notfound");
  const isLoading = computed(
    () => contentType.value === "loading" || pending.value
  );

  // Génération des breadcrumbs
  const breadcrumbs = computed((): BreadcrumbItem[] => {
    const pathStr = path.value;
    if (!pathStr) {
      return [{ label: "Notes", to: "/notes/" }];
    }

    const segments = pathStr.split("/").filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: "Notes", to: "/notes/" },
    ];

    segments.forEach((segment, index) => {
      const segmentPath = segments.slice(0, index + 1).join("/");
      breadcrumbItems.push({
        label: segment.replace(/\.md$/, ""),
        to: `/notes/${segmentPath}`,
      });
    });

    return breadcrumbItems;
  });

  return {
    // États
    type: contentType,
    items,
    note,
    pending,
    error,

    // Propriétés calculées
    isFile,
    isFolder,
    isNotFound,
    isLoading,
    breadcrumbs,
    path,

    // Actions
    refresh,
  };
}
