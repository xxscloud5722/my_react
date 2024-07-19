import { message, Upload } from 'antd';
import React, { CSSProperties, FC, useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';

export declare type CategoryPanelProps = {
  secret?: string | undefined
  style?: CSSProperties | undefined
  maxFileSize?: number | undefined
  onChange?: (base64: string) => void | undefined
};
export const Component: FC<CategoryPanelProps> = (props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [secret, setSecret] = useState(undefined as undefined | string);
  useEffect(() => {
    setSecret(props.secret);
  }, [props.secret]);
  return <div style={{
    ...(props.style || {})
  }}>
    {contextHolder}
    <Upload.Dragger className={css`
        .ant-upload-list {
            display: none;
        }
    `} customRequest={async ({ file }) => {
      if ((file as File).size > (props?.maxFileSize || 320) * 1024) {
        messageApi.error(`秘钥文件超过 ${props?.maxFileSize || 320}Kb 最大限制`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const base64String = event.target.result;
        const base64Index = base64String.indexOf('base64,');
        const value = base64String.substring(base64Index + 7);
        setSecret(value);
        props?.onChange?.(value);
      };
      reader.readAsDataURL(file as File);
    }}>
      <p className="ant-upload-text">
        {secret !== undefined ? '已选择文件' : <><UploadOutlined/>&nbsp;请选择文件</>}
      </p>
      <p style={{
        margin: 0,
        fontWeight: 400,
        fontSize: 13,
        color: '#888'
      }}>
        点击或者拖拽文件到此区域进行秘钥
        <span style={{
          fontWeight: 500,
          marginInlineStart: 4
        }}>{secret !== undefined ? '替换' : '上传'}</span>
      </p>
    </Upload.Dragger>
  </div>;
};

export default Component;
