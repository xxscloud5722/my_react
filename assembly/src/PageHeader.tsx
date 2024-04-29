import React, { FC } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { css } from '@emotion/css';

export declare type PageHeaderProps = {
  title?: string | undefined
  tabs?: string[] | undefined
  onChange?: (value: number) => void | undefined
}
const App: FC<PageHeaderProps> = (props) => {
  return <>
    {props.title === undefined ? undefined : <PageContainer pageHeaderRender={() => {
      return <div className={css`
          display: flex;
          align-items: center;
          height: 56px;
          font-size: 16px;
          font-weight: 600;
      `}>
        {props.title}
      </div>;
    }}/>}
    {props.tabs === undefined ? undefined : <PageContainer
      className={css`
          & .ant-page-header-footer {
              margin: 5px 0 10px 10px !important;
          }

          & .page-container-tabs {
              & .ant-tabs-nav {
                  margin: 0;

                  & .ant-tabs-tab {
                      padding: 8px 5px;
                  }

                  & .ant-tabs-tab-btn {
                      font-size: 15px;
                      font-weight: 500;
                  }
              }

              & .ant-tabs-nav:before {
                  display: none;
              }
          }
      `}
      header={{ title: '' }}
      tabProps={{
        className: 'page-container-tabs'
      }}
      onTabChange={(e) => {
        return props.onChange && props.onChange(Number(e));
      }}
      tabList={props.tabs.map((it, index) => {
        return {
          tab: it,
          key: index
        };
      })}
    />}
  </>;
};
export default App;
