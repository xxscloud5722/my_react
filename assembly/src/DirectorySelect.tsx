import React, { FC, useEffect, useState } from 'react';
import { Modal, Space, Spin, theme, Typography } from 'antd';
import { css } from '@emotion/css';
import { RootPath } from './FileItemTable';
import FileNavigation from './FileNavigation';

// eslint-disable-next-line max-len
const IconDirectory = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyMyIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI4IDIzIiB4PSIxNTAiIHk9IjEzMCIKICAgICBkYXRhLW5hbWU9InNwYWNlYXJlYSIgZGF0YS1zdmctaWQ9ImVhMzFiMWYxMDAiPgogICAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiCiAgICAgICAgICBkPSJNMi4yNSAyMi41QTIuMjUgMi4yNSAwIDAgMSAwIDIwLjI1VjIuNTgzQTIuMjUgMi4yNSAwIDAgMSAyLjI1LjMzM2g3LjA4M2wyLjMzNCAyLjMzNEgyNS43NUEyLjI1IDIuMjUgMCAwIDEgMjggNC45MTdWMjAuMjVhMi4yNSAyLjI1IDAgMCAxLTIuMjUgMi4yNUgyLjI1eiIKICAgICAgICAgIGZpbGw9InVybCgjZykiLz4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9Ii0xMy45MTciIHkxPSIxMS4zNTEiIHgyPSI3LjUzIiB5Mj0iMzguNDQzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM2QkJFRkUiLz4KICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIuOTk5IiBzdG9wLWNvbG9yPSIjNTlBQkZFIi8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KPC9zdmc+Cg==';
// eslint-disable-next-line max-len
const IconConfirm = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiB4PSIzNSIgeT0iMTgwIiBkYXRhLW5hbWU9ImFjY291bnRTZWxlY3QiCiAgICAgZGF0YS1zdmctaWQ9IjAwMzVmYmUxOWYiPgogICAgPHBhdGggZD0ibTYgMTIgNCA0IDgtOCIgc3Ryb2tlPSIjMUE3N0ZFIiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+Cg==';
// eslint-disable-next-line max-len
const IconCancel = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDE4IDE4IiB4PSIyOTMiIHk9IjE4MCIgZGF0YS1uYW1lPSJvcGVyYXRpb24tY2FuY2VsIiBkYXRhLXN2Zy1pZD0iYTM1OGI5YTFmMSI+CiAgICA8cGF0aCBkPSJNMTQuNjU3IDMuMzQzYS43NS43NSAwIDAgMSAwIDEuMDZMMTAuMDYgOWw0LjU5NiA0LjU5NmEuNzUuNzUgMCAxIDEtMS4wNiAxLjA2TDkgMTAuMDYybC00LjU5NiA0LjU5NmEuNzUuNzUgMCAxIDEtMS4wNi0xLjA2TDcuOTM4IDkgMy4zNDMgNC40MDRhLjc1Ljc1IDAgMCAxIDEuMDYtMS4wNkw5IDcuOTM4bDQuNTk2LTQuNTk2YS43NS43NSAwIDAgMSAxLjA2IDB6IiBmaWxsPSIjNTU1IiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KPC9zdmc+Cg==';

