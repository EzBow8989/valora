<script setup>
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import Sidebar from './components/Sidebar.vue'
import ChatPanel from './components/ChatPanel.vue'
import MobileNav from './components/MobileNav.vue'
import SiteFooter from './components/SiteFooter.vue'
import AuthModal from './components/AuthModal.vue'

const authOpen = ref(false)
const authMode = ref('login')
const sidebarOpen = ref(false)
function openAuth(mode) { authMode.value = mode || 'login'; authOpen.value = true }
</script>

<template>
  <AppHeader @auth="openAuth" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
  <div class="shell">
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="col">
      <main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" @auth="openAuth" />
          </transition>
        </router-view>
      </main>
      <SiteFooter />
    </div>
    <ChatPanel class="chatcol" />
  </div>
  <MobileNav @auth="openAuth" />
  <AuthModal :open="authOpen" :mode="authMode" @close="authOpen = false" />
</template>

<style scoped>
.shell { display: flex; align-items: flex-start; }
.col { flex: 1; min-width: 0; }
main { min-height: 70vh; padding-bottom: 20px; }
@media (max-width: 1180px) { .chatcol { display: none; } }
@media (max-width: 900px) { main { padding-bottom: 76px; } }
</style>
