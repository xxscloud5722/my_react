import React, { FC, useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { Select } from 'antd';
import { DefaultOptionType } from 'antd/es/select';

export declare type RegionComponentProps = {
  defaultValue?: string[]
  level?: number,
  onChange?: (value: string[], name?: string[]) => void
  request: {
    requestProvinceData: () => Promise<Region[]>
    requestCityData: (code: string) => Promise<Region[]>
    requestDistrictData: (code: string) => Promise<Region[]>
  }
}
type Region = {
  code: string
  name: string
}
const App: FC<RegionComponentProps> = (props) => {

  const defaultValue = props?.defaultValue || [];
  const [select, setSelect] = useState([(defaultValue.length > 0 ? defaultValue[0] : ''),
    (defaultValue.length > 1 ? defaultValue[1] : ''), (defaultValue.length > 2 ? defaultValue[2] : '')] as string[]);

  const [province, setProvince] = useState([] as DefaultOptionType[]);
  const [city, setCity] = useState([] as DefaultOptionType[]);
  const [district, setDistrict] = useState([] as DefaultOptionType[]);

  const onChange = (type: string, value: string) => {
    if (type === 'PROVINCE') {
      setCity([]);
      setDistrict([]);
      props.request?.requestCityData(value)
        .then(it => setCity(it));
      props?.onChange?.([value, '', ''], [
        (province.find(it => it.value === value)?.label || '').toString(), '', '']);
      setSelect([value, '', '']);
    }
    if (type === 'CITY') {
      setDistrict([]);
      props.request?.requestDistrictData(value)
        .then(it => setDistrict(it));
      props?.onChange?.([select[0], value, ''], [
        (province.find(it => it.value === select[0])?.label || '').toString(),
        (city.find(it => it.value === value)?.label || '').toString(), '']);
      setSelect([select[0], value, '']);
    }
    if (type === 'DISTRICT') {
      props?.onChange?.([select[0], select[1], value], [
        (province.find(it => it.value === select[0])?.label || '').toString(),
        (city.find(it => it.value === select[1])?.label || '').toString(),
        (district.find(it => it.value === value)?.label || '').toString()]);
      setSelect([select[0], select[1], value]);
    }
  };

  useEffect(() => {
    props.request?.requestProvinceData()
      .then(it => setProvince(it));
    if (select[1] !== '') {
      props.request?.requestCityData(select[0])
        .then(it => setCity(it));
    }
    if (select[2] !== '') {
      props.request?.requestDistrictData(select[1])
        .then(it => setDistrict(it));
    }
  }, []);
  return <>
    <div className={css`
        display: flex;
        gap: 8px;
    `}>
      <Select
        options={province}
        value={select[0]}
        onChange={(e) => onChange('PROVINCE', e)}
      />
      <Select
        options={city}
        value={select[1]}
        onChange={(e) => onChange('CITY', e)}
      />
      <Select
        options={district}
        value={select[2]}
        onChange={(e) => onChange('DISTRICT', e)}
      />
    </div>
  </>;
};
export default App;
