<template>
    <div class="code-textarea" :style="{ height: height, width: width }">

        <div class="code-textarea__content">
            <pre :class="`code-textarea__pre code-textarea__pre--${language}`">
                <code>
                    <div 
                        class="code-textarea__input" 
                        contenteditable="true"
                        @input="handleInput"
                        ref="inputRef"
                    ></div>
                </code>
            </pre>
        </div>
        <div class="code-textarea__footer">
            <span class="code-textarea__language">{{ language.toUpperCase() }}</span>
        </div>
    </div>
</template>


<script setup lang="jsx">
import { ref, watch, defineProps, defineEmits } from 'vue';

// 定义组件props
const props = defineProps({
    // 整个组件高度
    height: {
        type: String,
        default: '400px'
    },
    // 整个组件宽度
    width: {
        type: String,
        default: '700px'
    },
    // 代码语言类型
    language: {
        type: String,
        default: 'javascript'
    },
    // 双向绑定的值
    modelValue: {
        type: String,
        default: ''
    }
});

// 定义事件
const emits = defineEmits(['update:modelValue']);
const inputRef = ref(null);

// 监听modelValue变化更新输入框内容
watch(() => props.modelValue, (newVal) => {
    if (inputRef.value && inputRef.value.innerText !== newVal) {
        inputRef.value.innerText = newVal;
    }
}, { immediate: true });

// 处理输入事件
const handleInput = () => {
    emits('update:modelValue', inputRef.value.innerText);
};
</script>


<style lang="scss" scoped>
// 定义 BEM 风格的颜色变量（组件背景色）
$code-textarea__bg-color: rgb(43, 43, 43);

.code-textarea {
    // 使用变量定义背景色
    background-color: $code-textarea__bg-color;
    border-radius: 10px;
    box-shadow: 0 0 50px 0 rgb(175, 174, 172);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 确保子元素不会超出容器 */
}

.code-textarea__content {
    flex: 1;
    overflow: hidden; /* 限制内容区域高度，为滚动做准备 */
}

.code-textarea__pre {
    margin: 0;
    padding: 0;
    height: 100%; /* 填充内容区域高度 */
}

.code-textarea__input {
    height: 100%; /* 输入区域高度填满父容器 */
    max-height: 100%; /* 限制最大高度为父容器高度 */
    font-size: 16px;
    outline: none;
    color: aliceblue;
    padding: 20px;

    overflow-x: auto; /* 水平滚动 */
    overflow-y: auto; /* 垂直滚动（内容超出时显示） */
    font-family: 'Source Code Pro', monospace;
    box-sizing: border-box; /* 确保padding不会导致高度溢出 */

    
    /* 滚动条样式 - 开始 */
    /* 滚动条整体 */
    &::-webkit-scrollbar {
        width: 8px;  /* 垂直滚动条宽度 */
        height: 8px; /* 水平滚动条高度 */
    }
    
    /* 滚动条轨道（更新为与背景色一致） */
    &::-webkit-scrollbar-track {
        background: $code-textarea__bg-color; // 使用背景色变量
        border-radius: 4px;
    }
    
    /* 滚动条滑块（保持不变） */
    &::-webkit-scrollbar-thumb {
        background: rgba(107, 121, 192, 0.5);
        border-radius: 4px;
        transition: background 0.2s;
    }
    
    /* 滚动条滑块悬停效果（保持不变） */
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(107, 121, 192, 0.8);
    }
    
    /* 滚动条交叉点（使用背景色变量统一管理） */
    &::-webkit-scrollbar-corner {
        background: $code-textarea__bg-color; // 使用背景色变量
    }
    /* 滚动条样式 - 结束 */
}

.code-textarea__footer {
    height: 30px;
    background-color: rgb(73, 83, 181);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    align-items: center;
}

.code-textarea__language {
    display: inline-block;
    line-height: 30px;
    background-color: rgb(107, 121, 192);
    margin-left: 20px;
    padding: 0 10px;
    cursor: pointer;
    color: aliceblue;
    border-radius: 4px;
}
</style>