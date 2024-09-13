import React, { CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Badge, Button, Divider, Drawer, Dropdown, Flex, Input, List, message, Modal, Popconfirm, Radio, Space, Spin, Tabs, theme, Typography } from 'antd';
import { CopyOutlined, LoadingOutlined, MoreOutlined } from '@ant-design/icons';
import { ActionType, BetaSchemaForm, ProTable } from '@ant-design/pro-components';
import { Link } from 'react-router-dom';
import { FormInstance } from 'antd/lib';
import ElementUtils from 'beer-network/elementUtils';
import { css } from '@emotion/css';
import ImportModal, { ImportData } from './ImportModal';
import NetDiskDirectory, { DirectorySelectProps } from './DirectorySelect';
import { Config } from './config';
import Flux from './Flux';

const G_VARIABLE = {
  isInit: true,
  searchFormParams: {} as any,
  defaultSearchParams: {} as any,
  formParams: () => {
    return { ...G_VARIABLE.searchFormParams };
  },
  reset: () => {
    G_VARIABLE.searchFormParams = {};
    G_VARIABLE.defaultSearchParams = {};
    G_VARIABLE.isInit = true;
  },
  defaultParams: (params: {}) => {
    G_VARIABLE.defaultSearchParams = params;
  },
  getDefaultSearchParams: () => {
    if (G_VARIABLE.isInit) {
      G_VARIABLE.isInit = false;
      return G_VARIABLE.defaultSearchParams;
    }
    return {};
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
    importData<T>(code: string, importCode: string, importExcel: ImportData, callback: (progress: number) => void, option: { signal: AbortSignal | undefined }): Promise<T>
    getDownloadUrl(value: string, fileName: string, option: { signal: AbortSignal | undefined }): Promise<string | undefined>
    saveExport(code: string, exportId: string, directoryId: string, option: { signal: AbortSignal | undefined }): Promise<boolean | undefined>
  }
  style?: CSSProperties | undefined
  onLoad?: (config: TableConfig) => void | undefined
  onChangeEvent?: (eventName: string, item: any) => void | undefined
  directoryProps?: DirectorySelectProps | undefined
  isDisplayNetDisk?: boolean | undefined

  headerTitle?: React.ReactNode | undefined
  toolBarRender?: React.ReactNode | undefined
}
export declare type DataItem = {
  id: string | undefined
  key: string
  value: string
  description: string
};
export declare type TableConfig = {
  // 代码
  code: string
  // 名称
  name: string
  // 拥有的功能
  modules: string[]
  // 搜索表单
  searchForm?: {
    dataIndex: string
    key: string
    title: string
    // 控件类型
    valueType: string
    width: string | number
    // SELECT 远程加载数据的代码
    valueCode: string
    // SELECT 的选择枚举 或者 数组（会将数组转成对象）
    valueEnum: { label: string, value: string } [] | {}
    // 只有SELECT 生效, 判断是否监听另外一个
    listening: string
  }[]
  searchFormWrap: boolean | number
  // 搜索配置
  searchConfig?: { code: string }
  // 导出配置
  exportConfig?: { code: string, label: string }[]
  // 导入配置
  importConfig?: {
    // 导入代码
    code: string,
    // 下载地址
    url: string,
    // 模板名称
    name: string,
    // 如果没有下载地址则弹出消息
    message: string
  }
  // 列
  columns?: {
    key: string, name: string, columns: {
      dataIndex: string
      title: string
      width: string | number
      renderContent: { content: string, condition: string }[]
      link?: string
      openLink?: string
      menusItems?: {
        key: string
        text: string
        color?: string | undefined
        condition?: string | undefined
        eventName: string
        type: 'divider' | 'menus' | undefined
        items: {}[]
        popConfirm?: {
          title: string
          description: string
          okText: string
          cancelText: string
        } | undefined
      }[] | undefined
    }[]
  }[]
  // 列表统计
  statistics?: { code: string, loading: string }

  // 自定义表单
  aForm: any

  // 是否单独一行
  aFormBlockSearch: boolean
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
  refreshData(): void;
}
export declare type Statistics = {
  title?: string | undefined
  status: 'SUCCESS' | 'FAIL' | ''
  message?: string | undefined
  detail?: string | undefined
};
const Component = forwardRef<TableAutoDataPanelRef, TableAutoDataPanelProps>((props, ref) => {
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

  const FormConsole = () => {
    return <Space size={12}>
      <Button type="primary" onClick={onSearch} loading={searchIsLoading}>查询</Button>
      <Button onClick={() => {
        formRef.current?.resetFields();
      }}>重置</Button>
    </Space>;
  };

  const createFrom = (searchForm: any) => {
    return [{
      key: '_' + new Date().getTime(),
      title: '',
      columns: searchForm,
      valueType: 'group'
    }];
  };
  const requestTable = async (params: {}) => {
    requestStatistics()
      .then();
    setSearchIsLoading(true);
    const requestParams = {
      ...G_VARIABLE.getDefaultSearchParams(),
      ...params,
      ...G_VARIABLE.formParams(),
      tableGroupCode: (tableConfig?.columns || []).length > 1 ? tableGroupActive : undefined,
      current: undefined,
      pageSize: undefined
    } as any;
    setSearchParams({ ...requestParams });
    return props.request.search<any>(tableConfig?.searchConfig?.code || code, {
      ...params,
      params: requestParams
    }, { signal: abortController?.signal })
      .then(result => {
        setSearchIsLoading(false);
        return result;
      })
      .catch(async message => {
        setSearchIsLoading(false);
        messageApi.error(message)
          .then();
      });
  };
  const requestStatistics = async () => {
    if (tableConfig?.statistics?.code === undefined || tableConfig?.statistics?.code === '') {
      return;
    }
    setStatistics({ status: '' });
    const result = await props?.request?.statistics<{
      success: boolean,
      message: string,
      data: { status: never, message: string, detail: string }
    }>(tableConfig?.statistics?.code || '', {}, { signal: abortController?.signal });
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
          const defaultSearchParams: any = {};
          result.data.aFormBlockSearch = result.data?.searchFormWrap === undefined;
          if (typeof result.data?.searchFormWrap === 'boolean') {
            result.data.aFormBlockSearch = result.data?.searchFormWrap;
          } else {
            result.data.aFormBlockSearch = (result.data?.searchForm || []).length > (result.data?.searchFormWrap || 4);
          }
          if ((result.data?.searchForm || []).length > 0) {
            const searchFormItems: any[] = result.data?.searchForm || [];
            if (!result.data.aFormBlockSearch) {
              searchFormItems.push({
                key: '_panel',
                title: ' ',
                dataIndex: '_panel',
                renderFormItem: () => {
                  return (<FormConsole/>);
                }
              });
            }
            for (const it of searchFormItems) {
              // 设置控件key
              if (it.key.indexOf('---') < 0) {
                it.key = new Date().getTime() + '---' + it.key;
              }
              // 是否加载远程下拉选数据
              if ((it.valueType?.toUpperCase() || '') === 'SELECT' && it.valueCode !== undefined && it.valueCode !== '') {
                const selectItem: any = {};
                (await requestSelectValue(it.valueCode)).forEach(it => {
                  selectItem[it.value] = {
                    text: it.label,
                    status: it.value
                  };
                });
                it.valueEnum = selectItem;
                continue;
              }
              // 是否将下拉选数组转成顺序对象
              if ((it.valueType?.toUpperCase() || '') === 'SELECT' && Array.isArray(it.valueEnum)) {
                const selectItems: any = {};
                it.valueEnum.forEach((p: any, i: number) => {
                  selectItems['#' + i + '_' + p.value] = {
                    text: p.label,
                    status: p.value
                  };
                });
                it.valueEnum = selectItems;
              }
            }
            result.data.aForm = createFrom(searchFormItems);
            // 获取默认参数
            for (const it of searchFormItems) {
              if (it.initialValue === undefined) {
                continue;
              }
              defaultSearchParams[it.key] = it.initialValue;
            }
          }
          G_VARIABLE.reset();
          G_VARIABLE.defaultParams(parseFormValue(defaultSearchParams, result.data.searchForm));
          setCurrentPage(1);
          setTabsActive('00');
          setTableConfig(result.data);
          rendering(result.data);
          props?.onLoad?.(result.data);
        } else {
          messageApi.error(result.message);
        }
        return result;
      });
  };
  const parseFormValue = (value: any, formItems?: { key: string, valueType: string }[] | undefined) => {
    const params: any = { ...value };
    formItems = formItems || tableConfig?.searchForm;
    for (const key of Object.keys(params)) {
      const keyId = key.split('---')[1];
      const value = params[key];
      const formItem = formItems?.find(it => it.key.split('---')[1] === keyId);
      if (formItem === undefined) {
        continue;
      }
      // 下拉选
      if ((formItem.valueType || '').toUpperCase()
        .indexOf('SELECT') > -1) {
        const string = value.toString();
        const index = string.indexOf('_');
        if (index > -1) {
          params[key] = string.substring(index + 1);
        }
        continue;
      }
      // 时间
      if ((formItem.valueType || '').toUpperCase()
        .indexOf('DATE') <= -1) {
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
    if ((tableConfig?.columns || []).length > 1) {
      const key = tableConfig?.columns?.[0]?.key || '';
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
      if ((tableConfig?.modules || []).indexOf('IMPORT') > -1) {
        setTabsActive('IMPORT');
      } else if ((tableConfig?.modules || []).indexOf('EXPORT') > -1) {
        setTabsActive('EXPORT');
      }
    } else {
      refreshByTabActive();
    }
  };
  const onImport = async () => {
    setIsOpenImportModal(true);
  };
  const onConfirmImport = async (excelData: ImportData, callback: (progress: number) => void) => {
    return props.request.importData<{ success: boolean, data: boolean, message: string }>(
      code,
      tableConfig?.importConfig?.code || code,
      excelData,
      callback,
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
    const exportConfig = tableConfig?.exportConfig;
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
    if (exportConfig.length === 1) {
      Modal.confirm({
        title: '系统提示',
        content: <>将导出<span style={{ fontWeight: 500 }}>《{exportConfig[0].label}》</span>数据，导出时间较长请耐心等待</>,
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
      return;
    }
    const result = await props?.request?.saveExport?.(code, exportItemId, directoryId, { signal: abortController?.signal });
    if (result === true) {
      await messageApi.success('提交任务成功！');
    } else {
      await messageApi.error('提交任务失败，请联系服务商');
    }
  };
  const onChangeEvent = (eventName: string | undefined, item: any) => {
    if (eventName !== undefined) {
      props?.onChangeEvent?.(eventName, item);
    }
  };
  useImperativeHandle(ref, () => ({
    refresh: () => {
      abortController?.abort('to Page: ' + props.code);
      G_VARIABLE.reset();
      setSearchParams({});
      setAbortController(new AbortController());
    },
    refreshData: () => {
      tableRef?.current?.reload?.();
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
    <div style={props?.style}>
      {contextHolder}
      {tableConfig?.code === undefined ? undefined : <>
        {
          tableConfig?.searchForm !== undefined ? <BetaSchemaForm<DataItem>
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
              const searchForm = tableConfig?.searchForm;
              const keys = Object.keys(params);
              const listeningFormItems = searchForm?.filter(it => it.listening !== undefined && it.listening !== ''
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
                  formItem.key = new Date().getTime() + '---' + formItem.key.split('---')[1];
                }
                setTableConfig({
                  ...tableConfig,
                  searchForm: searchForm as never,
                  aForm: createFrom(searchForm)
                });
              }
            }}
            submitter={tableConfig?.aFormBlockSearch === false ? false : {
              render: () => {
                return <Flex style={{ justifyContent: 'flex-end' }}>
                  <FormConsole/>
                </Flex>;
              }
            }}
            columns={tableConfig.aForm}/> : undefined
        }
        <ProTable<DataItem>
          actionRef={tableRef}
          columns={tableConfig?.columns?.filter(it => {
            if (tableConfig.columns?.length === 1) {
              return true;
            }
            return it.key === tableGroupActive;
          })
            .map(a => {
              return a.columns.map(it => {
                if (it.renderContent !== undefined) {
                  return {
                    ...it,
                    render: (value: never, record: {}, _index: any) => {
                      return it.renderContent?.filter(it => {
                        // eslint-disable-next-line no-eval
                        return (it.condition === undefined || it.condition === '') || eval(it.condition);
                      })
                        ?.map((it, index) => {
                          let element = it.content.replace('#{value}', value);
                          for (const key of Object.keys(record)) {
                            element = element.replace(`#{${key}}`, (record as any)[key]);
                          }
                          return React.createElement('div', {
                            key: index,
                            dangerouslySetInnerHTML: { __html: element },
                            style: {
                              display: 'flex',
                              alignItems: 'center'
                            }
                          });
                        });
                    }
                  };
                }
                if (it.link !== undefined) {
                  return {
                    ...it,
                    render: (value: never, record: any) => {
                      let element = it.link?.replace('#{value}', value) || '';
                      for (const key of Object.keys(record)) {
                        element = element.replace(`#{${key}}`, (record as any)[key]);
                      }
                      return <Link to={element}>{value}</Link>;
                    }
                  };
                }
                if (it.openLink !== undefined) {
                  return {
                    ...it,
                    render: (value: never, record: any) => {
                      let element = it.link?.replace('#{value}', value) || '';
                      for (const key of Object.keys(record)) {
                        element = element.replace(`#{${key}}`, (record as any)[key]);
                      }
                      return <a href={element} target="_blank" rel="noopener noreferrer">{value}</a>;
                    }
                  };
                }
                if (it.menusItems !== undefined) {
                  return {
                    ...it,
                    render: (value: never, record: {}) => {
                      return <Space size={8}>
                        {it.menusItems?.filter(it => {
                          // eslint-disable-next-line no-eval
                          return (it.condition === undefined || it.condition === '') || eval(it.condition);
                        })
                          .map(it => (
                            <span key={it.key}>
                              {it.type === 'divider' ? <Divider type="vertical" style={{
                                background: 'rgba(0,0,0,0.12)',
                                margin: '0'
                              }}/> : undefined}
                              {it.type === 'menus' ? <Dropdown menu={{
                                items: (it.items || [])?.map((item: any) => {
                                  return {
                                    ...it,
                                    label: <span
                                      style={{
                                        color: item.color,
                                        width: item.width
                                      }}
                                      onClick={() => onChangeEvent(item?.eventName, record)}>
                                      {item.name}
                                    </span>
                                  };
                                }) as never
                              }} trigger={['click']}>
                                <MoreOutlined style={{
                                  fontSize: 13,
                                  fontWeight: 'bold',
                                  rotate: '90deg',
                                  cursor: 'pointer',
                                  marginTop: 4
                                }}/>
                              </Dropdown> : undefined}
                              {it.type === undefined && it.popConfirm === undefined ? <a
                                style={{ color: it.color }} onClick={() => onChangeEvent(it.eventName, record)}>{it.text}</a> : undefined}
                              {it.type === undefined && it.popConfirm !== undefined ? <Popconfirm {...it.popConfirm} onConfirm={() => {
                                onChangeEvent(it.eventName, record);
                              }}>
                                <a style={{ color: it.color }}>{it.text}</a>
                              </Popconfirm> : undefined}
                            </span>
                          ))}
                      </Space>;
                    }
                  };
                }
                return it;
              });
            })?.[0] as never}
          scroll={{ x: 'max-content' }}
          request={requestTable}
          size="small"
          rowKey="id"
          search={false}
          options={false}
          headerTitle={<>
            {tableConfig?.statistics ? <div className={css`
                font-size: 14px;
                font-weight: normal;
                display: flex;
                align-items: center;
                padding-left: 12px;
            `}>
              {statistics?.status === undefined || statistics?.status === '' ? <>
                <Spin style={{ marginRight: 8 }} indicator={<LoadingOutlined style={{ fontSize: 14 }} spin/>}/>
                {tableConfig?.statistics?.loading}
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
            </div> : undefined}
            {(tableConfig?.columns || []).length > 1 && (tableConfig?.columns || []).length <= 4 ? <Radio.Group buttonStyle="solid" value={tableGroupActive} className={css`
                label {
                    font-weight: normal;
                }
            `} onChange={(e) => {
              setTableGroupActive(e.target.value);
            }} disabled={searchIsLoading}>
              {(tableConfig?.columns || []).map(it => (
                <Radio.Button value={it.key} key={it.key}>{it.name}</Radio.Button>
              ))}
            </Radio.Group> : undefined}
            {(tableConfig?.columns || []).length > 4 ? <Flux style={{ height: 32 }}>
              <Tabs className={css`
                  max-width: 560px !important;

                  .ant-tabs-tab {
                      font-size: 13px !important;
                      font-weight: 400 !important;
                  }
              `} tabBarStyle={{ lineHeight: 1 }} tabBarGutter={10} size="small" items={
                (tableConfig.columns || []).map(it => {
                  return {
                    key: it.key,
                    label: it.name,
                    children: undefined
                  };
                }) as never
              } onChange={(e) => {
                setTableGroupActive(e);
              }}/>
            </Flux> : undefined}
            {props?.headerTitle}
          </>}
          pagination={{
            current: currentPage,
            onChange: (page) => setCurrentPage(page)
          }}
          toolBarRender={() => [
            <>
              {props?.toolBarRender}
              {(tableConfig?.modules || []).indexOf('IMPORT') > -1 ? <Button type="primary" onClick={onImport}>
                导入数据
              </Button> : undefined}
              {((tableConfig?.modules || []).indexOf('IMPORT') > -1 && (tableConfig?.modules || []).indexOf('EXPORT') > -1)
                ? <Divider type="vertical" style={{ background: '#bbb' }}/> : undefined}
              {(tableConfig?.modules || []).indexOf('EXPORT') > -1 ? <Button type="primary" onClick={onExport}>
                导出表格
              </Button> : undefined}
              {((tableConfig?.modules || []).indexOf('IMPORT') > -1 || (tableConfig?.modules || []).indexOf('EXPORT') > -1)
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
                            <Typography.Text className={css`
                                font-weight: 500;
                                width: 310px;
                            `} ellipsis={true} copyable={{ icon: <><CopyOutlined style={{ color: '#333' }}/></> }}>{item.fileName || '未知的文件.xlsx'}</Typography.Text>
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
                                {props?.isDisplayNetDisk === false ? undefined : <>
                                  <Divider type="vertical" style={{ background: '#eee' }}/>
                                  <a onClick={() => {
                                    setExportItemId(item.id);
                                    setExportDirectoryModal(true);
                                  }}>保存到网盘</a>
                                </>}
                              </Space> : undefined}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    ))}
                  </List>
                </Spin>
              }
            ].filter(it => (it.key === 'IMPORT' && (tableConfig?.modules || []).indexOf('IMPORT') > -1) || (
              it.key === 'EXPORT' && (tableConfig?.modules || []).indexOf('EXPORT') > -1))
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
        request={async (importData, callback) => onConfirmImport(importData, callback)}
        onDownloadTemplate={async () => {
          const importConfig = tableConfig?.importConfig;
          if (importConfig === undefined) {
            await messageApi.info('暂无模板数据，请联系管理员添加');
            return;
          }
          if (importConfig.url !== undefined && importConfig.url !== '') {
            const fileName = (importConfig.name || '') + '-模板文件.xlsx';
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
            {tableConfig?.exportConfig?.map(item => (
              <Radio key={item.code} value={item.code}>{item.label}</Radio>
            ))}
          </Space>
        </Radio.Group>
      </Modal>
      <NetDiskDirectory
        {...(props?.directoryProps || {})}
        open={exportDirectoryModal}
        onOk={async (directoryId) => {
          onConfirmSaveExport(directoryId)
            .then();
          setExportDirectoryModal(false);
        }}
        onCancel={() => setExportDirectoryModal(false)}/>
    </div>
  );
});
export default Component;
