import React from 'react';

export const iframeStack = [
  `<iframe class="matterportlink__iframe"
  src="https://my.matterport.com/show/?m=AHqSpvQcTbK&kb=0&help=1" frameborder="0" height="720px" width="1280px">
  </iframe>`,
];

export function IframeElement(props: { iframe: string }) {
  return <div dangerouslySetInnerHTML={{ __html: props.iframe ? props.iframe : '' }}></div>;
}
