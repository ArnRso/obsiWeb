// Types partagés front/back pour la gestion des notes et du contenu minimark

export type MinimarkNode = [
  string,
  Record<string, unknown>,
  ...(string | MinimarkNode)[],
];
export type MinimarkAst = MinimarkNode[];

export interface NoteContent {
  body?: { type: string; value: MinimarkAst; toc?: unknown } | string;
  title?: string;
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

// Ajout des types NoteItem et NotesApiResponse pour lister les notes
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

// Ajout du type NotesQuery pour la requête d'API de notes
export interface NotesQuery {
  dir?: string;
}
