import React, { FC, useEffect, useState } from 'react';
import { GetProp, Image, message, Upload, UploadFile, UploadProps } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Session } from 'beer-network/session';

export interface HttpRequestParams {
  [key: string]: string;
}

export interface HttpRequestHeader {
  [key: string]: string;
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
export declare type ImagesContainerProps = {
  action: string
  params?: HttpRequestParams
  headers?: HttpRequestHeader
  fileTypes?: string[]
  fileTypeErrorMessage?: React.ReactNode
  fileMaxSize?: number
  fileMaxSizeErrorMessage?: React.ReactNode
  value?: string[]
  disabled?: boolean | undefined
  title?: string | undefined
  children?: React.ReactNode | undefined
  buttonText?: string | undefined
  maxLength?: number | undefined
  onChange?: (files: string[]) => void | undefined
  requestUrl: (url: string) => Promise<string> | undefined
};
export const Component: FC<ImagesContainerProps> = (props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCurrent, setPreviewCurrent] = useState(1);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const getAction = () => {
    const paramQuery = new URLSearchParams();
    Object.keys(props?.params || {})
      .forEach(key => {
        paramQuery.append(key, props?.params?.[key] || '');
      });
    return props.action + '?' + paramQuery.toString();
  };
  const handlePreview = async (file: any) => {
    const index = fileList.map(item => item as any)
      .findIndex(item => file.s3 === item.s3);
    setPreviewCurrent(index);
    setPreviewOpen(true);
  };
  const handleChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
    const status = newFileList.find(it => it.status !== undefined && it.status !== 'done');
    if (status === undefined) {
      props?.onChange?.(newFileList.map((it: any) => {
        return it.s3 || it?.response?.data;
      }));
    }
  };
  const onBeforeUpload = (file: FileType) => {
    const check = () => {
      const fileType = file.type.toLowerCase()
        .split('/')[1];
      const types = props?.fileTypes || ['jpeg', 'png', 'jpg'];
      const isFileType = types.indexOf(fileType) > -1;
      if (!isFileType) {
        messageApi.error(props?.fileTypeErrorMessage || '您选择的文件不是 Jpg/Png 格式图片')
          .then();
        return false;
      }
      const status = (file.size / 1024 / 1024) < (props?.fileMaxSize || 2);
      if (!status) {
        messageApi.error(props?.fileMaxSizeErrorMessage || `文件超过最大限制 ${(props?.fileMaxSize || 2)}Mb`)
          .then();
        return false;
      }
      return true;
    };
    return check() || Upload.LIST_IGNORE;
  };
  useEffect(() => {
    if (props?.value === undefined) {
      return;
    }
    const a = props?.value;
    const b = fileList?.map((it: any) => it.s3 as string);
    if (a.length === b.length && a.every((value, index) => value === b[index])) {
      return;
    }
    setTimeout(async () => {
      const data: UploadFile<any>[] = [];
      for (const item of props.value || []) {
        /* eslint-disable no-await-in-loop */
        data.push({
          uid: item,
          name: item,
          s3: item,
          status: 'done',
          url: await props.requestUrl(item)
        } as any);
      }
      setFileList(data);
      props?.onChange?.(props?.value || []);
    }, 0);
  }, [props?.value]);
  const Button = (
    <button style={{
      border: 0,
      background: 'none'
    }} type="button">
      <PlusOutlined/>
      <div style={{ marginTop: 8 }}>{props?.buttonText || '上传图片'}</div>
    </button>
  );
  return <div style={{ minHeight: 102 }}>
    {contextHolder}
    <Upload
      action={getAction()}
      headers={{
        ...(props.headers || {}),
        authorization: 'Bearer ' + (Session.getBearer() || '')
      }}
      listType="picture-card"
      fileList={fileList}
      onPreview={handlePreview}
      onChange={handleChange}
      beforeUpload={onBeforeUpload}
      disabled={props?.disabled === true}
    >
      {(fileList.length >= (props?.maxLength || 9) || props?.disabled) ? undefined : Button}
    </Upload>
    <Image.PreviewGroup preview={{
      visible: previewOpen,
      current: previewCurrent,
      onVisibleChange: (visible) => {
        setPreviewOpen(visible);
      },
      onChange: (current) => setPreviewCurrent(current)
    }}>
      {fileList.map((it: any, index: number) => (
        <Image key={index} wrapperStyle={{ display: 'none' }} src={it.url}/>
      ))}
    </Image.PreviewGroup>
  </div>;
};

export default Component;
