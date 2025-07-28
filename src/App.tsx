import './App.css'
import Home from '@/views/home'
import { Provider } from 'react-redux'
import { store, persistor } from '@/store'
import { PersistGate } from 'redux-persist/integration/react'
function App() {
  // 添加加载状态组件
  const LoadingComponent = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>加载中...</p>
    </div>
  );

  return (
    <div className="app-container">
     <Provider store={store}>
        <PersistGate loading={<LoadingComponent />} persistor={persistor}>
          <Home />
        </PersistGate>
     </Provider>
    </div>
  )
}

export default App
