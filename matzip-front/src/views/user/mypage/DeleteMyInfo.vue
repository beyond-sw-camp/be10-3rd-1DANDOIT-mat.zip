<script setup>
import {computed, ref} from 'vue';
import InputField from '@/components/auth/InputField.vue';
import Button from '@/components/auth/Button.vue';
import NavBar from "@/components/user/mypage/NavBar.vue";
import {useAuthStore} from "@/components/stores/auth.js";
import axios from "axios";
import {useRouter} from "vue-router";

const authStore = useAuthStore();
const userSeq = computed(() => authStore.userSeq);
const router = useRouter();
const email = ref('');

const formData = ref({
  userSeq: userSeq.value,
  userPassword: '',
});

// 탈퇴 요청
const submitWithdrawal = async () => {
  // 회원 탈퇴 시 재가입 불가 경고 추가
  alert('탈퇴할 경우 같은 이메일로 재가입이 불가능합니다.');
  try {
    if (email.value === '' || email.value == null) {
      alert('이메일을 입력해 주세요');
      return;
    }

    if (formData.value.userPassword === '' || formData.value.userPassword == null) {
      alert('비밀번호를 입력해 주세요');
      return;
    }

    const response = await axios.delete(`https://matzipapi.huichan.kr/user/api/v1/user/${userSeq.value}`, {
      data: {
        userSeq: formData.value.userSeq,
        userPassword: formData.value.userPassword,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    // 재확인
    const confirmDeletion = confirm('정말로 탈퇴하시겠습니까?');
    if (!confirmDeletion) {
      return;
    }
      alert('회원 탈퇴가 완료되었습니다.');
    authStore.logout();
      await router.replace(`/user/${userSeq.value}/withdrawSuccess`);
  } catch (error) {
    if (error.response.status === 400) {
      // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
      alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
    }
    // alert('회원 탈퇴에 실패했습니다. 다시 시도해 주세요.');
    // console.error(formData.value.userPassword)
  }
};
</script>

<template>
  <div class="withdraw-page-wrapper">
    <NavBar/>
    <div class="withdraw-page">
      <h2>회원탈퇴</h2>
      <form @submit.prevent="submitWithdrawal">
        <InputField v-model="email" label="이메일" placeholder="이메일을 입력하세요."  />
        <InputField v-model="formData.userPassword" type="password" label="비밀번호" placeholder="비밀번호를 입력하세요." />
        <Button label="탈퇴하기" type="submit" />
      </form>
    </div>
  </div>
</template>


<style scoped>
.withdraw-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 상단에 배치 */
  padding-top: 30px;
}

.withdraw-page {
  max-width: 500px;
  width: 100%;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-top: 0;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
