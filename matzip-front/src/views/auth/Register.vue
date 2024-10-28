<script setup>
import {ref, watch} from 'vue';
import axios from 'axios';
import InputField from '@/components/auth/InputField.vue';
import Button from '@/components/auth/Button.vue';
import {useRouter} from "vue-router";

const router = useRouter();

const formData = ref({
  userName: '',
  userEmail: '',
  userPassword: '',
  confirmPassword: '',
  userPhone: '',
  userNickname: '',
});

// 핸드폰 번호 입력 양식 '010-0000-0000'에서 '-'을 제외하고 숫자만 추출
const formatPhoneForServer = (phone) => {
  return phone.replace(/\D/g, '');
};

const errorMessage = ref('');
const divErrorMessage = ref('');
const successMessage = ref('');

const isSubmitting = ref(false);

// formData가 변경될 때마다 메시지 초기화
watch(formData, () => {
  successMessage.value = '';
  errorMessage.value = '';
  divErrorMessage.value = '';
}, { deep: true });

const emailVerified = ref(false); // 이메일 인증 여부
const phoneChecked = ref(false); // 휴대폰 중복 체크 여부
const verificationCode = ref('');
const verificationRequested = ref(false);

// 이메일 인증 코드 전송
const sendVerificationCode = async () => {
  if (formData.value.userEmail && formData.value.userName) {
    try {
      if (formData.value.userEmail === '' || formData.value.userEmail == null) {
        errorMessage.value = '이메일을 입력해 주세요';
        return;
      }

      if (formData.value.userName === '' || formData.value.userName == null) {
        errorMessage.value = '이름을 입력해 주세요';
        return;
      }

      const response = await axios.post('https://matzipapi.huichan.kr/user/api/v1/auth/mail-verification', {
        userEmail: formData.value.userEmail,
        userName: formData.value.userName,
      });
      console.log(response);

      verificationRequested.value = true;  // 인증 div열기
    } catch (error) {
      if (error.response.status === 409) {
        // 서버에서 HttpStatus.CONFLICT를 반환한 경우
        errorMessage.value = '이미 가입된 이메일입니다.';
      } else if (error.response.status === 400) {
        // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
        console.error(error);
        errorMessage.value = '이메일 양식을 지켜서 입력해주세요.';
      } else if (error.response.status === 500) {
        // 서버에서 HttpStatus.INTERNAL_SERVER_ERROR 반환한 경우
        console.error(error);
        console.error('db 연결 또는 백엔드 문제');
        errorMessage.value = '메일발송에 실패했습니다.';
      } else  {
        console.error('알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    }
  } else {
    errorMessage.value = '이름과 이메일을 모두 입력해 주세요.';
  }
};

// 이메일 인증 코드 확인
const verifyEmailCode = async () => {
  try {
    if (verificationCode.value === '' || verificationCode.value == null) {
      errorMessage.value = '인증코드를 입력해 주세요';
      return;
    }

    const response = await axios.post('https://matzipapi.huichan.kr/user/api/v1/auth/chkEmailCode', {
      userEmail: formData.value.userEmail,
      verificationCode: verificationCode.value,
    });
    console.log(response);

    emailVerified.value = true;
    verificationRequested.value = false;  // 인증 div 닫기
    successMessage.value = '이메일 인증이 완료되었습니다.'
  } catch (error) {
    if (error.response.status === 400) {
      // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
      console.error(error);
      divErrorMessage.value = '인증코드가 일치하지 않습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.response.status === 500) {
      // 서버에서 HttpStatus.INTERNAL_SERVER_ERROR 반환한 경우
      console.error(error);
      console.error('db 연결 또는 백엔드 문제');
    } else if (error.response.status === 404) {
      // 서버에서 HttpStatus.NOT_FOUND 반환한 경우
      console.error(error);
      console.error('인증시간이 만료된 코드입니다. 다시 요청해주세요.');
    } else  {
      console.error('알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }
};

// 닉네임 중복 확인
const checkNickname = async () => {
  try {
    const response = await axios.post('https://matzipapi.huichan.kr/user/api/v1/user/check-nickname-duplicate', {
      userNickname: formData.value.userNickname,
    });

    console.log(response);
    successMessage.value = '사용 가능한 닉네임입니다.';
  } catch (error) {
    if (error.response.status === 400) {
      // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
      console.error(error);
      errorMessage.value = '닉네임은 2글자 이상 16글자 이하만 가능합니다.';
    } else if (error.response.status === 500) {
      // 서버에서 HttpStatus.INTERNAL_SERVER_ERROR 반환한 경우
      console.error(error);
      console.error('db 연결 또는 백엔드 문제');
    } else if (error.response.status === 409) {
      // 서버에서 HttpStatus.CONFLICT 반환한 경우
      console.error(error);
      errorMessage.value ='이미 사용중인 닉네임입니다.';
    }
  }
};

// 휴대폰 번호 중복 확인
const checkPhoneNumber = async () => {
  try {
    if (formData.value.userPhone === '' || formData.value.userPhone == null) {
      errorMessage.value = '휴대폰 번호를 입력해 주세요';
      return;
    }

    // 번호 포맷 변경(숫자추출)
    const formattedPhone = formatPhoneForServer(formData.value.userPhone);
    const response = await axios.post('https://matzipapi.huichan.kr/user/api/v1/user/check-phone-duplicate', {
      userPhone: formattedPhone,
    });
    console.log(response);
    console.log(formattedPhone);
    phoneChecked.value = true;
    successMessage.value = '사용가능한 번호입니다.'

  } catch (error) {
    console.error(error);
    phoneChecked.value = false;

    if (error.response.status === 400) {
      // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
      errorMessage.value = '휴대폰 번호의 양식에 맞게 입력해주세요.';
    } else if (error.response.status === 500) {
      // 서버에서 HttpStatus.INTERNAL_SERVER_ERROR 반환한 경우
      console.error('db 연결 또는 백엔드 문제');
    } else if (error.response.status === 409) {
      // 서버에서 HttpStatus.CONFLICT 반환한 경우
      errorMessage.value ='이미 가입된 번호입니다.';
    }
  }
};

// 폼 제출 핸들러
const submitForm = () => {
  if (isSubmitting.value) return; // 이미 제출 중이면 추가 제출 방지
  isSubmitting.value = true; // 제출 시작

  try {
    if (!emailVerified.value) {
      errorMessage.value = '이메일 인증이 필요합니다.';
      return;
    }

    if (!phoneChecked.value) {
      errorMessage.value = '휴대폰 번호 중복 확인이 필요합니다.';
      return;
    }

    // 비밀번호 패턴 검사
    const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*.,?])[A-Za-z\d!@#$%^&*.,?]{8,}$/;
    if (!passwordPattern.test(formData.value.userPassword)) {
      errorMessage.value = '비밀번호는 영문, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.';
      return;
    }

    // 비밀번호 확인
    if (formData.value.userPassword !== formData.value.confirmPassword) {
      errorMessage.value = '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
      return;
    }

    // 폼 제출 로직 (회원가입 처리)
    console.log('회원가입 폼 제출:', formData.value);
    signup();
  } catch (error) {
    console.error('회원가입 에러:', error);
  } finally {
    isSubmitting.value = false; // 제출 완료 후 상태 초기화
  }
};

// 회원가입 처리 함수
const signup = async () => {
  // 필수 입력 필드들이 모두 채워졌는지 확인
  if (formData.value.userName && formData.value.userEmail && formData.value.userPassword && formData.value.confirmPassword && formData.value.userPhone) {

    try {
      const formattedPhone = formatPhoneForServer(formData.value.userPhone);

      const response = await axios.post('https://matzipapi.huichan.kr/user/api/v1/auth/register', {
        userName: formData.value.userName,
        userEmail: formData.value.userEmail,
        userPassword: formData.value.userPassword,
        userPhone: formattedPhone,
        userNickname: formData.value.userNickname,
        userSocialYn: 'N'
      });
      console.log(response.data); // 응답 데이터 처리
      await router.push('/user/register-success');

    } catch (error) {
      console.error(error);
       if (error.response.status === 500) {
        // 서버에서 HttpStatus.INTERNAL_SERVER_ERROR 반환한 경우
        console.error(error);
        console.error('db 연결 또는 백엔드 문제');
      } else if (error.response.status === 401 || 400) {
        // 401 에러 발생 시, 회원가입완료 페이지로 리다이렉트(임시)
        // await router.push('/user/register-success');
      }  else {
        errorMessage.value = '회원가입에 실패했습니다. 다시 시도해 주세요.';
      }
    }
  } else {
    errorMessage.value = '닉네임을 제외한 칸들을 모두 입력해주세요.';
  }
};

</script>

<template>
  <div class="sign-up-form">
    <h2>회원가입</h2>
    <form @submit.prevent="submitForm">
      <InputField label="이름" v-model="formData.userName" style="width: 400px"  placeholder="이름을 입력해주세요" required />

      <div class="input-div">
        <InputField label="이메일" v-model="formData.userEmail" style="width: 400px"  placeholder="이메일을 입력해주세요" required />
        <Button label="인증하기" @click="sendVerificationCode" />
      </div>

      <div v-if="verificationRequested"  class="verification-box">
        <p>인증 코드가 발송되었습니다. <br> 10분 안에 이메일로 받은 코드를 입력해주세요.</p>
        <InputField v-model="verificationCode" placeholder="인증 코드를 입력하세요" />
        <Button label="확인" @click="verifyEmailCode" />
        <p v-if="divErrorMessage" class="error-message">{{ divErrorMessage }}</p>
      </div>

      <InputField label="비밀번호"
                  type="password"
                  v-model="formData.userPassword"
                  style="width: 400px"
                  placeholder="비밀번호를 입력해주세요"
                  required />
      <InputField label="비밀번호 확인"
                  type="password"
                  v-model="formData.confirmPassword"
                  style="width: 400px"
                  placeholder="비밀번호를 다시 입력해주세요"
                  required />

      <div class="input-div">
        <InputField label="휴대폰 번호" v-model="formData.userPhone" style="width: 400px"  placeholder="010-0000-0000" required />
        <Button label="중복확인" @click="checkPhoneNumber" size="small" />
      </div>

      <div class="input-div">
        <InputField label="닉네임 (선택)"
                    v-model="formData.userNickname"
                    style="width: 400px"
                    placeholder="원하시는 닉네임이 있다면 입력해주세요" />
        <Button label="중복확인" @click="checkNickname" />
      </div>

      <!-- 오류 메시지 표시 영역 -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <Button label="회원가입" @click="submitForm" type="submit" />
    </form>

  </div>
</template>

<style scoped>
.sign-up-form {
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
}

.input-div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-field {
  width: 100%; /* 모든 input 필드의 가로 크기를 동일하게 설정 */
}

.input-div .input-field {
  flex: 1; /* input 필드가 가능한 넓게 차지하도록 설정 */
}

button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.input-div button {
  width: 100px; /* 버튼의 너비를 고정하여 균형 맞추기 */
}

.error-message {
  color: red;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.success-message {
  color: green;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.verification-box {
  border: 2px solid #ff7f50;
  border-radius: 10px;
  padding: 15px; /* 내부 여백 */
  margin-top: 15px; /* 상단 여백 */
  background-color: #fffaf0;
}

.verification-box p {
  margin-bottom: 10px; /* 텍스트와 입력 필드 사이의 여백 */
}

</style>
