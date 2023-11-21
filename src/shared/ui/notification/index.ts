import { NAlert, useMessage } from 'naive-ui';
import { h } from 'vue';

import type { MessageRenderMessage } from 'naive-ui';
import type { Component } from 'vue';

type NotificationType = 'info' | 'error' | 'warning' | 'success';

export function useNotificationManager(args: { type: NotificationType; title: string; content: Component }) {
  const message = useMessage();

  const {
    type,
    title,
    content,
  } = args;

  const target = (() => {
    switch (type) {
      case 'error':
        return message.error;
      case 'warning':
        return message.warning;
      case 'success':
        return message.success;
      default:
        return message.info;
    }
  })();

  const renderMessage: MessageRenderMessage = (args) => {
    const {
      type,
      closable,
      onClose,
    } = args;
    const props = {
      type: type === 'loading' ? 'default' : type,
      style: {
        boxShadow: 'var(--n-box-shadow)',
        maxWidth: 'calc(100vw - 32px)',
        width: '512px',
      },
      closable,
      onClose,
      title,
    };

    return h(NAlert, props, { default: () => h(content) });
  };

  const callNotification = () => {
    target('', {
      render: renderMessage,
      closable: true,
    });
  };

  const deleteNotifications = () => {
    message.destroyAll();
  };

  return {
    callNotification,
    deleteNotifications,
  };
}
