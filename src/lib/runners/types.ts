/** Valore di una cella già normalizzato per il confronto e la visualizzazione. */
export type Cell = string | number | boolean | null;

export interface TableResult {
  columns: string[];
  rows: Cell[][];
}

export interface RunError {
  message: string;
  line?: number;
}

export interface SqlRunResult {
  ok: boolean;
  table?: TableResult;
  error?: RunError;
  ms: number;
}

export interface PyTest {
  codice: string;
  messaggio: string;
}

export interface PyRunResult {
  ok: boolean;
  stdout: string;
  error?: RunError;
  figures: string[]; // PNG in base64
  failed?: { messaggio: string; dettaglio?: string };
  testsPassed?: number;
  testsTotal?: number;
  ms: number;
}

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';
