export default class Utils {

  /**
   * 获取URI 地址参数.
   * @param key 参数名称.
   */
  public static getParam(key: string): string | undefined {
    const values = window.location.search.split('?');
    if (values.length <= 1) {
      return undefined;
    }
    const value = values[1];
    if (value === undefined) {
      return undefined;
    }
    for (const it of decodeURIComponent(value)
      .split('&')) {
      const args = it.trim()
        .split('=');
      if (args.length !== 2) {
        continue;
      }
      if (args[0].toString()
        .toLocaleLowerCase() === key.toLocaleLowerCase()) {
        return args[1];
      }
    }
    return undefined;
  }

  /**
   * 复制到剪切板.
   * @param value 内容.
   */
  public static async copy(value: string): Promise<void> {
    return navigator.clipboard.writeText(value);
  }
}
