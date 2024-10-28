import { createRouter, createWebHistory } from "vue-router";
import {useAuthStore} from "@/components/stores/auth.js";
import UserSearch from "@/views/admin/admin-views/UserSearch.vue";
import ActivityLevelSearch from "@/views/admin/admin-views/ActivityLevelSearch.vue";
import AdminBaseView from "@/views/admin/AdminBaseView.vue";
import UserBase from "@/views/user/UserBase.vue";
import ListAll from "@/views/Lists/ListAll.vue";

const routes = [
    { path: "/login", component: () => import("@/views/auth/LoginForm.vue") },
    {
        path: "/user",
        component: UserBase,
        children: [
            { path: "/", component: () => import("@/views/home/HomeView.vue")},
            { path: "auth/register", component: () => import("@/views/auth/Register.vue") },
            { path: "auth/registerTOS", component: () => import("@/views/auth/RegisterTOS.vue") },
            { path: "register-success", component: () => import("@/views/auth/RegisterSuccess.vue") },
            { path: "auth/find-email", component: () => import("@/views/auth/FindEmail.vue") },
            { path: "auth/find-password", component: () => import("@/views/auth/FindPassword.vue") },
            { path: "auth/reset-password", component: () => import("@/views/auth/ResetPassword.vue") },
            { path: "post/create",  meta: { requiresAuth: true },
                component: () => import("@/views/post/PostCreate.vue")},
            { path: "post/:id/edit",  meta: { requiresAuth: true },
                component: () => import("@/views/post/PostEdit.vue") },
            { path: "post", component: () => import("@/views/post/PostList.vue") },
            { path: "post/:id", component: () => import("@/views/post/PostDetail.vue") },
            { path: "review", component: () => import("@/views/review/Review.vue") },
            { path: "review/detail", component: () => import("@/views/review/Detail.vue") },
            // 모든리스트 조회 라우팅
            { path: 'listAll', name: 'ListAll', component: ListAll },
            // 리스트 g
            { path: "list/detail/:listSeq", component: () =>import("@/views/Lists/ListDetail.vue") },

            // 리스트 다른 사람 서랍 조회
            { path: 'listbox/:listUserSeq', component: () => import("@/views/Lists/ListBox.vue")},
            // 유저 마이페이지 조회
            { path: ":userSeq", meta: { requiresAuth: true },
                component: () => import("@/views/user/UserProfileView.vue") },
            { path: ":userSeq/update", meta: { requiresAuth: true },
                component: () => import("@/views/user/mypage/UpdateMyInfo.vue") },
            { path: ":userSeq/withdraw",
                component: () => import("@/views/user/mypage/DeleteMyInfo.vue") },
            { path: ":userSeq/withdrawSuccess",
                component: () => import("@/views/user/mypage/DeleteInfoSuccess.vue") },



        ]
    },
    {
        path: "/admin",
        component: AdminBaseView,
        meta: { requiresAuth: true },
        children: [
            {
                path: "users",
                component: UserSearch
            },
            {
                path: "active-level",
                component: ActivityLevelSearch
            },
            {
                path: "user/:userSeq",
                component: () => import('@/views/admin/admin-views/UserDetail.vue')
            },
            {
                path: 'report-search',
                component: () => import('@/views/admin/admin-views/ReportSearch.vue')
            },
            {
                path: 'report-reason',
                component: () => import('@/views/admin/admin-views/ReportReason.vue')

            },
            {
                path: 'penalty-detail/:id',
                name: 'ReportHandling',
                component: () => import('@/views/admin/admin-views/PenaltyDetail.vue')
            },
            {
                path: 'penalty-search',
                component: () => import('@/views/admin/admin-views/PenaltySearch.vue')
            }
        ]
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

/* Navigation Guard : beforeEach 가드를 사용하여 라우트 이동 전에 인증 상태를 체크한다. */
router.beforeEach((to, from, next) => { //라우팅 하려고하는곳, 하기전, 한후
    const authStore = useAuthStore();
    const userSeq = authStore.userSeq; // authStore에서 userSeq 값을 가져옴

    // 인증이 필요한 페이지에 접근할 때
    if (to.meta.requiresAuth && !authStore.accessToken) {
        next({path: '/login'}); // 로그인 페이지로
    }
    // 이미 로그인한 상태에서 로그인, 회원가입 페이지에 접근할 때
    else if (authStore.accessToken && (to.path === '/login' || to.path === '/user/auth/register')) {
        console.log('회원이 가입/로그인페이지 접근')
        next({path: `/user/${userSeq}`}); // 마이페이지로
        // 비밀번호 재설정 페이지에 접근할 때
    } else if(authStore.accessToken && to.path === '/user/auth/reset-password') {
        console.log('회원이 재설정 페이지 접근')
        next({path: '/login'});
        // 약관 동의 없이 회원가입 페이지로 직접 접근할 때
    } else if((to.path === '/user/auth/register' && !authStore.isTermsAccepted)) {
        next({ path: '/user/auth/registerTOS' }); // 약관 동의 페이지로
        // 회원이 관리자페이지 접근할때
    } else if((to.path.includes('/admin') && authStore.isTermsAccepted)) {
        next({ path: `/user/${userSeq}` }); // 약관 동의 페이지로
        // 비회원이 마이페이지 관련 페이지에 접근할 때
    } else {
        next(); // 나머지 경우는 계속 진행
    }
});

export default router;
