import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/search',
      name: 'SearchResults',
      component: () => import('../views/SearchResultsView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
    },
    {
      path: '/carpoolings/:id',
      name: 'CarpoolingDetail',
      component: () => import('../views/CarpoolingDetailView.vue'),
    },
    {
      path: '/my-trips',
      name: 'MyTrips',
      component: () => import('../views/MyTripsView.vue'),
    },
    {
      path: '/create-trip',
      name: 'CreateTrip',
      component: () => import('../views/CreateTripView.vue'),
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/credits',
      name: 'Credits',
      component: () => import('../views/CreditsView.vue'),
    },
    {
      path: '/test-modals',
      name: 'TestModals',
      component: () => import('../views/TestModalView.vue'),
    },
    {
      path: '/review/:carpoolingId',
      name: 'ReviewTrip',
      component: () => import('../views/ReviewTripView.vue'),
      props: (route) => ({
        carpoolingId: route.params.carpoolingId,
        driverId: route.query.driverId,
      }),
    },
    {
      path: '/report/:carpoolingId',
      name: 'ReportTrip',
      component: () => import('../views/ReportTripView.vue'),
      props: (route) => ({
        carpoolingId: route.params.carpoolingId,
        driverId: route.query.driverId,
      }),
    },
  ],
})

export default router
