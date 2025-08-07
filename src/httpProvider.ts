import { Logger } from './logger';

import gaxios from 'gaxios';

export type HttpProviderRequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  baseUrl?: string;
};

export type HttpProviderResult<R = unknown> =
  | {
      ok: true;
      status: number;
      data: R;
      headers: Headers;
    }
  | {
      ok: false;
      status?: number;
      error: Error;
      data?: unknown;
    };

export class HttpProvider {
  constructor(private readonly logger: Logger) {}

  async request<R = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS',
    url: string,
    options: HttpProviderRequestOptions = {}
  ): Promise<HttpProviderResult<R>> {
    try {
      const response = await gaxios.request<R>({
        baseURL: options.baseUrl,
        url,
        method,
        data: options.data,
        headers: options.headers,
        params: options.params,
      });

      return {
        ok: true,
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (_err: unknown) {
      const err = _err as gaxios.GaxiosError<R>;

      if (err.response) {
        return {
          ok: false,
          status: err.response.status,
          error: err,
          data: err.response.data,
        };
      } else {
        this.logger.error(
          'HttpProvider',
          `HTTP request failed without response: ${err?.message}`,
          {
            method,
            baseUrl: options.baseUrl,
            url,
            error: err?.message,
            stack: err?.stack,
          }
        );

        return {
          ok: false,
          error: err,
        };
      }
    }
  }
}
