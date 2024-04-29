import React, { FC } from 'react';
import { Breadcrumb, Divider, theme } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import { useNavigate } from 'react-router-dom';
import { ItemType } from 'antd/es/breadcrumb/Breadcrumb';

export declare type BackPageHeaderProps = {
  breadcrumb: ItemType[]
}
const App: FC<BackPageHeaderProps> = (props) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  return <>
    <div className={css`
        height: 55px;
        display: flex;
        align-items: center;

        & .back {
            padding: 6px 12px;
            color: #8a9099;
            user-select: none;
            display: flex;
            align-items: center;
            border-radius: ${token.borderRadius}px;
        }

        & .back:hover {
            color: #1e2226;
            background: #e9ecf0;
        }
    `}>
      <a className="back" onClick={() => navigate(-1)}>
        <LeftOutlined style={{
          fontSize: '10px',
          marginRight: '2px'
        }}/>
        返回
      </a>
      <Divider type="vertical" style={{
        background: '#e1e2e6',
        height: '16px',
        margin: '2px 12px 0 6px'
      }}/>
      <Breadcrumb
        items={props.breadcrumb}
      />
    </div>
  </>;
};
export default App;
