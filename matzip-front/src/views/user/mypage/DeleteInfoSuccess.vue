<script setup>
import Logo from '@/components/common/Logo.vue';
import Button from '@/components/auth/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="complete-page">
    <Logo size="150px" />

    <h1>회원 탈퇴가 완료되었습니다.</h1>

    <Button label="홈으로" width="150px" height="45px" @click="goToHome" />
  </div>
</template>

<style scoped>
.complete-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
  text-align: center;
}

h1 {
  font-size: 1.8rem;
  color: #333;
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>
