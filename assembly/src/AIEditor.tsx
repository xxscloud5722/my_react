import { AiEditor, AiEditorOptions } from 'aieditor';
import './css/aieditor.css';

import React, { forwardRef, HTMLAttributes, useEffect, useRef } from 'react';
import { Session } from 'beer-network/session';

export interface HttpRequestParams {
  [key: string]: string;
}

export interface HttpRequestHeader {
  [key: string]: string;
}

type AIEditorProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  actionImage?: string
  params?: HttpRequestParams
  headers?: HttpRequestHeader
  placeholder?: string
  defaultValue?: string
  value?: string
  onChange?: (val: string) => void
  options?: Omit<AiEditorOptions, 'element'>
};

export default forwardRef<HTMLDivElement, AIEditorProps>((
  {
    actionImage,
    params,
    headers,
    placeholder,
    defaultValue,
    value,
    onChange,
    options,
    ...props
  }: AIEditorProps,
  ref
) => {
  const divRef = useRef<HTMLDivElement>(null);
  const aiEditorRef = useRef<AiEditor | null>(null);
  const getAction = () => {
    if (actionImage === undefined) {
      return undefined;
    }
    const paramQuery = new URLSearchParams();
    Object.keys(params || {})
      .forEach(key => {
        paramQuery.append(key, params?.[key] || '');
      });
    return actionImage + '?' + paramQuery.toString();
  };
  useEffect(() => {
    if (!divRef.current) {
      return undefined;
    }

    if (!aiEditorRef.current) {
      const aiEditor = new AiEditor({
        element: divRef.current,
        placeholder,
        content: value,
        draggable: false,
        textSelectionBubbleMenu: {
          enable: false
        },
        image: {
          defaultSize: 350,
          uploadFormName: getAction() !== undefined ? 'file' : undefined,
          uploadUrl: getAction(),
          uploadHeaders: {
            ...(headers || {}),
            authorization: 'Bearer ' + (Session.getBearer() || '')
          },
          uploaderEvent: {
            onSuccess: (file, response) => {
              return {
                errorCode: 0,
                data: {
                  src: response.data,
                  alt: file.name
                }
              };
            }
          }
        },
        toolbarKeys: [
          'heading',
          '|', 'bold', 'italic', 'underline', 'strike', 'link',
          '|', 'highlight', 'font-color',
          '|', 'align', 'line-height',
          '|', 'bullet-list', 'ordered-list', 'indent-decrease', 'indent-increase', 'break',
          '|', 'image'
        ],
        onChange: (ed) => {
          if (typeof onChange === 'function') {
            onChange(ed.getHtml());
          }
        },
        ...options
      });

      aiEditorRef.current = aiEditor;
    }

    return () => {
      if (aiEditorRef.current) {
        aiEditorRef.current.destroy();
        aiEditorRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(divRef.current);
      } else {
        ref.current = divRef.current;
      }
    }
  }, [ref]);
  // useEffect(() => {
  //   if (aiEditorRef.current && value !== aiEditorRef.current.getMarkdown()) {
  //     aiEditorRef.current.setContent(value || '');
  //   }
  // }, [value]);
  return <div ref={divRef} {...props} />;
});
