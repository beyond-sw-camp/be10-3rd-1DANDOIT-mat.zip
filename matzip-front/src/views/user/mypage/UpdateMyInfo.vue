<script setup>
import {ref, reactive, onMounted, computed} from 'vue';
import axios from 'axios';
import NavBar from '@/components/user/mypage/NavBar.vue';
import Input from '@/components/auth/InputField.vue';
import Button from '@/components/auth/Button.vue';
import {useRoute, useRouter} from "vue-router";
import {useAuthStore} from "@/components/stores/auth.js";

const userData = ref(null);
const currentRoute = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userSeq = computed(() => authStore.userSeq);

// 사용자 정보
const formData = reactive({
  userEmail: '',
  userPhone: '',
  userName: '',
  userNickname: '',
  userRegDate: ''
});

// 원래 데이터
const originalData = reactive({
  userPhone: '',
  userNickname: '',
  userPassword: ''
});

// 비밀번호
const userPassword = ref('');
const confirmPassword = ref('');

// 편집 가능여부
const isNicknameEditable = ref(false);
const isPasswordEditable = ref(false);
const isPhoneEditable = ref(false);

// 편집 상태 토클
const toggleNicknameEdit = () => {
  isNicknameEditable.value = !isNicknameEditable.value;
};

const togglePasswordEdit = () => {
  isPasswordEditable.value = !isPasswordEditable.value;
};

const togglePhoneEdit = () => {
  isPhoneEditable.value = !isPhoneEditable.value;
};

