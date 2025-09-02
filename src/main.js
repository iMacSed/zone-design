import { createApp } from 'vue';
import App from './App.vue';
import '@/styles/common.css';

// 引入组件库的少量全局样式变量
import 'tdesign-vue-next/es/style/index.css';

import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
