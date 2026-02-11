<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

// --- ÉTAT GLOBAL ---
const isGlobalMuted = useState('isGlobalMuted', () => false)
const globalMusicPlayer = ref<HTMLAudioElement | null>(null)

// Fonction pour basculer le son (Mute/Unmute)
const toggleGlobalMute = () => {
  isGlobalMuted.value = !isGlobalMuted.value
  updateMusicState()
}

// Met à jour l'état du lecteur en fonction du mute
const updateMusicState = () => {
  if (globalMusicPlayer.value) {
    if (isGlobalMuted.value) {
      globalMusicPlayer.value.pause()
    } else {
      // On force la lecture si ce n'est pas mute
      globalMusicPlayer.value.play().catch(e => {
        console.warn("Autoplay empêché par le navigateur (attente d'un clic)", e)
      })
    }
  }
}

// Surveillance de l'état Mute (pour réagir aux changements venant d'ailleurs si besoin)
watch(isGlobalMuted, updateMusicState)

// AU DÉMARRAGE DU SITE
onMounted(() => {
  if (globalMusicPlayer.value) {
    // VOLUME TRÈS BAS (5%)
    globalMusicPlayer.value.volume = 0.03 
    
    // TENTATIVE DE LANCEMENT IMMÉDIAT
    updateMusicState()
    
    // Astuce : Si le navigateur bloque, on lance au premier clic n'importe où
    const unlockAudio = () => {
      if (!isGlobalMuted.value && globalMusicPlayer.value?.paused) {
        globalMusicPlayer.value.play()
        document.removeEventListener('click', unlockAudio)
      }
    }
    document.addEventListener('click', unlockAudio)
  }
})
</script>

<template>
  <div class="app-container">
    
    <div @click="toggleGlobalMute" class="global-mute-btn clickable">
      {{ isGlobalMuted ? '🔇' : '🔊' }}
    </div>

    <NuxtPage />

    <audio ref="globalMusicPlayer" src="/music.mp3" loop></audio>
  </div>
</template>

<style>
/* CSS Global */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #1a1a1a; /* Fond noir par défaut pour éviter les flashs blancs */
}

/* Style du bouton Mute Global */
.global-mute-btn {
  position: fixed; /* Reste fixe même si on scrolle ou change de page */
  top: 20px;
  right: 20px;
  z-index: 9999; /* Toujours au-dessus de tout */
  
  width: 50px;
  height: 50px;
  border-radius: 50%;
  
  /* Effet de verre (Glassmorphism) */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  transition: transform 0.2s, background 0.2s;
}

.global-mute-btn:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
}

.global-mute-btn:active {
  transform: scale(0.95);
}

.clickable {
  cursor: pointer;
  user-select: none;
}
</style>