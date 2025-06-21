export interface SaveNotePayload {
  path: string;
  markdown: string;
}

export interface SaveNoteResponse {
  success: boolean;
  error?: string;
}
