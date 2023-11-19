<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { NUpload, NUploadDragger } from 'naive-ui';
import { onMounted, ref, toRefs } from 'vue';

import type { UploadFileInfo } from 'naive-ui';
import type { Ref } from 'vue';

interface Props {
  multiple: boolean;
  directoryDnd: boolean;
  allowedFiles: string;
  disabled: boolean;
}

defineOptions({
  name: 'DropUploader',
});

const props = defineProps<Props>();
const emit = defineEmits<{
  onChange: [fileList: UploadFileInfo[]];
  onInit: [uploader: Ref<InstanceType<typeof NUpload> | undefined>];
}>();

const { multiple } = toRefs(props);

const uploader = ref<InstanceType<typeof NUpload>>();

onMounted(() => {
  emit('onInit', uploader);
});

function changeHandler({ fileList }: { fileList: UploadFileInfo[] }) {
  emit('onChange', fileList);
}

const debouncedChangeHandler = useDebounceFn(changeHandler, 200);
</script>

<template>
  <NUpload
    ref="uploader"
    :multiple="multiple"
    :directoryDnd="directoryDnd"
    :accept="allowedFiles"
    :defaultUpload="false"
    :showFileList="false"
    :disabled="disabled"
    @change="debouncedChangeHandler"
  >
    <NUploadDragger>
      <slot />
    </NUploadDragger>
  </NUpload>
</template>
