export default class ObjectUtils {
  /**
   * 解析日期.
   * @param data 表单数据.
   * @param field 字段数据.
   * @param offset 结算时间是否偏移 (单位: 天).
   */
  public static parseFormDate(data: {}, field: string, offset: number = 1) {
    const value = (data as any)[field];
    if (value === null || value === undefined) {
      return undefined;
    }
    if (value instanceof Array && value.length > 1) {
      const s = value[0].split(' ')[0];
      const e = value[1].split(' ')[0];
      if (offset > 0) {
        const eDate = new Date(e);
        eDate.setDate(eDate.getDate() + 1);
        const year = eDate.getFullYear();
        const month = eDate.getMonth() + 1;
        const day = eDate.getDate();
        return [s, `${year}-${month.toString()
          .padStart(2, '0')}-${day.toString()
          .padStart(2, '0')}`];
      }
      return [s, e];
    }
    return null;
  }

  /**
   * 匹配菜单.
   * @param menus 菜单数据.
   * @param subKey 字段名称.
   * @param linkKey 值字段名称.
   * @param value 匹配的值.
   */
  public static matchMenus(menus: any, subKey: string, linkKey: string, value: string) {
    const recursion = (items: any[], callback: (value: string) => boolean) => {
      if (items === undefined || items === null || items.length <= 0) {
        return undefined;
      }
      for (const item of items) {
        if (item[linkKey] !== undefined && item[linkKey] !== null
          && item[linkKey] !== '' && callback(item[linkKey])) {
          return item;
        }
        const val: any = recursion(item[subKey], callback);
        if (val !== undefined) {
          return val;
        }
      }
      return undefined;
    };
    return recursion(menus, (a) => {
      return a === value;
    }) || recursion(menus, (a) => {
      return a.startsWith(value);
    });
  }
}
