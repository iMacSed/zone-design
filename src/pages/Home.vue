<template>
    <div style="width:100%; height:100%;">
        <t-button>nihao</t-button>
        <CodeTextArea 
            v-model="codeContent"
            height="30%" 
            width="30%"
            language="javascript"
            :readonly="false"
            status="success"
            statusTip="代码格式正确"
        />
        <t-button style="margin-top: 20px;">nihao</t-button>
    </div>
</template>

<script setup lang="jsx">
import { ref, watch, defineProps, defineEmits } from 'vue';

const codeContent = ref('');
</script>

<style lang="scss">

</style>