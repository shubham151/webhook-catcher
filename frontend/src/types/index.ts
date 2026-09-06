export interface Request {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  headers: Record<string, string>;
  body_str: string;
  body_json: Record<string, unknown> | null;
  query_params: Record<string, string>;
}

export interface State {
  id: string;
  items: Request[];
  copied: boolean;
  copy: () => void;
  url: string;
}
