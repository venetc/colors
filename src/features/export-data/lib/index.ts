import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

import type { Ref } from 'vue';

export function useFileDownload(data: Ref<unknown>, filenameToken: string) {
  const link = ref<string>('');
  const filename = ref<string>('');

  const revokeBlobSrc = () => {
    URL.revokeObjectURL(link.value);
  };

  const updateFileName = () => {
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const dateString = `${day}-${month}-${year}`;

    filename.value = `${filenameToken}_${dateString}_${hours}-${minutes}-${seconds}`;
  };

  const updateBlobSrc = () => {
    revokeBlobSrc();

    const blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' });

    link.value = URL.createObjectURL(blob);
  };

  const updateAll = () => {
    updateBlobSrc();
    updateFileName();
  };

  watch(data, updateAll, {
    deep: true,
  });

  onMounted(updateAll);
  onBeforeUnmount(revokeBlobSrc);

  return {
    link,
    filename,
    updateFileName,
  };
}
