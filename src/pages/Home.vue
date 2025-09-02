<template>
    <div style="width:100%; height:100%; background-color:var(--zt-brand-color-1);">
        <t-button>nihao</t-button>
        <CodeTextArea 
            height="30%" 
            width="30%"
            language="javascript" 
            v-model="codeContent"
        />
    </div>
</template>

<script setup lang="jsx">
import { ref, watch, defineProps, defineEmits } from 'vue';

const codeContent = ref('');
</script>

<style lang="scss">
</style>