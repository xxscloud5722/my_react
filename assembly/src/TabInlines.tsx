import React, { FC, ReactNode, useState } from 'react';
import { css } from '@emotion/css';
import { Tabs, theme } from 'antd';

export declare type TabInlinesProps = {
  onChange?: (value: number) => void | undefined;
  items: InlineTabsItem[]
  defaultValue?: string | undefined
}
export declare type InlineTabsItem = {
  key: string
  label: string,
  node: ReactNode
}
const App: FC<TabInlinesProps> = (props) => {
  const [activeKey, setActiveKey] = useState(props.defaultValue || '1');
  const { token } = theme.useToken();
  return <>
    <div className={css`
      background: #fff;
      padding: 5px 0 0 0;
      border-radius: ${token.borderRadius}px;
      overflow: hidden;
      min-height: 500px;
    `}>
      <Tabs activeKey={activeKey} className={css`
        margin: 0 20px;

        & .ant-tabs-nav {
          margin: 0;
        }
      `} items={props.items} onChange={(activeKey) => {
        setActiveKey(activeKey);
      }}>
      </Tabs>
      {props.items.filter(item => item.key === activeKey)
        .map(item => (
          item.node
        ))}
    </div>
  </>;
};
export default App;
