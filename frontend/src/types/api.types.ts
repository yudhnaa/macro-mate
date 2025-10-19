// API related interfaces

export interface ApiError {
  detail: string;
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}
