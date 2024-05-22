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

/**
 * 其它菜单.
 */
export type Option = {
  /**
   * 中止信号量.
   */
  signal?: AbortSignal
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
   * @param header 头部.
   * @param option 选项.
   */
  async post<T>(path: string, params?: any, body?: any, header?: any, option?: Option): Promise<JsonResponse<T>> {
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params[key]);
      });
    const response = await fetch(this.pathPrefix + path + (paramQuery.toString() === '' ? '' : '?') + paramQuery.toString(), {
      method: 'POST',
      headers: {
        ...this.authorization(),
        ...(header || {}),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body || {}),
      signal: option?.signal || null
    });
    return this.responseJson<T>(response);
  }

  /**
   * 发送POST/Form 请求.
   * @param path 路径.
   * @param params 参数.
   * @param form Form参数.
   * @param header 头部.
   * @param option 选项.
   */
  async postForm<T>(path: string, params?: any, form?: any, header?: any, option?: Option): Promise<JsonResponse<T>> {
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params[key]);
      });
    const formData = new FormData();
    const appendFormData = (data: any, parentKey = '') => {
      for (const key of data) {
        const currentKey = parentKey ? `${parentKey}[${key}]` : key;
        if (typeof data[key] === 'object' && data[key] !== null) {
          appendFormData(data[key], currentKey);
        } else if (Array.isArray(data[key])) {
          data[key].forEach((item: any, index: number) => {
            const arrayKey = `${currentKey}[${index}]`;
            appendFormData({ [arrayKey]: item });
          });
        } else {
          formData.append(currentKey, data[key]);
        }
      }
    };
    appendFormData(form);

    const response = await fetch(this.pathPrefix + path + (paramQuery.toString() === '' ? '' : '?') + paramQuery.toString(), {
      method: 'POST',
      headers: {
        ...this.authorization(),
        ...(header || {}),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData,
      signal: option?.signal || null
    });
    return this.responseJson<T>(response);
  }

  /**
   * 发送POST/FormData 请求.
   * @param path 路径.
   * @param params 参数.
   * @param formData Form参数.
   * @param header 头部.
   * @param option 选项.
   */
  async postFormData<T>(path: string, params?: any, formData?: FormData, header?: any, option?: Option): Promise<JsonResponse<T>> {
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params[key]);
      });

    const response = await fetch(this.pathPrefix + path + (paramQuery.toString() === '' ? '' : '?') + paramQuery.toString(), {
      method: 'POST',
      headers: {
        ...this.authorization(),
        ...(header || {})
      },
      body: formData,
      signal: option?.signal || null
    });
    return this.responseJson<T>(response);
  }

  /**
   * 发送Get 请求.
   * @param path 路径.
   * @param params 参数.
   * @param header 头部.
   * @param option 选项.
   */
  async get<T>(path: string, params?: any, header?: any, option?: Option): Promise<JsonResponse<T>> {
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params[key]);
      });
    const response = await fetch(this.pathPrefix + path + '?' + paramQuery.toString(), {
      method: 'GET',
      headers: {
        ...this.authorization(),
        ...(header || {})
      },
      signal: option?.signal || null
    });
    return this.responseJson<T>(response);
  }

  /**
   * 缓存.
   * @param key 缓存Key.
   * @param callback 数据回执函数.
   * @param minute 缓存时间 (分钟).
   * @param isCache 是否开启缓存.
   */
  async cache<T>(key: string, callback: () => Promise<T>, minute: number, isCache: boolean) {
    const cacheKey = 'CACHE_' + key;
    if (isCache) {
      const cacheValue = localStorage.getItem(cacheKey);
      if (cacheValue !== null) {
        const result = JSON.parse(cacheValue) as T;
        const { expireTime } = (result as { expireTime: number });
        if (expireTime !== undefined && expireTime >= new Date().getTime()) {
          return result;
        }
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
