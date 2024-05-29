import React, { FC, ReactNode, useRef, useState } from 'react';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { App, Button, ConfigProvider, Divider, Input, message, Popconfirm, Space, Typography } from 'antd';
import { css } from '@emotion/css';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ElementUtils from 'beer-network/elementUtils';
import { Config } from '@/config';
import NetDiskDirectory, { DirectorySelectProps } from './DirectorySelect';
import FileNavigation from './FileNavigation';
import MIME from './mime';
// eslint-disable-next-line max-len
const IconDirectory = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSIyMyIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI4IDIzIiB4PSIxNTAiIHk9IjEzMCIKICAgICBkYXRhLW5hbWU9InNwYWNlYXJlYSIgZGF0YS1zdmctaWQ9ImVhMzFiMWYxMDAiPgogICAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiCiAgICAgICAgICBkPSJNMi4yNSAyMi41QTIuMjUgMi4yNSAwIDAgMSAwIDIwLjI1VjIuNTgzQTIuMjUgMi4yNSAwIDAgMSAyLjI1LjMzM2g3LjA4M2wyLjMzNCAyLjMzNEgyNS43NUEyLjI1IDIuMjUgMCAwIDEgMjggNC45MTdWMjAuMjVhMi4yNSAyLjI1IDAgMCAxLTIuMjUgMi4yNUgyLjI1eiIKICAgICAgICAgIGZpbGw9InVybCgjZykiLz4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9Ii0xMy45MTciIHkxPSIxMS4zNTEiIHgyPSI3LjUzIiB5Mj0iMzguNDQzIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM2QkJFRkUiLz4KICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIuOTk5IiBzdG9wLWNvbG9yPSIjNTlBQkZFIi8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KPC9zdmc+Cg==';
const { Text } = Typography;

