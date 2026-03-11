import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const retryCount = parseInt(originalRequest.headers?.get?.('X-Retry-Count') || originalRequest.headers?.['X-Retry-Count'] || '0');

        // Handle 401 Unauthorized (Token expired)
        const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
        if (error.response?.status === 401 && retryCount < 1 && !isAuthRequest) {
            console.log(`[Auth] 401 detected (Attempt ${retryCount + 1}), attempting token refresh...`, originalRequest.url);

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    console.error('[Auth] No refresh token available');
                    throw new Error('No refresh token');
                }

                // Logic to refresh token
                console.log('[Auth] Requesting new access token...');
                const res = await axios.post('/api/auth/refresh', { refreshToken });
                const { accessToken } = res.data.result;
                console.log('[Auth] New access token received successfully');

                localStorage.setItem('access_token', accessToken);

                // Update default headers for future requests
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                // Update the current failed request and retry
                // Use .set() for Axios 1.x AxiosHeaders compatibility
                if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
                    originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
                    originalRequest.headers.set('X-Retry-Count', (retryCount + 1).toString());
                } else {
                    originalRequest.headers = {
                        ...originalRequest.headers,
                        'Authorization': `Bearer ${accessToken}`,
                        'X-Retry-Count': (retryCount + 1).toString()
                    };
                }

                console.log('[Auth] Retrying original request:', originalRequest.url);
                return apiClient(originalRequest);
            } catch (refreshError: any) {
                console.error('[Auth] Token refresh failed:', refreshError);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