const { Text } = Typography;
export declare type Directory = {
  id: string
  name: string
}
export declare type DirectorySelectProps = {
  phrase?: string | undefined
  open?: boolean | undefined
  isCreate?: boolean | undefined
  request?: {
    getDirectoryList?: (parentId: string | undefined) => Promise<Directory[]> | undefined;
    create?: (parentId: string, name: string) => Promise<boolean> | undefined;
  } | undefined
  onCancel?: () => void | undefined
  onOk?: (value: string) => Promise<void> | undefined
};
const App: FC<DirectorySelectProps> = (props) => {
  const { token } = theme.useToken();
  const inputRef = React.createRef<HTMLInputElement>();
  const [loading, setLoading] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [directoryList, setDirectoryList] = useState([] as Directory[]);
  const [modal, setModal] = useState(false);
  const [rootPaths, setRootPaths] = useState([] as RootPath[]);
  const [directoryName, setDirectoryName] = useState('');
  const Directory = () => {
    return <div style={{
      width: 20,
      height: 20,
      marginRight: 6,
      display: 'flex',
      alignItems: 'center'
    }}>
      <img src={IconDirectory} style={{
        width: 18,
        display: 'block'
      }} alt=""/>
    </div>;
  };
  const requestDirectory = async () => {
    setLoading(true);
    const result = await props?.request?.getDirectoryList?.(rootPaths[rootPaths.length - 1]?.id);
    setLoading(false);
    if (result !== undefined) {
      setDirectoryList(result);
    }
  };
  const onSwitchPath = async (_id: string, index: number) => {
    setRootPaths(rootPaths.slice(0, index + 1));
  };
  const onOpen = async (fileId: string, name: string) => {
    setRootPaths([...rootPaths, {
      id: fileId,
      title: name
    }]);
  };
  const onConfirm = async () => {
    props?.onOk?.(rootPaths[rootPaths.length - 1]?.id);
  };
  const onCancelCreate = async () => {
    setIsCreate(false);
  };
  const onConfirmCreate = async () => {
    setLoading(true);
    const result = await props?.request?.create?.(rootPaths[rootPaths.length - 1]?.id || '', directoryName);
    setLoading(false);
    if (result !== undefined && result) {
      await requestDirectory();
      setIsCreate(false);
    }
  };
  useEffect(() => {
    inputRef?.current?.focus();
  }, [isCreate]);
  useEffect(() => {
    if (props?.open === true) {
      setRootPaths([{
        id: '',
        title: '根目录'
      }]);
    }
    setModal(props?.open || false);
  }, [props.open]);
  useEffect(() => {
    if (props?.open === true) {
      requestDirectory()
        .then();
    }
  }, [rootPaths]);
  return <>
    <Modal open={modal} width={380} title={<><span style={{ marginInlineStart: 10 }}>{props?.phrase || '移动'}到</span></>} onCancel={props?.onCancel} styles={{
      content: {
        padding: '15px 12px 15px 12px'
      },
      body: {
        padding: '0',
        borderBottom: '1px solid #eee',
        height: 356
      },
      footer: {
        textAlign: 'inherit'
      }
    }} onOk={onConfirm} okText={(props?.phrase || '移动') + '到此'} maskClosable={false} footer={(node) => {
      return <div style={{
        display: 'flex',
        alignItems: 'center',
        marginInlineStart: 10,
        userSelect: 'none'
      }}>
        <div style={{
          width: '100%',
          flex: 1
        }}>
          {props?.isCreate === false ? undefined : <a onClick={() => {
            setDirectoryName('');
            setIsCreate(true);
          }}>新建文件夹</a>}
        </div>
        <Space>
          {node}
        </Space>
      </div>;
    }}>
      <div>
        <FileNavigation style={{
          marginBottom: 4,
          marginLeft: 10,
          marginTop: 4
        }} paths={rootPaths} onSwitchPath={onSwitchPath}/>
        <Spin spinning={loading}>
          <div style={{
            maxHeight: 320,
            overflow: 'auto',
            marginBottom: 5
          }} className={css`
              .item:hover {
                  background: #efefef;
              }
          `}>
            {isCreate ? <>
              <div className="item" style={{
                height: 34,
                padding: '0 12px',
                display: 'flex',
                marginBottom: 2,
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                userSelect: 'none',
                borderRadius: token.borderRadius,
                overflow: 'hidden'
              }}>
                <Directory/>
                <div style={{ marginRight: '10px' }}>
                  <input
                    ref={inputRef as never}
                    style={{
                      outline: 'none',
                      border: '1px solid #d3d3d3',
                      padding: '3px 5px',
                      borderRadius: 2
                    }}
                    className={css`
                        :focus {
                            outline: 2px solid ${token.colorPrimary} !important;
                            border-color: ${token.colorPrimary};
                        }
                    `}
                    type="text"
                    value={directoryName}
                    onChange={(e) => setDirectoryName(e.target.value)}/>
                </div>
                <div style={{
                  backgroundImage: `url(${IconConfirm})`,
                  backgroundSize: '22px 22px',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: 22,
                  height: 22,
                  marginRight: 8,
                  borderRadius: 10,
                  overflow: 'hidden'
                }} className={css`
                    &:hover {
                        background: #ddd;
                    }
                `} onClick={onConfirmCreate}/>
                <div style={{
                  backgroundImage: `url(${IconCancel})`,
                  backgroundSize: '16px 16px',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  width: 22,
                  height: 22,
                  borderRadius: 10,
                  overflow: 'hidden'
                }} className={css`
                    &:hover {
                        background: #ddd;
                    }
                `} onClick={onCancelCreate}/>
              </div>
            </> : undefined}
            {directoryList.map(it => (
              <div key={it.id} className="item" style={{
                height: 30,
                padding: '0 12px',
                display: 'flex',
                marginBottom: 2,
                alignItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                userSelect: 'none',
                borderRadius: token.borderRadius,
                overflow: 'hidden'
              }} onDoubleClick={() => onOpen(it.id, it.name)}>
                <Directory/>
                <Text style={{
                  width: '100%',
                  fontSize: 13
                }} ellipsis={true}>{it.name}</Text>
              </div>
            ))}
          </div>
        </Spin>
      </div>
    </Modal>
  </>;
};
export default App;
