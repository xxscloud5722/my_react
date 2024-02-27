import React, { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Badge, Button, Divider, Drawer, Flex, Input, List, message, Modal, Radio, Space, Spin, Tabs, theme } from 'antd';
import { ActionType, BetaSchemaForm, ProTable } from '@ant-design/pro-components';
import { FormInstance } from 'antd/lib';
import * as XLSX from 'xlsx';
import ElementUtils from 'beer-network/elementUtils';
import { css } from '@emotion/css';
import { Config } from './config';

const G_VARIABLE = {
  searchFormParams: {},
  importExcel: {
    fileName: '',
    sheets: []
  } as ImportData,
  formParams: () => {
    const result: any = {};
    for (const key of Object.keys(G_VARIABLE.searchFormParams)) {
      const keys = key.split('---');
      if (keys.length > 1) {
        result[keys[1]] = (G_VARIABLE.searchFormParams as any)[key];
      }
    }
    return result;
  },
  reset: () => {
    G_VARIABLE.searchFormParams = {};
    G_VARIABLE.importExcelReset();
  },
  importExcelReset: () => {
    G_VARIABLE.importExcel = {
      fileName: '',
      sheets: []
    };
  }
};
export declare type TableAutoDataPanelProps = {
  code: string
  request: {
    search<T>(code: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    config<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    exportTaskList<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    importTaskList<T>(code: string, option: { signal: AbortSignal | undefined }): Promise<T>
    export<T>(code: string, exportCode: string, fileName: string, params: {}, option: { signal: AbortSignal | undefined }): Promise<T>
    importData<T>(code: string, importExcel: ImportData, option: { signal: AbortSignal | undefined }): Promise<T>;
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
    searchForm: { columns: { title?: string | ReactNode | undefined, enableTitleNode?: boolean | undefined, key: string }[] }[],
    modules: string[]
    exportConfig: { code: string, label: string }[],
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
export declare type ImportData = {
  fileName: string,
  sheets: { index: number, name: string, items: any[] }[]
};
const App = forwardRef<TableAutoDataPanelRef, TableAutoDataPanelProps>((props, ref) => {
  const [abortController, setAbortController] = useState<AbortController>();
  const { token } = theme.useToken();
  const [messageApi, contextHolder] = message.useMessage();
  const [code, setCode] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);

  const tableRef = useRef<ActionType>();
  const [tableConfig, setTableConfig] = useState({} as TableConfig);

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
  const [importFile, setImportFile] = useState(
    {} as { file?: FileList | undefined, message?: string | undefined, loading?: boolean | undefined, sheets?: { name: string, number: number, index: number }[] | undefined }
  );

  const [tabsActive, setTabsActive] = useState('00' as '00' | 'EXPORT' | 'IMPORT');
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);

  const [isLoadingImport, setIsLoadingImport] = useState(false);
  const [importList, setImportList] = useState([] as ImportItem[]);

  const [isLoadingExport, setIsLoadingExport] = useState(false);
  const [exportList, setExportList] = useState([] as ExportItem[]);

  const requestTable = async (params: {}) => {
    setSearchIsLoading(true);
    setSearchParams({
      ...params,
      ...G_VARIABLE.formParams(),
      current: undefined,
      pageSize: undefined
    });
    return props.request.search<any>(code, {
      ...params,
      params: {
        ...params,
        ...G_VARIABLE.formParams(),
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

  const rendering = (tableConfig: TableConfig) => {
    console.log(tableConfig);
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
  const onExport = async () => {
    const total = tableRef.current?.pageInfo?.total || 0;
    if (total <= 0) {
      Modal.confirm({
        title: '系统提示',
        content: <>请先<b>查询数据</b>后，才能导出表格</>,
        okText: '确定',
        cancelText: '取消'
      });
      return;
    }
    if (tableConfig.config?.exportConfig === undefined) {
      Modal.confirm({
        title: '系统提示',
        content: <>导出数据为<b>完整数据</b>，导出时间较长请耐心等待</>,
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
    setExportFile({
      ...exportFile,
      active: tableConfig.config.exportConfig?.[0].code || ''
    });
    setIsOpenExportModal(true);
  };
  const onImport = async () => {
    setIsOpenImportModal(true);
    setImportFile({});
  };
  const onAnalyseImportFile = async () => {
    const file = await ElementUtils.selectFile();
    if (file == null) {
      return;
    }
    if (!file[0].name.endsWith('.xlsx') && !file[0].name.endsWith('.xls')) {
      setImportFile({
        message: '选择的文件格式不正确，请重新选择！'
      });
      return;
    }
    if (file[0].size / (1024 * 1024) > 15) {
      setImportFile({
        message: '选择的文件超过最大限制 （15MB）'
      });
      return;
    }
    setImportFile({
      file,
      loading: true
    });
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target === null) {
        setImportFile({ message: '解析文件失败，请上传模板文件' });
        return;
      }
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, {
          type: 'array',
          raw: true
        });
        G_VARIABLE.importExcelReset();
        G_VARIABLE.importExcel.fileName = file[0].name;
        setImportFile({
          file,
          loading: false,
          sheets: workbook.SheetNames.map((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            debugger;
            G_VARIABLE.importExcel.sheets.push({
              index,
              name: sheetName,
              items: jsonData.map((it: any) => {
                const v: any = {};
                for (const key of Object.keys(it)) {
                  v[key] = String(it[key]);
                }
                return v;
              })
            });
            return {
              index,
              name: sheetName,
              number: jsonData.length
            };
          })
        });
      } catch (ex) {
        console.log(ex);
        setImportFile({ message: '解析文件失败，请上传模板文件' });
      }
    };
    reader.readAsArrayBuffer(file[0]);
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
  const onConfirmImport = async () => {
    if (importFile.file === undefined) {
      setImportFile({
        ...importFile,
        message: '请先选择需要导入的文件！'
      });
      return;
    }
    if (G_VARIABLE.importExcel.sheets.filter(sheet => sheet.items.length > 0).length === 0) {
      setImportFile({
        ...importFile,
        message: '导入的文件无有效数据，请关闭后重新导入！'
      });
      return;
    }
    setImportFile({
      ...importFile,
      message: undefined,
      loading: true
    });
    const result = await props.request.importData<{ success: boolean, data: boolean, message: string }>(
      code,
      G_VARIABLE.importExcel,
      { signal: abortController?.signal }
    );
    if (result.success && result.data) {
      setImportFile({
        ...importFile,
        loading: false
      });
      setIsOpenImportModal(false);
    } else {
      setImportFile({
        ...importFile,
        message: result.message,
        loading: false
      });
    }
  };
  const onSearch = async () => {
    formRef.current?.submit();
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
              // 避免控件没有被清理
              column.key = (new Date().getTime()) + '---' + column.key;
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
                                  ElementUtils.download(item.invalidDataUrl, item.fileName + '_' + (new Date().getTime()) + '.xlsx');
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
                              {item.status === 2 ? <a className={css`
                                  font-size: 13px;
                                  margin-top: 4px;
                              `} onClick={() => {
                                ElementUtils.download(item.url, item.name + '_' + (new Date().getTime()) + '.xlsx');
                              }}>下载文件</a> : undefined}
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
      <Modal
        maskClosable={false}
        open={isOpenImportModal}
        title="数据导入"
        okText={importFile.loading ? '正在导入' : '确认导入'}
        onCancel={() => {
          if (importFile.loading === true) {
            return;
          }
          setIsOpenImportModal(false);
        }}
        onOk={() => onConfirmImport()}
        confirmLoading={importFile.loading}
        width="400px"
        styles={{ body: { padding: '12px 0' } }}>
        {importFile.message !== undefined && importFile.message !== '' ? <Alert style={{
          padding: '4px 6px',
          marginBottom: 8
        }} message={<span style={{ fontSize: 13 }}>{importFile.message}</span>} type="error" showIcon/> : undefined}
        <div>请先<a>下载模板</a>，按照模板格式导入数据</div>
        <ul style={{
          padding: '0 0 0 20px',
          margin: '6px 0'
        }}>
          <li>文件格式仅支持 <b>xlsx</b> 、<b>xls</b></li>
          <li>文件大小限制 <b>15MB</b> 以内</li>
        </ul>
        {importFile.file === undefined ? <Button style={{
          margin: '8px 0 0 0',
          borderColor: '#bbb'
        }} type="dashed" onClick={() => onAnalyseImportFile()}>选择文件</Button> : <>
          <div style={{
            border: '1px dashed #bbb',
            padding: '6px 10px',
            borderRadius: '4px',
            margin: '8px 0 0 0'
          }}>
            <div>已选择文件：</div>
            <div style={{ fontWeight: 500 }}>{importFile.file[0].name}</div>
            {importFile.sheets !== undefined && importFile.sheets.length > 0 ? <div style={{ margin: '2px 0' }}>
              <ul style={{
                padding: '0 0 0 15px',
                margin: '0px 0',
                fontSize: 13
              }}>
                {importFile.sheets?.map(it => (
                  <li key={it.index} style={{ color: '#666' }}>{it.name}（{it.index}）&nbsp;-&nbsp;有<span style={{ fontWeight: 500 }}>{it.number}条</span></li>
                ))}
              </ul>
            </div> : undefined}
          </div>
        </>}
      </Modal>
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
    </>
  );
});
export default App;
