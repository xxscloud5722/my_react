import React, { CSSProperties, FC, useEffect, useState } from 'react';
import { css } from '@emotion/css';
import { theme } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

export declare type SliderCodeComponentProps = {
  style?: CSSProperties
  request: () => Promise<Slider>
  onReceipt?: (code: string, slider: Slider) => Promise<boolean>
  token?: SliderCodeToken | undefined
}
export declare type Slider = {
  authCode: string
  background: string
  cutout: string
  y: number
}
export declare type SliderCodeToken = {
  colorPrimary?: string
  colorBar?: string
  boxShadow?: string
  gradient?: string[]
};
const sliderParams = {
  // 缩放比例
  scale: 0.694,
  // 控件原始坐标
  x: 0,
  // 起点坐标
  start: 8,
  // 终点坐标
  end: 225,
  disable: false
};
const App: FC<SliderCodeComponentProps> = (props = {
  token: {
    colorPrimary: '#1677ff',
    boxShadow: 'rgba(22, 93, 255, 0.4)',
    gradient: ['#578aff', '#165dff'],
    colorBar: '#165dff'
  },
  request: async () => {
    throw new Error('Function not implemented.');
  }
}) => {
  const { token } = theme.useToken();
  const [offset, setOffset] = useState(8);
  const [slider, setSlider] = useState({} as Slider);
  const [status, setStatus] = useState(false);
  const onRefreshSlider = async () => {
    const slider = await props.request();
    sliderParams.disable = false;
    setOffset(sliderParams.start);
    setSlider(slider);
  };

  useEffect(() => {
    onRefreshSlider()
      .then();
  }, []);
  const onMouseDownSlider = (x: number) => {
    if (sliderParams.disable) {
      return;
    }
    sliderParams.x = x;
    let offsetX = 0;
    const disableSelection = (e: Event) => {
      e.preventDefault();
    };
    const moveSlider = (e: MouseEvent) => {
      let offset = e.x - sliderParams.x + sliderParams.start;
      if (offset <= sliderParams.start) {
        offset = sliderParams.start;
      } else if (offset >= sliderParams.end) {
        offset = sliderParams.end;
      }
      offsetX = offset;
      setOffset(offset);
    };
    window.addEventListener('mousemove', moveSlider);
    window.addEventListener('selectstart', disableSelection);
    const onMouseUp = async () => {
      sliderParams.disable = true;
      const x = Math.floor((offsetX - sliderParams.start) / sliderParams.scale);
      window.removeEventListener('mousemove', moveSlider);
      window.removeEventListener('selectstart', disableSelection);
      window.removeEventListener('mouseup', onMouseUp);
      const code = Number('1' + x.toString(2))
        .toString(16);
      const result = await props.onReceipt?.(code, slider);
      if (result === false) {
        setStatus(true);
        setTimeout(() => {
          setStatus(false);
          setOffset(sliderParams.start);
          onRefreshSlider()
            .then(() => sliderParams.disable = false);
        }, 1200);
      }
    };
    window.addEventListener('mouseup', onMouseUp);
  };
  return <>
    <div style={props.style} className={css`
        background: #fff;
        border-radius: ${token.borderRadius}px;
        box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.03);
        padding: 15px 10px;
        width: 250px;
        position: relative;
    `}>
      <div className={css`
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
      `}>
        <span>完成拼图验证</span>
        <a style={{
          userSelect: 'none',
          color: props.token?.colorPrimary || token.colorPrimary
        }} onClick={onRefreshSlider}><ReloadOutlined/>&nbsp;换一张</a>
      </div>
      <div className={css`
          width: 250px;
          height: 95px;
          background: #eee;
          border-radius: ${token.borderRadius}px;
          position: relative;
          overflow: hidden;
      `}>
        <div className={css`
            width: 100%;
            height: 100%;

            & > img {
                width: 100%;
                display: block;
            }
        `}>
          {slider.background === undefined || slider.background === '' ? undefined : <img alt="" src={slider.background}/>}
        </div>
        <div className={css`
            display: block;
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;

            & > img {
                width: 100%;
                display: block;
            }
        `} style={{
          left: offset - 8 + 'px',
          width: 50 * sliderParams.scale,
          height: 50 * sliderParams.scale
        }}>
          {slider.cutout === undefined || slider.cutout === '' ? undefined : <img src={slider.cutout} style={{ marginTop: (slider.y * sliderParams.scale) + 'px' }} alt=""/>}
        </div>
      </div>
      <div className={css`
          width: 100%;
          height: 32px;
          margin: 10px 0 0 0;
      `}>
        <div className={css`
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #fff;
            box-shadow: 4px 2px 19px ${props.token?.boxShadow || token.colorPrimary};
            filter: brightness(1.2);
            position: absolute;
            margin-top: -2px;
            cursor: pointer;
            z-index: 9;
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
        `} style={{ left: offset + 'px' }} onMouseDown={(e) => {
          onMouseDownSlider(e.clientX);
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            userSelect: 'none'
          }}>
            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
              <path d="M613.504 512L274.752 173.248l90.496-90.496L794.496 512l-429.248 429.248-90.496-90.496z" fill={props.token?.colorBar || '#000'}/>
            </svg>
          </div>
        </div>
        <div className={css`
            width: 100%;
            height: 32px;
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            position: relative;
            box-shadow: inset 0 2px 16px ${props.token?.boxShadow || token.colorPrimary};
        `}>
          <div className={css`
              height: 32px;
              position: absolute;
          `} style={{
            width: ((offset > 8 ? offset + 8 : offset) - 8) + 'px',
            background: status ? '#FF3C21' : `linear-gradient(90deg, ${props.token?.gradient?.[0]} 0%, ${props.token?.gradient?.[1]} 100%)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            fontSize: '13px'
          }}>
            <div style={{ minWidth: '140px' }}>
              {status ? '滑块验证失败，请重试' : undefined}
            </div>
          </div>
          <div className={css`
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              font-size: 13px;
              font-weight: 500;
              color: ${props.token?.colorPrimary || token.colorPrimary}
          `}>向右滑动完成拼图
          </div>
        </div>
      </div>
    </div>
  </>;
};
export default App;
