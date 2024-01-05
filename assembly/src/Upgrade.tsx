import React, { FC, useEffect } from 'react';
import { Modal } from 'antd';

export declare type UpgradeComponentProps = {
  localVersion: string
  request?: () => Promise<string> | undefined
}
const TIME_KEY = 'VERSION_TIME';
const App: FC<UpgradeComponentProps> = (props) => {
  useEffect(() => {
    // 每5分钟执行一次
    setTimeout(async () => {
      // 读取缓存的上次弹出更新时间
      const lastTime = Number(localStorage.getItem(TIME_KEY) || 0);
      if (Number.isNaN(lastTime)) {
        localStorage.removeItem(TIME_KEY);
        return;
      }
      // 30分钟执行一次
      if (new Date().getTime() <= lastTime + 1800000) {
        return;
      }
      // 更新刷新时间
      localStorage.setItem(TIME_KEY, new Date().getTime()
        .toString());

      const newVersion = await props.request?.();
      if (newVersion === undefined || newVersion === '') {
        return;
      }
      if (newVersion === props.localVersion) {
        return;
      }

      // 弹出提示框
      Modal.confirm({
        title: '版本更新提示',
        content: <>
          <p style={{
            fontSize: '15px',
            lineHeight: '26px'
          }}>您已经长时间未使用此页面，在此期间平台有过更新，如您此时在页面中没有填写相关信息等操作，请点击刷新页面使用最新版本！</p>
        </>,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          window.location.reload();
        }
      });
    }, 5000);
  }, []);
  return <></>;
};
export default App;
