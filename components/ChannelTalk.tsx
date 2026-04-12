'use client';

import { useEffect } from 'react';
import * as ChannelService from '@channel.io/channel-web-sdk-loader';

export default function ChannelTalk() {
  useEffect(() => {
    ChannelService.loadScript();

    ChannelService.boot({
      pluginKey: '0ebf4084-898c-44b2-a9ff-ba7ed5865ac1', 
    });

    return () => {
      ChannelService.shutdown();
    };
  }, []);

  return null;
}