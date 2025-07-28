import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./modules/player";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
// 配置持久化选项
const persistConfig = {
    key: 'playerConfig', // 存储的键名
    storage,     // 使用的存储引擎
    // 可选：指定需要持久化的 reducer，不指定则默认所有
    // whitelist: ['auth', 'cart'] 
    // 可选：指定不需要持久化的 reducer
    // blacklist: ['counter'],
  };

// 创建持久化的 reducer
const persistedReducer = persistReducer(persistConfig, playerReducer);

// 创建 store
export const store = configureStore({
  reducer: {
    player: persistedReducer,
  },
  // 添加中间件配置，禁用序列化检查以允许非序列化值
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略redux-persist的action类型和路径
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['register', 'rehydrate', 'payload', 'meta.arg', 'meta.baseQueryMeta'],
        ignoredPaths: ['player._persist'],
      },
    }),
});
// 创建持久化存储
export const persistor = persistStore(store);