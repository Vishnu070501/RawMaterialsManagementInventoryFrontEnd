export const API_CONFIG = {
    BASE_URL: 'http://192.168.1.115:8000/api',
    ENDPOINTS: {
      AUTH: {
        SIGNUP: '/auth/signup/',
        SIGNIN: '/auth/signin/',
        VERIFY_OTP: '/auth/verify-otp/'
      }
    },
    HEADERS: {
      'Content-Type': 'application/json'
    }
  };