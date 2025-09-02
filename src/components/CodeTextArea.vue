<template>
    <div class="code-textarea" :style="{ height: height, width: width }">
        <div class="code-textarea__content">
            <pre :class="`code-textarea__pre code-textarea__pre--${language}`">
                <code ref="codeRef"><div 
                    class="code-textarea__input" 
                    contenteditable="true"
                    @input="handleInput"
                    @keydown="handleKeyDown"
                    ref="inputRef"
                ></div></code></pre>
        </div>
        <div class="code-textarea__footer">
            <span 
                class="code-textarea__language" 
                @click="highlightCode"
            >
                高亮
                {{ language.toUpperCase() }}
            </span>
        </div>
    </div>
</template>


<script setup lang="jsx">
import { ref, watch, defineProps, defineEmits } from 'vue';
import hljs from 'highlight.js';
// 可替换为其他主题
import 'highlight.js/styles/github-dark.css';

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
const codeRef = ref(null);

// 代码高亮方法
const highlightCode = () => {
    if (inputRef.value && codeRef.value) {
        // 获取输入的代码内容
        const code = inputRef.value.innerText;
        // 使用 highlight.js 高亮代码
        const result = hljs.highlight(code, { 
            language: props.language 
        });
        // 更新代码区域内容为高亮后的 HTML
        inputRef.value.innerHTML = result.value;
    }
};

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

// 处理键盘事件实现自动补全
const handleKeyDown = (e) => {
    // 定义需要自动补全的括号/引号映射关系
    const autoCompleteMap = {
        '(': ')',
        '{': '}',
        '[': ']',
        '"': '"',
        "'": "'",
        '`': '`'
    };

    const pressedKey = e.key;
    const closingChar = autoCompleteMap[pressedKey];

    // 如果按下的是需要补全的左括号/引号
    if (closingChar) {
        e.preventDefault(); // 阻止默认输入，手动控制插入内容
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

        if (range) {
            // 保存当前光标位置
            const startOffset = range.startOffset;
            const parentNode = range.startContainer;

            // 1. 插入左括号/引号
            const leftTextNode = document.createTextNode(pressedKey);
            range.insertNode(leftTextNode);

            // 2. 插入右括号/引号
            const rightTextNode = document.createTextNode(closingChar);
            range.setStartAfter(leftTextNode);
            range.insertNode(rightTextNode);

            // 3. 调整光标到两个字符中间
            range.setStart(parentNode, startOffset + 1);
            range.setEnd(parentNode, startOffset + 1);
            selection.removeAllRanges();
            selection.addRange(range);

            // 4. 更新绑定值
            emits('update:modelValue', inputRef.value.innerText);
        }
    } 
    // 处理Tab缩进和Shift+Tab反缩进
    else if (e.key === 'Tab') {
        e.preventDefault(); // 阻止默认Tab行为（如焦点切换）
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        if (!range || !inputRef.value) return;

        // 1. Tab键：插入缩进（\t）
        if (!e.shiftKey) {
            const tabNode = document.createTextNode('\t'); // 创建Tab字符节点
            range.insertNode(tabNode); // 在光标位置插入Tab
            // 调整光标到Tab之后
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } 
        // 2. Shift+Tab键：移除缩进
        else {
            const startContainer = range.startContainer;
            const startOffset = range.startOffset;
            const textContent = startContainer.textContent || '';

            // 获取当前行起始位置
            const lineStart = textContent.lastIndexOf('\n', startOffset) + 1;
            // 获取当前行内容（光标前部分）
            const lineBeforeCursor = textContent.substring(lineStart, startOffset);

            // 如果行首有Tab缩进，则移除一个Tab
            if (lineBeforeCursor.startsWith('\t')) {
                // 拼接移除Tab后的文本
                const newText = textContent.substring(0, lineStart) + 
                                textContent.substring(lineStart + 1); // 移除一个Tab
                startContainer.textContent = newText;
                // 调整光标位置（左移一个字符）
                range.setStart(startContainer, startOffset - 1);
                range.setEnd(startContainer, startOffset - 1);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        // 更新绑定值
        emits('update:modelValue', inputRef.value.innerText);
    }
};
</script>


<style lang="scss" scoped>
// Code背景颜色
$code-textarea--bg-color: rgb(43, 43, 43);
// 底部Footer颜色
$code-textarea__footer--bg-color: rgb(73, 83, 181);
// 底部语言标签颜色，同时也是半个主题色
$code-textarea__lang--bg-color: rgb(107, 121, 192);
// 新增输入框文本颜色变量
$code-textarea__input--text-color: aliceblue;

.code-textarea {
    background-color: $code-textarea--bg-color;
    border-radius: 10px;
    // box-shadow: 0 0 50px 0 rgb(175, 174, 172);
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
    outline: none; /* 移除这个默认的焦点轮廓线 */
    color: $code-textarea__input--text-color;
    /* 调整内边距：保留左右内边距，减小顶部内边距（根据需要调整数值） */
    padding: 10px 20px; /* 原 padding: 20px */
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
    
    &::-webkit-scrollbar-track {
        background: $code-textarea--bg-color;
        border-radius: 4px;
    }
    
    /* 滚动条滑块颜色使用语言标签背景色变量 + alpha通道 */
    &::-webkit-scrollbar-thumb {
        background: rgba($code-textarea__lang--bg-color, 0.5);
        border-radius: 4px;
        transition: background 0.2s;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: rgba($code-textarea__lang--bg-color, 0.8);
    }
    
    &::-webkit-scrollbar-corner {
        background: $code-textarea--bg-color;
    }
    /* 滚动条样式 - 结束 */
}

.code-textarea__footer {
    height: 30px;
    background-color: $code-textarea__footer--bg-color;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    display: flex;
    align-items: center;
}

.code-textarea__language {
    display: inline-block;
    line-height: 30px;
    background-color: $code-textarea__lang--bg-color;
    margin-left: 20px;
    padding: 0 10px;
    cursor: pointer;
    color: $code-textarea__input--text-color;
    border-radius: 4px;
}
</style>