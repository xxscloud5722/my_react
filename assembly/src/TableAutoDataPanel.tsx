import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Badge, Button, Divider, Drawer, Flex, Input, List, message, Modal, Radio, Space, Spin, Tabs, theme } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ActionType, BetaSchemaForm, ProTable } from '@ant-design/pro-components';
import { FormInstance } from 'antd/lib';
import ElementUtils from 'beer-network/elementUtils';
import { css } from '@emotion/css';
import { Config } from './config';
import ImportModal, { ImportData } from './ImportModal';
import NetDiskDirectory, { DirectorySelectProps } from './DirectorySelect';

const G_VARIABLE = {
  searchFormParams: {} as any,
  formParams: () => {
    return { ...G_VARIABLE.searchFormParams };
  },
  reset: () => {
    G_VARIABLE.searchFormParams = {};
  }
};
export declare type TableAutoDataPanelProps = {
  code: string
  request: {
    search<T>(code: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    config<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    statistics<T>(code: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    dataList<T>(code: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    exportTaskList<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    importTaskList<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    export<T>(code: string, exportCode: string, fileName: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    importData<T>(code: string, importExcel: ImportData, option: { signal: AbortSignal | undefined }): Promise<T>
    getDownloadUrl(value: string, fileName: string, option: { signal: AbortSignal | undefined }): Promise<string | undefined>
    saveExport(code: string, exportId: string, directoryId: string, option: { signal: AbortSignal | undefined }): Promise<boolean | undefined>
  }
  directoryProps?: DirectorySelectProps | undefined,
}
export declare type DataItem = {
  id: string | undefined
  key: string
  value: string
  description: string
};
export declare type TableConfig = {
  name: string
  config: {
    search: boolean,
    authLoad: boolean,
    message: string,
    enableSearchForm: boolean,
    searchForm: {
      columns: {
        title?: string | ReactNode | undefined,
        enableTitleNode?: boolean | undefined,
        key: string,
        valueType: string,
        valueCode: string,
        valueEnum: {},
        listening: string | undefined
      }[]
    }[],
    modules: string[]
    exportConfig: { code: string, label: string }[],
    importConfig: { url: string | undefined, message: string | undefined } | undefined,
    statistics: { loading: string, code: string } | undefined
    groups: { key: string, label: string }[]
  } | undefined
  columns: { title: string, dataIndex: string, hideInSearch: boolean, hideInTable: boolean, tooltip: string, width: string, groupId: string | undefined }[]
}
export declare type ExportItem = {
  id: string
  name: string
  status: number
  url: string
  createTime: string
}
export declare type ImportItem = {
  id: string
  fileName: string
  status: number
  totalNumber: number
  successNumber: number
  invalidDataUrl: string
  createTime: string
}
export declare type TableAutoDataPanelRef = {
  refresh(): void;
}
export declare type Statistics = {
  title?: string | undefined
  status: 'SUCCESS' | 'FAIL' | ''
  message?: string | undefined
  detail?: string | undefined
};
const App = forwardRef<TableAutoDataPanelRef, TableAutoDataPanelProps>((props, ref) => {
  const [abortController, setAbortController] = useState<AbortController>();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [code, setCode] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);

  const tableRef = useRef<ActionType>();
  const [tableConfig, setTableConfig] = useState({} as TableConfig);
  const [statistics, setStatistics] = useState({} as Statistics);

  const [searchParams, setSearchParams] = useState({});
  const [searchIsLoading, setSearchIsLoading] = useState(false);

  const formRef = useRef<FormInstance>();

  const [isOpenExportNameModal, setIsOpenExportNameModal] = useState(false);
  const [isOpenExportModal, setIsOpenExportModal] = useState(false);
  const [exportFile, setExportFile] = useState({
    active: 'DEFAULT',
    name: ''
  });

  const [isOpenImportModal, setIsOpenImportModal] = useState(false);

  const [tableGroupActive, setTableGroupActive] = useState('');

  const [tabsActive, setTabsActive] = useState('00' as '00' | 'EXPORT' | 'IMPORT');
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);

  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [importList, setImportList] = useState([] as ImportItem[]);

  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [exportList, setExportList] = useState([] as ExportItem[]);

  const [exportItemId, setExportItemId] = useState('');
  const [exportDirectoryModal, setExportDirectoryModal] = useState(false);

  const requestTable = async (params: {}) => {
    requestStatistics()
      .then();
    setSearchIsLoading(true);
    const requestParams = {
      ...params,
      ...G_VARIABLE.formParams(),
      tableGroupCode: tableConfig.config?.groups !== undefined ? tableGroupActive : undefined,
      current: undefined,
      pageSize: undefined
    } as any;
    setSearchParams({ ...requestParams });
    return props.request.search<any>(code, {
      ...params,
      params: requestParams
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
  const requestStatistics = async () => {
    if (tableConfig.config?.statistics?.code === undefined || tableConfig.config?.statistics?.code === '') {
      return;
    }
    setStatistics({ status: '' });
    const result = await props?.request?.statistics<{
      success: boolean,
      message: string,
      data: { status: never, message: string, detail: string }
    }>(tableConfig.config?.statistics?.code || '', {}, { signal: abortController?.signal });
    if (result.success) {
      setStatistics({
        ...statistics,
        ...result.data
      });
    } else {
      setStatistics({
        status: 'FAIL',
        message: result.message
      });
    }
  };
  const requestSelectValue = async (valueCode: string, params?: {} | undefined): Promise<{ label: string, value: string }[]> => {
    /* eslint-disable no-await-in-loop */
    const selectResult = await props.request?.dataList<{
      success: boolean,
      message: string,
      data: { label: string, value: string }[]
    }>?.(valueCode, { ...(params || {}) }, { signal: abortController?.signal });
    if (!selectResult.success) {
      messageApi.error(selectResult.message);
      return [];
    }
    return selectResult.data;
  };
  const requestTableConfig = async (code: string) => {
    return props.request.config<{ success: boolean, message: string, data: TableConfig }>(code, { signal: abortController?.signal })
      .then(async result => {
        if (result.success) {
          if ((result.data.config?.searchForm || []).length > 0) {
            const columns = result.data.config?.searchForm[0].columns || [];
            for (const it of columns) {
              if (it.valueType === 'select' && it.valueCode !== undefined && it.valueCode !== '') {
                const selectItem: any = {};
                (await requestSelectValue(it.valueCode)).forEach(it => {
                  selectItem[it.value] = {
                    text: it.label,
                    status: it.value
                  };
                });
                it.valueEnum = selectItem;
              }
            }
          }

          G_VARIABLE.reset();
          setCurrentPage(1);
          setTabsActive('00');
          setTableConfig(result.data);
          rendering(result.data);
        } else {
          messageApi.error(result.message);
        }
        return result;
      });
  };
  const parseFormValue = (value: any) => {
    const params: any = { ...value };
    const formItems = tableConfig.config?.searchForm[0]?.columns;
    for (const key of Object.keys(params)) {
      const keyId = key.split('---')[1];
      const value = params[key];
      const formItem = formItems?.find(it => it.key.split('---')[1] === keyId);
      if (formItem === undefined) {
        continue;
      }
      if ((formItem.valueType || '').indexOf('date') <= -1) {
        continue;
      }
      if (Array.isArray(value) && value.length > 0) {
        const end = new Date(value[1]);
        end.setDate(end.getDate() + 1);
        params[key] = [value[0], end.getFullYear() + '-'
        + (end.getMonth() + 1).toString()
          .padStart(2, '0') + '-'
        + end.getDate()
          .toString()
          .padStart(2, '0')];
      }
    }
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value !== null && value !== undefined && Array.isArray(value) && value.length <= 0) {
        params[key] = null;
      }
    }
    const result: any = {};
    for (const key of Object.keys(params)) {
      const keyId: string | undefined = key.split('---')[1];
      if (keyId !== undefined) {
        result[keyId] = params[key];
      } else {
        result[key] = params[key];
      }
    }
    return result;
  };
  const rendering = (tableConfig: TableConfig) => {
    if (tableConfig.config?.groups !== undefined) {
      const key = tableConfig.config?.groups[0].key;
      setTableGroupActive(key);
    }
  };
  const refreshByTabActive = () => {
    if (tabsActive === 'IMPORT') {
      setIsLoadingImport(true);
      props.request.importTaskList<{ success: boolean, data: ImportItem[] }>(code, { signal: abortController?.signal })
        .then(result => {
          if (result.success) {
            setImportList(result.data);
            setIsLoadingImport(false);
          }
        });
      return;
    }
    if (tabsActive === 'EXPORT') {
      setIsLoadingExport(true);
      props.request.exportTaskList<{ success: boolean, data: ExportItem[] }>(code, { signal: abortController?.signal })
        .then(result => {
          if (result.success) {
            setExportList(result.data);
            setIsLoadingExport(false);
          }
        });
    }
  };
  const onOpenHistoryList = async () => {
    setIsOpenHistoryModal(true);
    if (tabsActive === '00') {
      if ((tableConfig.config?.modules || []).indexOf('IMPORT') > -1) {
        setTabsActive('IMPORT');
      } else if ((tableConfig.config?.modules || []).indexOf('EXPORT') > -1) {
        setTabsActive('EXPORT');
      }
    } else {
      refreshByTabActive();
    }
  };
  const onImport = async () => {
    setIsOpenImportModal(true);
  };
  const onConfirmImport = async (excelData: ImportData) => {
    return props.request.importData<{ success: boolean, data: boolean, message: string }>(
      code,
      excelData,
      { signal: abortController?.signal }
    );
  };
  const onExport = async () => {
    const total = tableRef.current?.pageInfo?.total || 0;
    if (total <= 0) {
      Modal.error({
        title: '系统提示',
        content: <>请先<b>查询数据</b>后，才能导出表格</>
      });
      return;
    }
    const exportConfig = tableConfig.config?.exportConfig;
    if (exportConfig === undefined) {
      Modal.confirm({
        title: '系统提示',
        content: <>将按照默认方式导出数据，导出时间较长请耐心等待</>,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          setIsOpenExportNameModal(true);
          setExportFile({
            ...exportFile,
            name: ''
          });
        }
      });
      return;
    }
    if (tableConfig.config?.exportConfig?.length === 1) {
      Modal.confirm({
        title: '系统提示',
        content: <>将导出<span style={{ fontWeight: 500 }}>《{tableConfig.config.exportConfig[0].label}》</span>数据，导出时间较长请耐心等待</>,
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          setIsOpenExportNameModal(true);
          setExportFile({
            ...exportFile,
            active: exportConfig[0].code || '',
            name: ''
          });
        }
      });
      return;
    }
    setExportFile({
      ...exportFile,
      active: exportConfig[0].code || ''
    });
    setIsOpenExportModal(true);
  };
  const onConfirmExport = async () => {
    if (exportFile.name.trim() === '') {
      return;
    }
    props.request.export<{ success: boolean, data: boolean, message: string }>(code, exportFile.active.trim(), exportFile.name.trim(), {
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
  const onConfirmSaveExport = async (directoryId: string) => {
    if (exportItemId === '') {
      return false;
    }
    const result = await props?.request?.saveExport?.(code, exportItemId, directoryId, { signal: abortController?.signal });
    if (result === true) {
      await messageApi.success('提交任务成功！');
    } else {
      await messageApi.error('提交任务失败，请联系服务商');
    }
    return result || false;
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
  useEffect(() => {
    refreshByTabActive();
  }, [tabsActive]);
  useEffect(() => {
    setCurrentPage(1);
    tableRef?.current?.reload();
  }, [tableGroupActive]);
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
            G_VARIABLE.searchFormParams = parseFormValue(formParams);
            await tableRef.current?.reload();
            setCurrentPage(1);
          }}
          onValuesChange={async (formParams) => {
            const params = parseFormValue(formParams);
            const searchForm = tableConfig.config?.searchForm?.map(it => {
              return {
                ...it,
                key: '_' + (new Date().getTime())
              };
            });
            const formItems = searchForm?.[0]?.columns;
            const keys = Object.keys(params);
            const listeningFormItems = formItems?.filter(it => it.listening !== undefined && it.listening !== ''
              && it.valueCode !== undefined && it.valueCode !== '' && keys.indexOf(it.listening) > -1);
            if (listeningFormItems !== undefined && listeningFormItems.length > 0) {
              for (const formItem of listeningFormItems) {
                const selectItem: any = {};
                (await requestSelectValue(formItem.valueCode, params)).forEach(it => {
                  selectItem[it.value] = {
                    text: it.label,
                    status: it.value
                  };
                });
                formItem.valueEnum = selectItem;
              }
              setTableConfig({
                ...tableConfig,
                config: {
                  ...tableConfig.config,
                  searchForm: searchForm as never
                } as never
              });
            }
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
              // 避免控件没有被清理
              if (column.key.indexOf('---') <= -1) {
                column.key = (new Date().getTime()) + '---' + column.key;
              }
              return column;
            });
            return it as never;
          })}/> : undefined}
        <ProTable<DataItem>
          actionRef={tableRef}
          columns={(tableConfig.columns as any[]).filter(it => {
            return it.groupId === undefined || it.groupId === tableGroupActive;
          })
            .map(it => {
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
          headerTitle={<>{tableConfig?.config?.statistics ? <div className={css`
              font-size: 14px;
              font-weight: normal;
              display: flex;
              align-items: center;
              padding-left: 12px;
          `}>
            {statistics?.status === undefined || statistics?.status === '' ? <>
              <Spin style={{ marginRight: 8 }} indicator={<LoadingOutlined style={{ fontSize: 14 }} spin/>}/>
              {tableConfig?.config?.statistics?.loading}
            </> : undefined}
            {statistics?.status === 'SUCCESS' ? <>
              <Badge style={{
                marginRight: 8,
                marginTop: -1
              }} color="green"/> {statistics?.message}
            </> : undefined}
            {statistics?.status === 'FAIL' ? <>
              <Badge style={{
                marginRight: 8,
                marginTop: -1
              }} color="red"/>
              {statistics?.message}
              &nbsp;
              {statistics?.detail !== undefined && statistics?.detail !== '' ? <a onClick={() => {
                Modal.error({
                  title: statistics?.title || '系统异常',
                  content: React.createElement('div', {
                    dangerouslySetInnerHTML: { __html: statistics?.detail?.replace(/\n/g, '<br/>') || '' }
                  })
                });
              }}>查看详情</a> : undefined}
            </> : undefined}
          </div> : undefined}{(tableConfig?.config?.groups || []).length > 0 ? <Radio.Group buttonStyle="solid" value={tableGroupActive} className={css`
              label {
                  font-weight: normal;
              }
          `} onChange={(e) => {
            setTableGroupActive(e.target.value);
          }} disabled={searchIsLoading}>
            {(tableConfig?.config?.groups || []).map(it => (
              <Radio.Button value={it.key} key={it.key}>{it.label}</Radio.Button>
            ))}
          </Radio.Group> : undefined}
          </>}
          pagination={{
            current: currentPage,
            onChange: (page) => setCurrentPage(page)
          }}
          toolBarRender={() => [
            <>
              {(tableConfig.config?.modules || []).indexOf('IMPORT') > -1 ? <Button type="primary" onClick={onImport}>
                导入数据
              </Button> : undefined}
              {((tableConfig.config?.modules || []).indexOf('IMPORT') > -1 && (tableConfig.config?.modules || []).indexOf('EXPORT') > -1)
                ? <Divider type="vertical" style={{ background: '#bbb' }}/> : undefined}
              {(tableConfig.config?.modules || []).indexOf('EXPORT') > -1 ? <Button type="primary" onClick={onExport}>
                导出表格
              </Button> : undefined}
              {((tableConfig.config?.modules || []).indexOf('IMPORT') > -1 || (tableConfig.config?.modules || []).indexOf('EXPORT') > -1)
                ? <>
                  <Divider type="vertical" style={{ background: '#bbb' }}/>
                  <Button onClick={() => onOpenHistoryList()}>历史记录</Button>
                </> : undefined}
            </>
          ]}
        />
      </>}
      <Drawer
        closeIcon={false}
        open={isOpenHistoryModal}
        onClose={() => setIsOpenHistoryModal(false)}
        title="历史记录"
        styles={{
          body: { padding: '0 16px' },
          header: { padding: '12px 16px' }
        }}>
        <Tabs
          items={
            [
              {
                key: 'IMPORT',
                label: '导入记录',
                children: <Spin spinning={isLoadingImport}>
                  <List>
                    {importList.map(item => (
                      <List.Item key={item.id} className={css`
                          :hover {
                              background: #efefef;
                          }
                      `}>
                        <div className={css`
                            padding: 0 10px;

                            & p {
                                margin: 0;
                            }
                        `}>
                          {item.status === 0 || item.status === 1 ? <Badge status="processing" text={<span style={{ fontSize: '13px' }}>正在导入</span>}/> : undefined}
                          {item.status === 2 ? <Badge status="success" text={<span style={{ fontSize: '13px' }}>导入执行完成</span>}/> : undefined}
                          {item.status === 5 ? <Badge status="error" text={<span style={{ fontSize: '13px' }}>导入失败</span>}/> : undefined}
                          <div style={{ paddingLeft: '14px' }}>
                            <p className={css`
                                font-weight: 500;
                            `}>{item.fileName || '未知的文件.xlsx'}</p>
                            {item.status === 2 ? <p className={css`
                                color: #333;
                                font-size: 12px;
                            `}>
                              总共：<span style={{ fontWeight: 500 }}>{item.totalNumber}条</span>，
                              已导入：
                              <span style={{
                                fontWeight: 500,
                                color: Config.colors.success
                              }}>{item.successNumber}条</span>，
                              失败：
                              <span style={{
                                fontWeight: 500,
                                color: Config.colors.danger
                              }}>{item.totalNumber - item.successNumber}条</span>
                            </p> : undefined}
                            <p className={css`
                                color: #999;
                                font-size: 12px;
                            `}>导入时间：{item.createTime}</p>
                            <div>
                              {item.status === 2 && item.invalidDataUrl !== '' ? <div className={css`
                                  font-size: 13px;
                                  margin-top: 4px;
                              `}>
                                <a onClick={() => {
                                  const fileName = item.fileName + '_' + (new Date().getTime()) + '.xlsx';
                                  props?.request?.getDownloadUrl(item.invalidDataUrl, fileName, { signal: abortController?.signal })
                                    .then(downloadUrl => {
                                      if (downloadUrl === undefined) {
                                        return messageApi.error('获取下载地址失败，请稍后重试。');
                                      }
                                      ElementUtils.download(downloadUrl, encodeURIComponent(fileName));
                                      return undefined;
                                    });
                                }}>下载失败数据</a>
                              </div> : undefined}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    ))}
                  </List>
                </Spin>
              },
              {
                key: 'EXPORT',
                label: '导出记录',
                children: <Spin spinning={isLoadingExport}>
                  <List>
                    {exportList.map(item => (
                      <List.Item key={item.id} className={css`
                          :hover {
                              background: #efefef;
                          }
                      `}>
                        <div className={css`
                            padding: 0 10px;

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
                              {item.status === 2 ? <Space size={6} className={css`
                                  font-size: 13px;
                                  margin-top: 4px;
                              `}>
                                <a onClick={async () => {
                                  setIsLoadingExport(true);
                                  const fileName = item.name + '_' + (new Date().getTime()) + '.xlsx';
                                  props?.request?.getDownloadUrl(item.url, fileName, { signal: abortController?.signal })
                                    .then(it => {
                                      setIsLoadingExport(false);
                                      return it;
                                    })
                                    .then(downloadUrl => {
                                      if (downloadUrl === undefined) {
                                        return messageApi.error('获取下载地址失败，请稍后重试。');
                                      }
                                      ElementUtils.download(downloadUrl, encodeURIComponent(fileName));
                                      return undefined;
                                    });
                                }}>下载文件</a>
                                <Divider type="vertical" style={{ background: '#eee' }}/>
                                <a onClick={() => {
                                  setExportItemId(item.id);
                                  setExportDirectoryModal(true);
                                }}>保存到网盘</a>
                              </Space> : undefined}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    ))}
                  </List>
                </Spin>
              }
            ].filter(it => (it.key === 'IMPORT' && (tableConfig.config?.modules || []).indexOf('IMPORT') > -1) || (
              it.key === 'EXPORT' && (tableConfig.config?.modules || []).indexOf('EXPORT') > -1))
          }
          activeKey={tabsActive}
          onChange={(e) => setTabsActive(e as never)}
          className={css`
              .ant-tabs-nav {
                  margin: 0 !important;
              }
          `}/>
      </Drawer>
      <Modal
        open={isOpenExportNameModal}
        title="导出文件名称"
        onOk={onConfirmExport}
        onCancel={() => setIsOpenExportNameModal(false)}
        width="360px"
        styles={{ body: { padding: '12px 0' } }}
      >
        <Input placeholder="请输入文件名名称" value={exportFile.name} onChange={(e) => setExportFile({
          ...exportFile,
          name: e.target.value
        })}></Input>
      </Modal>
      <ImportModal
        open={isOpenImportModal}
        onCancel={async () => setIsOpenImportModal(false)}
        request={async (importData) => onConfirmImport(importData)}
        onDownloadTemplate={async () => {
          const importConfig = tableConfig.config?.importConfig;
          if (importConfig === undefined) {
            await messageApi.info('暂无模板数据，请联系管理员添加');
            return;
          }
          if (importConfig.url !== undefined && importConfig.url !== '') {
            const fileName = (tableConfig.name || '') + '-模板文件.xlsx';
            props?.request?.getDownloadUrl(importConfig.url, fileName, { signal: abortController?.signal })
              .then(downloadUrl => {
                if (downloadUrl === undefined) {
                  return messageApi.error('获取下载地址失败，请稍后重试。');
                }
                ElementUtils.download(downloadUrl, encodeURIComponent(fileName));
                return undefined;
              });
            return;
          }
          if (importConfig.message !== undefined && importConfig.message !== '') {
            await messageApi.info(React.createElement('span', {
              dangerouslySetInnerHTML: { __html: importConfig.message }
            }));
          }
        }}/>
      <Modal
        open={isOpenExportModal}
        title="数据导出"
        onCancel={() => {
          setIsOpenExportModal(false);
        }}
        onOk={() => {
          setIsOpenExportModal(false);
          setIsOpenExportNameModal(true);
          setExportFile({
            ...exportFile,
            name: ''
          });
        }}
        width="400px"
        styles={{ body: { padding: '12px 0' } }}>
        <Radio.Group onChange={(e) => {
          setExportFile({
            ...exportFile,
            active: e.target.value
          });
        }} value={exportFile.active}>
          <Space direction="vertical">
            {tableConfig?.config?.exportConfig?.map(item => (
              <Radio key={item.code} value={item.code}>{item.label}</Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
      <NetDiskDirectory
        {...(props?.directoryProps || {})}
        open={exportDirectoryModal}
        onOk={async (directoryId) => {
          const result = await onConfirmSaveExport(directoryId);
          if (result) {
            setExportDirectoryModal(false);
          }
        }}
        onCancel={() => setExportDirectoryModal(false)}/>
    </>
  );
});
export default App;
