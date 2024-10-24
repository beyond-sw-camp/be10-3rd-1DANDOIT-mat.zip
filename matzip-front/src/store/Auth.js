
import { ref, onMounted } from 'vue';
import { defineStore } from 'pinia';


export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const userRole = ref(null);

    // 페이지가 로드될 때 localStorage에서 토큰을 읽어와 상태를 초기화
    onMounted(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            accessToken.value = token;
            const payload = JSON.parse(atob(token.split('.')[1])); // JWT 토큰의 페이로드 추출
            userRole.value = payload.auth;
        }
    });

    function login(token, userSeq) {
        accessToken.value = token;
        localStorage.setItem('accessToken', token); // 토큰을 localStorage에 저장
        localStorage.setItem('userSeq', userSeq);
        const payload = JSON.parse(atob(token.split('.')[1])); // JWT 토큰의 페이로드 추출
        userRole.value = payload.auth;
    }

    function logout() {
        accessToken.value = null;
        userRole.value = null;
        localStorage.removeItem('accessToken'); // localStorage에서 토큰 제거
    }

    function isAuthorized(requiredRole) {
        if (!userRole.value) return false;
        return userRole.value.includes(requiredRole);   // 배열로 반환 되었으므로 includes로 확인
    }

    return { accessToken, userRole, login, logout, isAuthorized };
});