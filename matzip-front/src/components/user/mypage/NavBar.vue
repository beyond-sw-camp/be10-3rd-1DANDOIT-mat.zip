<script setup>
import { useAuthStore } from '@/components/stores/auth.js';
import { ref,computed } from 'vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const userSeq = computed(() => authStore.userSeq);

function goToMyPage() {
  if (userSeq.value) {
    router.push(`/user/${userSeq.value}`);
  } else {
    alert('로그인이 필요합니다.');
  }
}

const menuItems = ref([
  { name: '회원 정보 수정', path: `/user/${userSeq.value}/update` },
  { name: '회원 탈퇴', path: `/user/${userSeq.value}/withdraw` },
]);
</script>

<template>
  <div class="nav-bar">
    <nav class="menu">
      <ul>
        <li v-for="item in menuItems" :key="item.name">
          <router-link :to="item.path" active-class="active">{{ item.name }}</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.nav-bar {
  background-color: #f5f5f5;
  padding: 20px;
  width: 200px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  margin-bottom: 10px;
}

.menu li .active {
  color: #ff6f20;
  font-weight: bold;
}

.menu li a {
  color: #333;
  text-decoration: none;
}

.menu li a:hover {
  color: #ff6f20;
}
</style>
