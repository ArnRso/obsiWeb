// Types partagés front/back pour la gestion des notes et du contenu minimark
import type { ComputedRef, Ref } from "vue";

export type MinimarkNode = [
  string,
  Record<string, unknown>,
  ...(string | MinimarkNode)[],
];
export type MinimarkAst = MinimarkNode[];

export interface NoteContent {
  body?: { type: string; value: MinimarkAst; toc?: unknown } | string;
  title?: string;
  _path?: string;
  [key: string]: unknown;
}

export interface CreateNotePayload {
  type: "file" | "folder";
  path: string;
}
export interface CreateNoteResponse {
  success: boolean;
  error?: string;
}

export interface DeleteNotePayload {
  path: string;
}
export interface DeleteNoteResponse {
  success: boolean;
  error?: string;
}

// Types pour la gestion des items de notes
export type NoteItem = {
  name: string;
  type: "file" | "folder";
  path: string;
};

export type NotesApiResponse = {
  items: NoteItem[];
  currentType: "file" | "folder" | "notfound";
  error?: string;
};

// Types pour les requêtes d'API
export interface NotesQuery {
  dir?: string;
}

// Types pour le Content Resolver
export type ContentType = "file" | "folder" | "notfound" | "loading";

export interface ContentData {
  type: ContentType;
  items: NoteItem[];
  note: NoteContent | null;
}

export interface ContentResolverResult {
  // États réactifs
  type: ComputedRef<ContentType>;
  items: ComputedRef<NoteItem[]>;
  note: ComputedRef<NoteContent | null>;
  pending: Ref<boolean>;
  error: Ref<Error | null>;

  // Propriétés calculées
  isFile: ComputedRef<boolean>;
  isFolder: ComputedRef<boolean>;
  isNotFound: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  breadcrumbs: ComputedRef<BreadcrumbItem[]>;
  path: ComputedRef<string>;

  // Actions
  refresh: () => Promise<void>;
}

export interface BreadcrumbItem {
  label: string;
  to: string;
}
