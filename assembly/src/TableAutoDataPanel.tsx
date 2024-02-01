import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Badge, Button, Divider, Drawer, Flex, Input, List, message, Modal, Space, Spin, theme } from 'antd';
import { ActionType, BetaSchemaForm, ProTable } from '@ant-design/pro-components';
import { FormInstance } from 'antd/lib';
import ElementUtils from 'beer-network/elementUtils';
import { css } from '@emotion/css';

const G_VARIABLE = {
  searchFormParams: {},
  reset: () => {
    G_VARIABLE.searchFormParams = {};
  }
};
export declare type TableAutoDataPanelProps = {
  code: string
  request: {
    search<T>(code: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    config<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    exportTaskList<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    export<T>(code: string, fileName: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
  }
}
export declare type DataItem = {
  id: string | undefined
  key: string
  value: string
  description: string
};
export declare type TableConfig = {
  config: {
    search: boolean,
    authLoad: boolean,
    message: string,
    enableSearchForm: boolean,
    searchForm: { columns: { title?: string | ReactNode | undefined, enableTitleNode?: boolean | undefined }[] }[]
  } | undefined
  columns: { title: string, dataIndex: string, hideInSearch: boolean, hideInTable: boolean, tooltip: string, width: string }[]
}
export declare type ExportItem = {
  id: string
  name: string
  status: number
  url: string
  createTime: string
}
export declare type TableAutoDataPanelRef = {
  refresh(): void;
}
const App = forwardRef<TableAutoDataPanelRef, TableAutoDataPanelProps>((props, ref) => {
  const [abortController, setAbortController] = useState<AbortController>();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [code, setCode] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(0);

  const tableRef = useRef<ActionType>();
  const [tableConfig, setTableConfig] = useState({} as TableConfig);

  const [searchParams, setSearchParams] = useState({});
  const [searchIsLoading, setSearchIsLoading] = useState(false);

  const formRef = useRef<FormInstance>();

  const [isOpenExportNameModal, setIsOpenExportNameModal] = useState(false);
  const [exportName, setExportName] = useState('');

  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [isOpenExportModal, setIsOpenExportModal] = useState(false);
  const [exportList, setExportList] = useState([] as ExportItem[]);

  const requestTable = async (params: {}) => {
    setSearchIsLoading(true);
    setSearchParams({
      ...params,
      ...G_VARIABLE.searchFormParams,
      current: undefined,
      pageSize: undefined
    });
    return props.request.search<any>(code, {
      ...params,
      params: {
        ...params,
        ...G_VARIABLE.searchFormParams,
        current: undefined,
        pageSize: undefined
      }
    }, { signal: abortController?.signal })
      .then(result => {
        setSearchIsLoading(false);
        return result;
      })
      .catch(async message => {
        setSearchIsLoading(false);
        await messageApi.error(message);
      });
  };
  const requestTableConfig = async (code: string) => {
    return props.request.config<{ success: boolean, message: string, data: TableConfig }>(code, { signal: abortController?.signal })
      .then(result => {
        if (result.success) {
          setTableConfig(result.data);
        } else {
          messageApi.error(result.message);
        }
        return result;
      });
  };

  const onOpenExportList = async () => {
    setIsLoadingExport(true);
    props.request.exportTaskList<{ success: boolean, data: ExportItem[] }>(code, { signal: abortController?.signal })
      .then(result => {
        if (result.success) {
          setExportList(result.data);
          setIsOpenExportModal(true);
          setIsLoadingExport(false);
        }
      });
  };
  const onExport = async () => {
    Modal.confirm({
      title: '系统提示',
      content: <>导出数据为<b>完整数据</b>，导出时间较长请耐心等待</>,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setIsOpenExportNameModal(true);
        setExportName('');
      }
    });
  };
  const onConfirmExport = async () => {
    if (exportName.trim() === '') {
      return;
    }
    props.request.export<{ success: boolean, data: boolean, message: string }>(code, exportName.trim(), {
      params: { ...searchParams }
    }, { signal: abortController?.signal })
      .then(result => {
        if (result.success) {
          messageApi.success('提交导出请求成功');
          setIsOpenExportNameModal(false);
        } else {
          messageApi.error(result.message);
        }
      });
  };
  const onSearch = async () => {
    formRef.current?.submit();
  };
  const onDownloadFile = async (item: ExportItem) => {
    ElementUtils.download(item.url, item.name + '_' + (new Date().getTime()) + '.xlsx');
  };
  useImperativeHandle(ref, () => ({
    refresh: () => {
      abortController?.abort('to Page: ' + props.code);
      G_VARIABLE.reset();
      setSearchParams({});
      setAbortController(new AbortController());
    }
  }));
  useEffect(() => {
    if (abortController === undefined) {
      return;
    }
    requestTableConfig(props.code)
      .then(() => {
        setCode(props.code);
      });
  }, [abortController]);
  useEffect(() => {
    tableRef?.current?.reload();
  }, [code]);
  return (
    <>
      {contextHolder}
      {tableConfig.config === undefined ? undefined : <>
        {tableConfig.config?.message !== undefined && tableConfig.config?.message !== ''
          ? <Alert style={{ marginBottom: '15px' }} message={tableConfig.config?.message} type="info" showIcon/> : undefined}
        {tableConfig.config?.enableSearchForm === true ? <BetaSchemaForm<DataItem>
          layoutType="Form"
          formRef={formRef}
          style={{
            background: '#fff',
            padding: 20,
            marginBottom: 20,
            borderRadius: token.borderRadius
          }}
          className="search-beta-form"
          onFinish={async (formParams: {}) => {
            G_VARIABLE.searchFormParams = formParams;
            await tableRef.current?.reload();
            setCurrentPage(1);
          }}
          submitter={{
            render: () => {
              return <Flex style={{ justifyContent: 'flex-end' }}>
                <Space size={12}>
                  <Button type="primary" onClick={onSearch} loading={searchIsLoading}>查询</Button>
                  <Button onClick={() => {
                    formRef.current?.resetFields();
                  }}>重置</Button>
                </Space>
              </Flex>;
            }
          }}
          columns={(tableConfig.config?.searchForm || []).map(it => {
            it.columns = it.columns.map(column => {
              if (column.enableTitleNode) {
                column.title = React.createElement('div', {
                  dangerouslySetInnerHTML: { __html: column.title }
                });
              }
              return column;
            });
            return it as {};
          })}/> : undefined}
        <ProTable<DataItem>
          actionRef={tableRef}
          columns={(tableConfig.columns as any[]).map(it => {
            if (it.renderContent !== undefined) {
              return {
                ...it,
                render: (value: never, record: {}, _index: any) => {
                  let element = it.renderContent.replace('#{value}', value);
                  for (const key of Object.keys(record)) {
                    element = element.replace(`#{${key}}`, (record as any)[key]);
                  }
                  return React.createElement('div', {
                    dangerouslySetInnerHTML: { __html: element }
                  });
                }
              };
            }
            return it as {};
          })}
          scroll={{ x: 'max-content' }}
          request={requestTable}
          size="small"
          rowKey="id"
          search={tableConfig.config?.search ? {
            layout: 'vertical',
            defaultCollapsed: false,
            searchGutter: 10,
            className: 'table-search'
          } : false}
          options={false}
          headerTitle={false}
          pagination={{
            current: currentPage,
            onChange: (page) => setCurrentPage(page)
          }}
          toolBarRender={() => [
            <>
              <Button type="primary" onClick={onExport}>
                导出表格
              </Button>
              <Divider type="vertical" style={{ background: '#bbb' }}/>
              <Button onClick={() => onOpenExportList()}>历史记录</Button>
            </>
          ]}
        />
      </>}
      <Drawer
        open={isOpenExportModal}
        onClose={() => setIsOpenExportModal(false)}
        title="导出历史记录"
        styles={{ body: { padding: '10px 0' } }}>
        <Spin spinning={isLoadingExport}>
          <List style={{ padding: '0 20px' }}>
            {exportList.map(item => (
              <List.Item key={item.id} className={css`
                  :hover {
                      background: #efefef;
                  }
              `}>
                <div className={css`
                    padding: 0 12px;

                    & p {
                        margin: 0;
                    }
                `}>
                  {item.status === 0 || item.status === 1 ? <Badge status="processing" text={<span style={{ fontSize: '13px' }}>正在导出</span>}/> : undefined}
                  {item.status === 2 ? <Badge status="success" text={<span style={{ fontSize: '13px' }}>导出成功</span>}/> : undefined}
                  {item.status === 9 ? <Badge status="error" text={<span style={{ fontSize: '13px' }}>导出失败</span>}/> : undefined}
                  <div style={{ paddingLeft: '14px' }}>
                    <p className={css`
                        font-weight: 500;
                    `}>{item.name || '自定义报表'}</p>
                    <p className={css`
                        color: #999;
                        font-size: 12px;
                    `}>导出时间：{item.createTime}</p>
                    <div>
                      {item.status === 2 ? <a className={css`
                          font-size: 13px;
                          margin-top: 4px;
                      `} onClick={() => onDownloadFile(item)}>下载文件</a> : undefined}
                    </div>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>
        </Spin>
      </Drawer>
      <Modal
        open={isOpenExportNameModal}
        title="导出文件名称"
        onOk={onConfirmExport}
        onCancel={() => setIsOpenExportNameModal(false)}
        width="360px"
        styles={{ body: { padding: '12px 0' } }}
      >
        <Input placeholder="请输入文件名名称" value={exportName} onChange={(e) => setExportName(e.target.value)}></Input>
      </Modal>
    </>
  );
});
export default App;
