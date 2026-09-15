<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import MobileNav from './components/MobileNav.vue'
import SiteFooter from './components/SiteFooter.vue'
import AuthModal from './components/AuthModal.vue'

const authOpen = ref(false)
const authMode = ref('login')
function openAuth(mode) {
  authMode.value = mode || 'login'
  authOpen.value = true
}
</script>

<template>
  <AppHeader @auth="openAuth" />
  <main>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" @auth="openAuth" />
      </transition>
    </router-view>
  </main>
  <SiteFooter />
  <MobileNav @auth="openAuth" />
  <AuthModal :open="authOpen" :mode="authMode" @close="authOpen = false" />
</template>

<style scoped>
main { min-height: 60vh; }
</style>
