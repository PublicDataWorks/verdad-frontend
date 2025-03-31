import Axios from 'axios'

// Increased timeout to 30 seconds to handle slower database responses
const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL as string,
  timeout: 30000 // 30 seconds
})

export default axios
