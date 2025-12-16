import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top for new navigations (or restore saved position)
    if (savedPosition) return savedPosition
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
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
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/AdminView.vue'),
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
      beforeEnter: (to, from, next) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        const isDriver = user && user.roles && user.roles.includes('chauffeur')

        if (!isDriver) {
          next('/become-driver')
        } else {
          next()
        }
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/become-driver',
      name: 'BecomeDriver',
      component: () => import('../views/BecomeDriverView.vue'),
    },
    {
      path: '/credits',
      name: 'Credits',
      component: () => import('../views/CreditsView.vue'),
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
    {
      path: '/user/:userId',
      name: 'UserProfile',
      component: () => import('../views/UserProfileView.vue'),
    },
    {
      path: '/test/visuals',
      name: 'Visuals',
      component: () => import('../views/test/VisualsView.vue'),
    },
    {
      path: '/mentions-legales',
      name: 'LegalMentions',
      component: () => import('../views/LegalMentionsView.vue'),
    },
  ],
})

// Guard global : redirection forcée pour les admins
router.beforeEach((to, from, next) => {
  // Récupère le user depuis le localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user && user.role === 'admin'
  if (isAdmin && to.path !== '/admin') {
    return next({ path: '/admin' })
  }
  return next()
})

export default router
