<template>
    <!-- 代码输入框根容器，动态绑定尺寸样式和状态类（控制边框颜色） -->
    <div class="code-textarea" 
         :style="{ height: height, width: width }"
         :class="['code-textarea--status', `code-textarea--${status}`]">
        <!-- 代码内容显示区域，包含可编辑区域和高亮容器 -->
        <div class="code-textarea__content">
            <!-- pre和code标签用于保留代码格式，动态绑定语言类用于语法高亮 -->
            <pre class="code-textarea__pre" :class="`code-textarea__pre--${language}`"><code>
                <!-- 核心可编辑区域，根据readonly控制编辑状态 -->
                <div 
                    class="code-textarea__input" 
                    :contenteditable="!readonly"
                    :class="{ 'code-textarea__input--readonly': readonly }"
                    @input="handleInput"
                    @keydown="handleKeyDown"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    ref="inputRef"
                    :data-placeholder="placeholder"
                ></div>
            </code></pre>
        </div>
        <!-- 底部状态栏，包含语言高亮按钮和状态提示文字 -->
        <div class="code-textarea__footer">
            <!-- 语言标签按钮，点击触发代码高亮 -->
            <span 
                class="code-textarea__language" 
                @click="highlightCode"
            >
                高亮
                {{ language.toUpperCase() }}
            </span>
            <!-- 状态提示文字 -->
            <span v-if="statusTip" class="code-textarea__status-tip">
                Tips：{{ statusTip }}
            </span>
        </div>
    </div>
</template>


<script setup lang="jsx">
import { ref, watch, defineProps, defineEmits, nextTick, computed } from 'vue';
import hljs from 'highlight.js';
// 可替换为其他主题
import 'highlight.js/styles/github-dark.css';

// 定义组件props（外部传入的属性）
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
    // 代码语言类型（用于语法高亮）
    language: {
        type: String,
        default: 'javascript'
    },
    // 双向绑定的值（代码内容）
    modelValue: {
        type: String,
        default: ''
    },
    // 添加placeholder prop（无内容且未聚焦时显示）
    placeholder: {
        type: String,
        default: '请输入代码...'
    },
    // 只读状态控制（true时不可编辑）
    readonly: {
        type: Boolean,
        default: false
    },
    // 状态类型（控制边框颜色：success-绿色/error-红色/warning-黄色）
    status: {
        type: String,
        default: '',
        validator: (value) => {
            return ['', 'success', 'error', 'warning'].includes(value);
        }
    },
    // 状态提示文字（显示在底部状态栏右侧）
    statusTip: {
        type: String,
        default: ''
    }
});


// #region 焦点处理 Focus
// 添加焦点状态跟踪（用于控制placeholder显示/隐藏逻辑）
const isFocused = ref(false);

// 添加焦点处理函数
const handleFocus = () => {
    isFocused.value = true;
};

// 添加失焦处理函数
const handleBlur = () => {
    isFocused.value = false;
};
// #endregion


// #region 同步输入框内容双向绑定 Model
// 定义事件（用于v-model双向绑定更新父组件）
const emits = defineEmits(['update:modelValue']);
// 输入框DOM引用（用于操作编辑区域内容）
const inputRef = ref(null);
// 监听modelValue变化更新输入框内容
watch(() => props.modelValue, (newVal) => {
    if (inputRef.value && inputRef.value.innerText !== newVal) {
        inputRef.value.innerText = newVal;
    }
}, { immediate: true });

// 处理输入事件（子组件 -> 父组件，同步输入内容）
const handleInput = () => {
    if (inputRef.value) {
        emits('update:modelValue', inputRef.value.innerText);
    }
};
// #endregion


// 代码高亮方法（使用highlight.js实现语法高亮）
const highlightCode = () => {
    if (inputRef.value) {
        // 获取输入的代码内容
        const code = inputRef.value.innerText;
        // 使用 highlight.js 高亮代码（指定语言）
        const result = hljs.highlight(code, { 
            language: props.language 
        });
        // 更新代码区域内容为高亮后的 HTML（含样式标签）
        inputRef.value.innerHTML = result.value;
    }
};

