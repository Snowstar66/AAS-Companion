export type ApiError = {
  code: string;
  message: string;
  field?: string;
};

export type ApiResult<TData> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      errors: ApiError[];
    };

export function success<TData>(data: TData): ApiResult<TData> {
  return { ok: true, data };
}

export function failure(...errors: ApiError[]): ApiResult<never> {
  return { ok: false, errors };
}