export declare type FileItem = {
  id: string
  icon: ReactNode
  name: string
  size: string
  type: 'FILE' | 'DIRECTORY',
  typeName: string
  createTime?: string | undefined
  updateTime?: string | undefined
}
export declare type RootPath = {
  id: string
  title: string
}
export declare type FileItemTableProps = {
  request?: {
    getItems?: (params?: { parentId: string } | undefined) => Promise<FileItem[]>
    uploadFile?: (parentId: string, file: FileList) => Promise<boolean>
    getFileLink?: (fileId: string) => Promise<string | undefined>
    createDirectory?: (parentId: string, name: string) => Promise<boolean>
    rename?: (fileId: string, name: string) => Promise<boolean>
    remove?: (fileId: string[]) => Promise<boolean>
    move?: (fileIdList: string[], targetId: string) => Promise<boolean>
  } | undefined
  directoryProps?: DirectorySelectProps | undefined,
  uploadSize?: number | undefined
  uploadFormat?: string[] | undefined
  uploadFormatMessage?: string | ReactNode | undefined
};
const Component: FC<FileItemTableProps> = (props) => {
  const tableRef = useRef<ActionType>();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [directoryName, setDirectoryName] = useState('');
  const [newName, setNewName] = useState('');
  const [directoryModal, setDirectoryModal] = useState(false);
  const [selectItemList, setSelectItemList] = useState([] as string[]);
  const [rootPaths, setRootPaths] = useState([{
    id: '',
    title: '根目录'
  }] as RootPath[]);
  const columns = [
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      tooltip: <span style={{ fontSize: 12 }}>双击文件（目录）名称打开</span>,
      render: (_text: any, record: any) => (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }}>
          {record.icon}
          <div style={{
            width: '100%',
            flex: 1
          }}>
            <Text
              style={{
                width: '100%',
                fontSize: 13
              }}
              ellipsis={{ tooltip: record.name }}>
              <span className={css`
                  &:hover {
                      text-decoration: underline;
                  }
              `} onDoubleClick={() => onOpen(record.id, record.type, record.name)}>
                {record.name}
              </span>
            </Text>
          </div>
        </div>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'type',
      width: 100,
      key: 'type',
      render: (_: any, record: any) => (
        <>
          {record.typeName}
        </>
      )
    },
    {
      title: '大小',
      width: 90,
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      width: 165,
      key: 'updateTime'
    }
  ];

  const requestTable = async (params: {}): Promise<any> => {
    setLoading(true);
    const result = await props?.request?.getItems?.({
      ...params,
      parentId: rootPaths[rootPaths.length - 1]?.id || ''
    });
    setLoading(false);
    return {
      success: true,
      total: 20,
      data: result?.map(it => {
        if (it.type === 'DIRECTORY') {
          it.icon = <div style={{
            minWidth: 18,
            minHeight: 18,
            marginRight: 6,
            overflow: 'hidden',
            display: 'flex'
          }}>
            <img src={IconDirectory} style={{
              width: 18,
              display: 'block',
              alignItems: 'center'
            }} alt=""/>
          </div>;
        } else {
          const [typeName, icon] = MIME.parse(it.name) || [];
          it.typeName = typeName;
          it.icon = <div style={{
            minWidth: 20,
            minHeight: 20,
            marginRight: 4,
            overflow: 'hidden',
            display: 'flex'
          }}>
            <img src={icon} style={{
              width: 20,
              display: 'block',
              alignItems: 'center'
            }} alt=""/>
          </div>;
        }
        it.size = MIME.formatBytes(Number(it.size));
        return it;
      })
    };
  };
  const onUploadFile = async () => {
    const files = await ElementUtils.selectFile(true);
    if (files === null) {
      return;
    }
    setUploadLoading(true);
    try {
      for (const file of files) {
        if (props?.uploadFormat !== undefined) {
          const fileName = file.name;
          const fileExtension = fileName.split('.')
            ?.pop()
            ?.toLowerCase() || '';
          if (!props.uploadFormat?.includes(fileExtension)) {
            message.error(props?.uploadFormatMessage || `抱歉，文件${file.name}格式不受支持`);
            continue;
          }
        }
        // 文件大小限制
        const limitSize = (props?.uploadSize || 15);
        if (file.size > limitSize * 1024 * 1024) {
          message.error(`抱歉，文件大小超过了限制，请上传小于${limitSize}Mb 的文件`);
          continue;
        }
        message.info(`准备上传文件：${file.name}`);
        setLoading(true);
        // eslint-disable-next-line no-await-in-loop
        const result = await props?.request?.uploadFile?.(rootPaths[rootPaths.length - 1]?.id || '', files);
        setLoading(false);
        if (result !== undefined && result) {
          message.success('您已成功上传文件！');
          tableRef?.current?.reload();
        }
      }
    } finally {
      setUploadLoading(false);
    }
  };
  const onSwitchPath = async (_id: string, index: number) => {
    tableRef?.current?.clearSelected?.();
    setRootPaths(rootPaths.slice(0, index + 1));
    return tableRef?.current?.reload();
  };
  const onOpen = async (fileId: string, type: 'FILE' | 'DIRECTORY', name: string) => {
    if (type === 'FILE') {
      setLoading(true);
      const link = await props?.request?.getFileLink?.(fileId);
      setLoading(false);
      if (link === undefined) {
        return;
      }
      message.info('正在打开文件' + name);
      window.open(link);
    }
    if (type === 'DIRECTORY') {
      setLoading(true);
      setRootPaths([...rootPaths, {
        id: fileId,
        title: name
      }]);
      tableRef?.current?.clearSelected?.();
      await tableRef?.current?.reload();
      setLoading(false);
    }
  };
  const onConfirmCreateDirectory = async () => {
    setLoading(true);
    const result = await props?.request?.createDirectory?.(rootPaths[rootPaths.length - 1]?.id || '', directoryName);
    setLoading(false);
    if (result !== undefined && result) {
      message.success('新目录已成功创建！');
      tableRef?.current?.reload();
    }
  };
  const onConfirmRemove = async (fileIdList: string[]) => {
    setLoading(true);
    const result = await props?.request?.remove?.(fileIdList);
    setLoading(false);
    if (result !== undefined && result) {
      message.success('所有选定的项目已成功删除。');
      tableRef?.current?.clearSelected?.();
      tableRef?.current?.reload();
    }
  };
  const onConfirmRename = async (fileId: string) => {
    setLoading(true);
    const result = await props?.request?.rename?.(fileId, newName);
    setLoading(false);
    if (result !== undefined && result) {
      message.success('名字已成功更改！');
      tableRef?.current?.clearSelected?.();
      tableRef?.current?.reload();
    }
  };
  const onConfirmMove = async (targetId: string) => {
    if (selectItemList.length <= 0) {
      return;
    }
    const result = await props?.request?.move?.(selectItemList, targetId);
    if (result !== undefined && result) {
      message.success('文件或目录移动成功！');
      tableRef?.current?.clearSelected?.();
      tableRef?.current?.reload();
    }
  };
  return <>
    <App>
      <ConfigProvider theme={{
        token: {
          fontSize: 13
        },
        components: {
          Table: {
            motion: false,
            headerColor: '#333',
            rowHoverBg: '#f5f6f7',
            rowSelectedBg: '#f4f5f6',
            rowSelectedHoverBg: '#e6e7e8'
          },
          Button: {
            fontSize: 14
          }
        }
      }}>
        <ProTable<FileItem>
          className={css`
              user-select: none;

              .ant-pro-table-list-toolbar-container {
                  padding: 4px 0 10px 0;
              }

              .ant-pro-table-list-toolbar-right {
                  flex: 0;
                  padding-left: 10px;
              }

              .ant-table-thead {
                  & .ant-table-cell {
                      font-size: 13px;
                      padding: 5px !important;
                  }
              }

              .ant-table-tbody {
                  & .ant-table-cell {
                      font-size: 13px;
                      padding: 5px !important;
                  }
              }

              .ant-table-body {
                  min-height: 380px;
              }
          `}
          actionRef={tableRef}
          loading={loading}
          columns={columns}
          scroll={{
            x: true,
            y: 380
          }}
          rowSelection={{
            selections: false
          }}
          request={requestTable}
          size="small"
          rowKey="id"
          search={false}
          options={false}
          pagination={false}
          headerTitle={<>
            <FileNavigation paths={rootPaths} onSwitchPath={onSwitchPath}/>
          </>}
          tableAlertRender={({
            selectedRowKeys,
            selectedRows,
            onCleanSelected
          }) => {
            return (
              <>
                <span style={{ fontWeight: 600 }}>已选 {selectedRowKeys.length} 项</span>
                <Space size={2} style={{ marginInlineStart: 12 }}>
                  <a onClick={onCleanSelected}>
                    取消选择
                  </a>
                  {selectedRowKeys.length === 1 ? <>
                    <Divider type="vertical" style={{ background: '#ddd' }}/>
                    <Popconfirm
                      placement="bottom"
                      title={<span style={{ fontSize: 13 }}>请输入重命名名称</span>}
                      onConfirm={() => onConfirmRename(selectedRows[0]?.id)}
                      description={<div style={{ padding: '2px' }}>
                        <Input placeholder="请输入名称" style={{ fontSize: 13 }} maxLength={230} value={newName} onChange={(e) => setNewName(e.target.value)}/>
                      </div>}>
                      <a onClick={() => setNewName(selectedRows[0]?.name)}>
                        重命名{selectedRows[0].type === 'FILE' ? '文件' : '目录'}
                      </a>
                    </Popconfirm>
                  </> : undefined}
                </Space>
              </>
            );
          }}
          tableAlertOptionRender={({
            selectedRowKeys,
            selectedRows
          }) => {
            return (
              <Space size={16}>
                <a onClick={() => {
                  setDirectoryModal(true);
                  setSelectItemList(selectedRowKeys.map(it => it.toString()));
                }}>移动文件</a>
                <Popconfirm
                  icon={<QuestionCircleOutlined style={{ color: Config.colors.danger }}/>}
                  title={<span style={{
                    fontSize: 13
                  }}>确认删除</span>}
                  onConfirm={() => onConfirmRemove(selectedRows.map(it => it.id))}
                  description={<span style={{ fontSize: 13 }}>您确定要<span style={{
                    color: Config.colors.danger,
                    fontWeight: 500
                  }}>批量删除</span>这{selectedRows.length}个吗？</span>}>
                  <a style={{ color: Config.colors.danger }}>批量删除</a>
                </Popconfirm>
              </Space>
            );
          }}
          toolBarRender={() => [<>
            <Space size={5}>
              <Popconfirm
                placement="bottom"
                title={<span style={{ fontSize: 13 }}>请输入目录名称</span>}
                onConfirm={onConfirmCreateDirectory}
                description={<div style={{ padding: '2px' }}>
                  <Input placeholder="请输入目录名称" style={{ fontSize: 13 }} maxLength={230} value={directoryName} onChange={(e) => setDirectoryName(e.target.value)}/>
                </div>}>
                <Button type="dashed" onClick={() => setDirectoryName('')}>新建目录</Button>
              </Popconfirm>
              <Divider type="vertical" style={{ background: '#ccc' }}></Divider>
              <Button type="primary" onClick={onUploadFile} loading={uploadLoading}>上传文件</Button>
            </Space>
          </>]}
        />
        <NetDiskDirectory
          {...(props?.directoryProps || {})}
          open={directoryModal}
          onOk={async (directoryId) => {
            await onConfirmMove(directoryId);
            setDirectoryModal(false);
          }}
          onCancel={() => setDirectoryModal(false)}/>
      </ConfigProvider>
    </App>
  </>;
};
export default Component;