// 处理键盘事件实现自动补全和Tab缩进
const handleKeyDown = (e) => {
    // 定义需要自动补全的括号/引号映射关系（左括号对应右括号）
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

    // 1. 括号/引号自动补全逻辑
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

            // 3. 调整光标到两个字符中间（左括号后，右括号前）
            range.setStart(parentNode, startOffset + 1);
            range.setEnd(parentNode, startOffset + 1);
            selection.removeAllRanges();
            selection.addRange(range);

            // 4. 更新绑定值
            emits('update:modelValue', inputRef.value.innerText);
        }
    } 
    // 2. Tab缩进和Shift+Tab反缩进逻辑
    else if (e.key === 'Tab') {
        e.preventDefault(); // 阻止默认Tab行为（如焦点切换）
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        
        if (!range || !inputRef.value) return;

        // 1. Tab键：插入缩进（\t字符）
        if (!e.shiftKey) {
            const tabNode = document.createTextNode('\t'); // 创建Tab字符节点
            range.insertNode(tabNode); // 在光标位置插入Tab
            // 调整光标到Tab之后
            range.setStartAfter(tabNode);
            range.setEndAfter(tabNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } 
        // 2. Shift+Tab键：移除缩进（删除行首的一个Tab）
        else {
            const startContainer = range.startContainer;
            const startOffset = range.startOffset;
            const textContent = startContainer.textContent || '';

            // 获取当前行起始位置（上一个换行符之后）
            const lineStart = textContent.lastIndexOf('\n', startOffset) + 1;
            // 获取当前行内容（光标前部分）
            const lineBeforeCursor = textContent.substring(lineStart, startOffset);

            // 如果行首有Tab缩进，则移除一个Tab
            if (lineBeforeCursor.startsWith('\t')) {
                // 拼接移除Tab后的文本（保留行首前内容 + 移除Tab后的行内容）
                const newText = textContent.substring(0, lineStart) + 
                                textContent.substring(lineStart + 1); // 移除一个Tab
                startContainer.textContent = newText;
                // 调整光标位置（左移一个字符，因为删除了一个Tab）
                range.setStart(startContainer, startOffset - 1);
                range.setEnd(startContainer, startOffset - 1);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }

        // 更新绑定值（同步缩进/反缩进后的内容）
        emits('update:modelValue', inputRef.value.innerText);
    }
};
</script>


<style lang="scss" scoped>
// 颜色变量定义（统一管理主题色，便于维护）
// Code背景颜色
$code-textarea--bg-color: rgb(43, 43, 43);
// 底部Footer颜色
$code-textarea__footer--bg-color: rgb(73, 83, 181);
// 底部语言标签颜色，同时也是半个主题色
$code-textarea__lang--bg-color: rgb(107, 121, 192);
// 新增输入框文本颜色变量
$code-textarea__input--text-color: aliceblue;
// 只读状态文本颜色
$code-textarea__input--readonly-color: rgba(240, 248, 255, 0.7);
// 状态颜色变量（用于边框和提示文字）
$status-success: #4CAF50; // 绿色-成功状态
$status-error: #F44336;   // 红色-错误状态
$status-warning: #FFC107; // 黄色-警告状态
// 字体变量
$code-textarea__font-family: 'Source Code Pro', monospace;


// 根容器样式（控制整体布局和基础样式）
.code-textarea {
    background-color: $code-textarea--bg-color;
    border-radius: 10px;
    // box-shadow: 0 0 50px 0 rgb(175, 174, 172);
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 确保子元素不会超出容器（如滚动条不溢出圆角） */
    transition: outline 0.2s; // 状态切换时边框颜色过渡动画
    
    // 状态样式 - 根据status prop显示不同颜色边框
    &.code-textarea--status.code-textarea--success {
        outline: 2px solid $status-success !important;
    }
    
    // 状态样式 - 错误
    &.code-textarea--status.code-textarea--error {
        outline: 2px solid $status-error !important;
    }
    
    // 状态样式 - 警告
    &.code-textarea--status.code-textarea--warning {
        outline: 2px solid $status-warning !important;
    }

    // 代码内容区域样式（控制编辑区域布局）
    .code-textarea__content {
        flex: 1; // 占满剩余高度（使footer固定在底部）
        overflow: hidden; /* 限制内容区域高度，为滚动做准备 */
        position: relative; /* 使placeholder伪元素定位生效 */

        // 代码格式化容器（pre标签，保留代码原始格式）
        .code-textarea__pre {
            margin: 0;
            padding: 0;
            height: 100%;
            // 添加字体大小重置，避免pre标签默认字体影响子元素
            font-size: 0;

            // 可编辑输入区域核心样式
            .code-textarea__input {
                height: calc(100%); /* 输入区域高度填满父容器 */
                max-height: calc(100%); /* 限制最大高度为父容器高度 */
                font-size: 16px;
                outline: none; /* 移除默认焦点轮廓线（自定义样式） */
                color: $code-textarea__input--text-color;
                /* 调整内边距：保留左右内边距，减小顶部内边距（根据需要调整数值） */
                padding: 10px 20px; /* 原 padding: 20px */
                overflow-x: auto; /* 水平滚动（内容超出宽度时） */
                overflow-y: auto; /* 垂直滚动（内容超出高度时） */
                font-family: $code-textarea__font-family; // 等宽字体（代码显示常用）
                box-sizing: border-box; /* 确保padding不会导致高度溢出 */


                /* 滚动条样式 - 开始（自定义滚动条外观） */
                /* 滚动条整体 */
                &::-webkit-scrollbar {
                    width: 5px;  /* 垂直滚动条宽度 */
                    height: 5px; /* 水平滚动条高度 */
                }
                
                &::-webkit-scrollbar-track {
                    background: $code-textarea--bg-color;
                    border-radius: 4px;
                }
                
                /* 滚动条滑块颜色使用语言标签背景色变量 + alpha通道 */
                &::-webkit-scrollbar-thumb {
                    background: rgba($code-textarea__lang--bg-color, 0.5);
                    border-radius: 4px;
                    transition: background 0.2s; // 鼠标悬停时颜色过渡
                }
                
                &::-webkit-scrollbar-thumb:hover {
                    background: rgba($code-textarea__lang--bg-color, 0.8); // 悬停时加深颜色
                }
                
                &::-webkit-scrollbar-corner {
                    background: $code-textarea--bg-color; // 滚动条交汇处背景色
                }
                /* 滚动条样式 - 结束 */

                /* 使用伪元素实现placeholder效果（无内容且未聚焦时显示） */
                &:empty:not(:focus)::before {
                    content: attr(data-placeholder); // 从data属性获取placeholder文本
                    color: rgba($code-textarea__input--text-color, 0.5); // 半透明文本
                    pointer-events: none; // 避免占位符干扰点击事件
                    font-size: 16px;
                    font-family: $code-textarea__font-family;
                }
            }

            // 只读状态样式（区分可编辑/不可编辑状态）
            .code-textarea__input--readonly {
                color: $code-textarea__input--readonly-color; // 只读文本颜色（更浅）
                cursor: default; // 光标变为默认（非文本输入光标）
                
                // 只读状态下移除焦点样式（避免误导）
                &:focus {
                    outline: none;
                }
                
                // 只读状态下隐藏滚动条（内容不可编辑，无需滚动交互）
                &::-webkit-scrollbar {
                    display: none;
                }
            }

        }

    }

    // 底部状态栏样式（包含语言标签和状态提示）
    .code-textarea__footer {
        height: 30px;
        background-color: $code-textarea__footer--bg-color;
        border-bottom-left-radius: 8px; // 与根容器圆角呼应（底部圆角）
        border-bottom-right-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between; /* 两端对齐布局（语言标签居左，提示文字居右） */
        padding-right: 20px; /* 添加右侧内边距（避免提示文字贴边） */

        // 语言标签样式（高亮按钮）
        .code-textarea__language {
            display: inline-block;
            line-height: 30px; // 垂直居中文字（与footer高度一致）
            background-color: $code-textarea__lang--bg-color;
            margin-left: 20px;
            padding: 0 10px;
            cursor: pointer; // 鼠标悬停为手型（提示可点击）
            color: $code-textarea__input--text-color;
            border-radius: 4px; // 轻微圆角
        }

        // 状态提示文字样式（根据状态显示对应颜色）
        .code-textarea__status-tip {
            color: $code-textarea__input--text-color;
            font-size: 14px; // 比主文本小一号
            
            // 只读状态下高亮按钮样式
            // &:not([style*="cursor: pointer"]) {
            //     opacity: 0.7;
            //     pointer-events: none;
            // }

            // 根据状态显示不同颜色
            :global(.code-textarea--success) & {
                color: $status-success;
            }
            
            :global(.code-textarea--error) & {
                color: $status-error;
            }
            
            :global(.code-textarea--warning) & {
                color: $status-warning;
            }
        }

    }

}
</style>