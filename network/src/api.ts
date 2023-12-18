import { Session } from './session';

/**
 * Json 响应通用实体.
 */
export type JsonResponse<T> = {
  success: boolean;
  data: T;
  code: string;
  message?: string;
};

/**
 * Antd Table 数据类型.
 */
export type RequestData<T> = {
  data: T[]
  page: number
  total: number
  success: boolean
}

export default class Fetch {
  /**
   * 请求地址.
   */
  private readonly pathPrefix: string;

  public constructor(pathPrefix: string) {
    this.pathPrefix = pathPrefix;
  }

  /**
   * 发送POST/JSON 请求.
   * @param path 路径.
   * @param params 参数.
   * @param body 内容体.
   */
  async post<T>(path: string, params?: any, body?: any): Promise<JsonResponse<T>> {
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params[key]);
      });
    const response = await fetch(this.pathPrefix + path + (paramQuery.toString() === '' ? '' : '?') + paramQuery.toString(), {
      method: 'POST',
      headers: {
        ...this.authorization(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {})
    });
    return this.responseJson<T>(response);
  }

  /**
   * 发送Get 请求.
   * @param path 路径.
   * @param params 参数.
   */
  async get<T>(path: string, params?: any): Promise<JsonResponse<T>> {
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params[key]);
      });
    const response = await fetch(this.pathPrefix + path + '?' + paramQuery.toString(), {
      method: 'GET',
      headers: {
        ...this.authorization()
      }
    });
    return this.responseJson<T>(response);
  }

  /**
   * 缓存.
   * @param key 缓存Key.
   * @param callback 数据回执函数.
   * @param minute 缓存时间 (分钟).
   */
  async cache<T>(key: string, callback: () => Promise<T>, minute: number) {
    const cacheKey = 'CACHE_' + key;
    const cacheValue = localStorage.getItem(cacheKey);
    if (cacheValue !== null) {
      const result = JSON.parse(cacheValue) as T;
      const { expireTime } = (result as { expireTime: number });
      if (expireTime !== undefined && expireTime >= new Date().getTime()) {
        return result;
      }
    }
    const response = await callback();
    if ((response as { code: string }).code === '0') {
      (response as { expireTime: number }).expireTime = new Date().getTime() + 60000 * minute;
      localStorage.setItem(cacheKey, JSON.stringify(response));
    }
    return response;
  }

  /**
   * 默认授权方式.
   */
  authorization(): {} {
    const bearer = Session.getBearer();
    if (bearer === undefined || bearer === '') {
      return {};
    }
    return { Authorization: 'Bearer ' + bearer };
  }

  /**
   * 默认响应数据解析方式.
   * @param response 响应数据.
   */
  async responseJson<T>(response: Response): Promise<JsonResponse<T>> {
    const result = await response.json() as JsonResponse<T>;
    if (result?.code === '401') {
      setTimeout(() => window.location.replace('/auth/login'), 500);
      return result;
    }
    return result;
  }

  pageParams(params: any) {
    return {
      ...params,
      currentPage: params.current,
      current: undefined
    };
  }

  async pageTable<T>(response: JsonResponse<any>): Promise<Partial<RequestData<T>>> {
    return {
      data: (response.data as { records: [] }).records || response.data,
      page: response.data.currentPage || 1,
      total: (response.data as { totalSize: number }).totalSize || response.data.length,
      success: response.success
    } as RequestData<T>;
  }

  async sleep(value: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, value);
    });
  }
}