const getUserInfo = async () => {
  try {
    const urlUserSeq = currentRoute.params.userSeq;  // URL에서 가져온 userSeq
    const extractUserSeq = Array.isArray(urlUserSeq) ? urlUserSeq[0] : urlUserSeq;  // urlUserSeq가 배열인 경우 첫 번째 값을 사용
    const currentUserSeq = userSeq.value;  // 로그인한 사용자의 userSeq

    // console.log("currentUserSeq:", currentUserSeq, typeof currentUserSeq);
    // console.log("parsedUserSeq:", extractUserSeq, typeof extractUserSeq);

    // 로그인한 사용자와 URL의 userSeq가 다른 경우 접근 차단
    if (currentUserSeq !== extractUserSeq) {
      await router.push(`/user/${userSeq.value}`);
      return;
    }

    const token = localStorage.getItem('accessToken');

    const userInfo = await axios.get(`https://matzipapi.huichan.kr/user/api/v1/user/${userSeq.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    });
    const data = await userInfo.data.data2;
    userData.value = data;
    // console.log("응답 데이터: ", userInfo.data);

    formData.userEmail = data.userEmail;
    formData.userPhone = data.userPhone;
    formData.userName = data.userName;
    formData.userNickname = data.userNickname;

    // 날짜가 있는지 확인하고, 날짜 형식을 yyyy-mm-dd로 지정
    formData.userRegDate = data.userRegDate ? new Date(data.userRegDate).toISOString().split('T')[0] : 'N/A';
    Object.assign(originalData, formData);
  } catch (error) {
    // console.error('사용자 정보 불러오기 실패:', error);
  }
};

// 컴포넌트가 마운트될 때 사용자 정보를 가져옴
onMounted(() => {
  getUserInfo();
});

// 정보 수정
const saveChanges = async () => {
  try {
    const updateData = {};

    // 닉네임이 변경된 경우
    if (formData.userNickname !== originalData.userNickname) {
      updateData.userNickname = formData.userNickname;
    }

    // 휴대폰 번호가 변경된 경우
    if (formData.userPhone !== originalData.userPhone) {
      updateData.userPhone = formData.userPhone;
    }

    // 변경된 데이터가 없을 경우 처리
    if (Object.keys(updateData).length === 0) {
      alert("변경된 정보가 없습니다.");
      return;
    }

    // 회원 정보 수정 요청
    const response = await axios.put(`https://matzipapi.huichan.kr/user/api/v1/user/${userSeq.value}`, updateData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    alert('회원 정보가 성공적으로 수정되었습니다.');

    // 저장 후 편집 상태 초기화
    isNicknameEditable.value = false;
    isPhoneEditable.value = false;
    Object.assign(originalData, formData); // 원본 데이터 갱신
  } catch (error) {
    // console.error('회원 정보 수정 실패:', error);
    if (error.response.status === 409) {
      // 서버에서 HttpStatus.CONFLICT를 반환한 경우
      alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.');
    } else if (error.response.status === 400) {
      // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
      alert('닉네임은 2자 이상 16자 이하여야합니다.');
    }
  }
};

// 비밀번호 변경
const changePassword = async () => {
  if (userPassword.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.');
    return;
  }

  try {
    await axios.put(`https://matzipapi.huichan.kr/user/api/v1/user/change-password/${userSeq.value}`, {
      userPassword: userPassword.value,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    alert('비밀번호가 성공적으로 변경되었습니다.');
    // console.log(userPassword)
    isPasswordEditable.value = false;
    userPassword.value = '';
    confirmPassword.value = '';
    // console.log(userPassword.value)
    // console.log(confirmPassword.value)
  } catch (error) {
    // console.error('비밀번호 변경 실패:', error);
    if (error.response.status === 409) {
      // 서버에서 HttpStatus.CONFLICT를 반환한 경우
      alert('같은 비밀번호로는 수정할수 없습니다.');
    } else if (error.response.status === 400) {
      // 서버에서 HttpStatus.BAD_REQUEST 반환한 경우
      alert('비밀번호는 영문, 숫자, 특수문자(!@#$%^&*.,? 사용가능)를 모두 포함해 8자리 이상이어야 합니다.');
    }

    // console.log(userPassword.value)
    // console.log(confirmPassword.value)
  }
};
</script>

<template>
  <div class="content-wrapper">
    <NavBar/>
    <div class="main-content">
      <h2>마이페이지</h2>
      <div class="info-list">
        <div class="info-item">
          <span>이메일</span>
          <span class="read-only">{{ formData.userEmail }}</span> <!-- 수정 불가 -->
        </div>
        <div class="info-item">
          <span>비밀번호</span>
          <span v-if="!isPasswordEditable">******</span>
          <Button @click="togglePasswordEdit" label="수정" v-if="!isPasswordEditable" />
          <Button @click="togglePasswordEdit" label="취소" v-else />
        </div>
        <div v-if="isPasswordEditable" class="password-change">
          <Input
              v-model="userPassword"
              label="비밀번호"
              type="password"
              placeholder="새 비밀번호 입력"
              class="form-input"
              :showLabel="false"
          />
          <Input
              v-model="confirmPassword"
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호 확인"
              class="form-input"
              :showLabel="false"
          />
          <Button @click="changePassword" label="변경" />
        </div>
        <div class="info-item">
          <span>휴대폰 번호</span>
          <span v-if="!isPhoneEditable">{{ formData.userPhone }}</span>
          <Input
              v-else
              v-model="formData.userPhone"
              label="휴대폰 번호"
              :showLabel="false"
              placeholder="새 휴대폰 번호 입력"
              class="form-input"
          />
          <Button @click="togglePhoneEdit" label="수정" v-if="!isPhoneEditable"/>
          <Button @click="togglePhoneEdit" label="취소" v-else/>
        </div>
        <div class="info-item">
          <span>이름</span>
          <span class="read-only">{{ formData.userName }}</span> <!-- 수정 불가 -->
        </div>
        <div class="info-item">
          <span>닉네임</span>
          <span v-if="!isNicknameEditable">{{ formData.userNickname }}</span>
          <Input
              v-else
              v-model="formData.userNickname"
              label="닉네임"
              :showLabel="false"
              placeholder="새 닉네임 입력"
              class="form-input"
          />
          <Button @click="toggleNicknameEdit" label="수정" v-if="!isNicknameEditable"/>
          <Button @click="toggleNicknameEdit" label="취소" v-else/>
        </div>
        <div class="info-item">
          <span>회원가입 날짜</span>
          <span class="read-only">{{ formData.userRegDate }}</span> <!-- 수정 불가 -->
        </div>
      </div>
      <Button class="save-button" @click="saveChanges" label="저장"/>
    </div>
  </div>
</template>

<style scoped>
.content-wrapper {
  display: flex;
  justify-content: center;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center; /* 중앙 정렬 추가 */
  border-bottom: 1px solid #ddd;
  padding: 8px 0;
}

.read-only {
  color: #999;
  flex: 1; /* 오른쪽 항목을 가운데로 맞추기 위해 flex 설정 */
  text-align: right; /* 오른쪽 텍스트 중앙정렬 */
}

.password-change {
  margin-top: 10px;
}
</style>
