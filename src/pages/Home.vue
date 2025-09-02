<template>
    <div style="width:100%; height:100%; background-color:var(--zt-brand-color-1);">
        <t-button>nihao</t-button>
        <CodeTextArea 
            height="30%" 
            width="30%"
            language="json" 
            class="zt-test"
            v-model="codeContent"
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