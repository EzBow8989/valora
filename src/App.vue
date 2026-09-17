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
const chatOpen = ref(true)
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
    <ChatPanel v-if="chatOpen" class="chatcol" @close="chatOpen = false" />
  </div>
  <button v-if="!chatOpen" class="chat-reopen" aria-label="Open chat" @click="chatOpen = true">💬</button>
  <MobileNav @auth="openAuth" />
  <AuthModal :open="authOpen" :mode="authMode" @close="authOpen = false" />
</template>

<style scoped>
.shell { display: flex; align-items: flex-start; }
.col { flex: 1; min-width: 0; }
main { min-height: 70vh; padding-bottom: 20px; }
.chat-reopen { position: fixed; right: 18px; bottom: 18px; z-index: 60; width: 52px; height: 52px; border-radius: 999px; border: 1px solid var(--line); background: linear-gradient(135deg, var(--brand-2), var(--brand)); color: #fff; font-size: 22px; box-shadow: 0 12px 30px rgba(0,0,0,.45); cursor: pointer; }
.chat-reopen:hover { filter: brightness(1.08); }
@media (max-width: 1180px) { .chatcol, .chat-reopen { display: none; } }
@media (max-width: 900px) { main { padding-bottom: 76px; } }
</style>
