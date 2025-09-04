<template>
    <div style="width:100%; height:100%;">
        <CodeTextArea 
            v-model="codeContent"
            height="30%" 
            width="30%"
            language="javascript"
            :readonly="false"
            status="success"
            statusTip="代码格式正确"
        />
        <t-button @click="dialogVis=true;" style="margin-top: 20px;">show dialog</t-button>

        <t-dialog
            v-model:visible="dialogVis"
        >
            <CodeTextArea 
                v-model="codeContent"
                height="30vh" 
                width="100%"
                language="javascript"
            />
        </t-dialog>
    </div>
</template>

<script setup lang="jsx">
import { ref, watch, defineProps, defineEmits } from 'vue';

const codeContent = ref('');
const dialogVis = ref(false);
</script>

<style lang="scss">

</style>