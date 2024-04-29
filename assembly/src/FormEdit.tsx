import React, { FC, ReactNode, useEffect } from 'react';
import { css } from '@emotion/css';
import { Form } from 'antd';
import { ProFormProps } from '@ant-design/pro-components';

export declare type FormEditProps = {
  children?: ReactNode | undefined
  size?: number | undefined
  gap?: number | undefined
  formProps?: ProFormProps | undefined
};
const App: FC<FormEditProps> = (props) => {

  useEffect(() => {
  }, []);
  return <>
    <Form
      {...props.formProps}
      layout="vertical"
      style={{
        padding: '12px 0 6px 0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'end',
        gap: props.gap || 16
      }}
      className={css`
          .ant-form-item {
              margin-bottom: 0;
          }

          .ant-row {
              min-width: ${props.size || 180}px;
          }
      `}
    >
      {props?.children}
    </Form>
  </>;
};
export default App;
