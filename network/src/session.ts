declare const window: { location: any, sessionKey: string, accessTokenKey: string, accessToken: string };

export class Session {

  /**
   * 获取令牌.
   * <li>window.sessionKey 设置读取缓存用户信息的Key, 默认 login_user.</li>
   * <li>window.accessTokenKey 读取用户令牌的字段, 默认 accessToken 或者 token.</li>
   * <li>window.accessToken 设置身份令牌, 直接返回.</li>
   */
  public static getBearer() {
    if (window.accessToken !== undefined && window.accessToken !== '') {
      return window.accessToken;
    }
    const key: string = window.sessionKey || 'login_user';
    const loginUser: {
      accessToken: string | undefined,
      token: string | undefined
    } = JSON.parse(localStorage.getItem(key) || sessionStorage.getItem(key) || '{}');
    if (window.accessTokenKey !== undefined && window.accessTokenKey !== '') {
      return (loginUser as never)[window.accessTokenKey];
    }
    return loginUser.accessToken || loginUser.token || undefined;
  }

  /**
   * 检查令牌是否存在.
   */
  public static checkAccessTokenExist() {
    const bearer = Session.getBearer();
    return !(bearer === undefined || bearer === '');
  }

  /**
   * 退出登录.
   * @param url 退出之后的地址.
   */
  public static logout(url?: string) {
    localStorage?.clear();
    sessionStorage?.clear();
    if (url !== undefined && url !== '') {
      window.location.href = url;
    }
  }
}
