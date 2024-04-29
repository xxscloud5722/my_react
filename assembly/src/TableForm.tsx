import React, { FC, ReactNode, useEffect } from 'react';
import { css } from '@emotion/css';
import { theme } from 'antd';
import { ProForm, ProFormProps } from '@ant-design/pro-components';

export declare type TableFormProps = {
  onFinish: (formData: {}) => Promise<boolean | void>,
  children: ReactNode
  formProps?: ProFormProps | undefined
};
const App: FC<TableFormProps> = (props) => {

  const { token } = theme.useToken();

  useEffect(() => {
  }, []);
  return <>
    <ProForm
      {...props.formProps}
      layout="vertical"
      style={{
        background: '#fff',
        padding: 20,
        marginBottom: 20,
        borderRadius: token.borderRadius,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'end',
        gap: 12
      }}
      className={css`
          .ant-row {
              width: 200px;
          }

          .ant-form-item-label {
              font-weight: 500;
          }
      `}
      submitter={{
        render: (_props, dom) => {
          return <div style={{
            display: 'flex',
            gap: 10,
            height: '100%',
            marginBottom: 24
          }}>
            {dom[1]}{dom[0]}
          </div>;
        },
        searchConfig: {
          submitText: '查询',
          resetText: '重置'
        }
      }}
      onFinish={async (value) => {
        props?.onFinish?.(value);
      }}
    >
      {props?.children}
    </ProForm>
  </>;
};
export default App;
