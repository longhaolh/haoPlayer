// 封装axios
import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { Toast } from 'antd-mobile'

// 创建axios实例
const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL || 'http://127.0.0.1:4523/m1/4574698-4223352-default', // 前置URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  // @ts-expect-error 忽略类型检查错误
  (config: AxiosRequestConfig) => {
    // 添加统一请求头
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get' && config.params) {
      config.params._t = Date.now()
    }
    
    console.log('请求发送:', config)
    return config
  },
  (error: AxiosError) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('响应接收:', response)
    
    // 统一处理响应数据格式
    const { data, status } = response
    
    if (status === 200) {
      // 根据后端返回的数据结构进行处理
      if (data.code === 0 || data.success) {
        return data
      } else {
        // 业务错误处理
        Toast.show(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    
    return response
  },
  (error: AxiosError) => {
    console.error('响应错误:', error)
    
    // 错误响应拦截处理
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          Toast.show('未授权，请重新登录')
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          Toast.show('拒绝访问')
          break
        case 404:
          Toast.show('请求地址不存在')
          break
        case 500:
          Toast.show('服务器内部错误')
          break
        case 502:
          Toast.show('网关错误')
          break
        case 503:
          Toast.show('服务不可用')
          break
        case 504:
          Toast.show('网关超时')
          break
        default:
          // @ts-expect-error 忽略类型检查错误
          Toast.show(data?.message || `请求失败，状态码: ${status}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      Toast.show('网络错误，请检查网络连接')
    } else {
      // 其他错误
      Toast.show('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 导出封装好的axios实例
export default instance

// 导出常用的请求方法
export const get = (url: string, params?:string|object|number, config?: AxiosRequestConfig) => {
  return instance.get(url, { params, ...config })
}

export const post = (url: string, data?:string|object|number, config?: AxiosRequestConfig) => {
  return instance.post(url, data, config)
}
