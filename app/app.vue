<script setup lang="ts">
import { ref, watch, onMounted, provide } from 'vue'

// --- ÉTAT GLOBAL ---
const bgMusicVolume = useState('bgMusicVolume', () => 0.03)
const sfxVolume = useState('sfxVolume', () => 0.5)
const voiceVolume = useState('voiceVolume', () => 0.8)
const isGlobalMuted = useState('isGlobalMuted', () => false)
const globalMusicPlayer = ref<HTMLAudioElement | null>(null)

// Fonction exposée pour lancer la musique depuis n'importe où (ex: index.vue)
const playGlobalMusic = () => {
  if (globalMusicPlayer.value) {
    globalMusicPlayer.value.volume = isGlobalMuted.value ? 0 : bgMusicVolume.value
    // On retourne la promesse pour permettre au caller d'attendre si besoin
    return globalMusicPlayer.value.play().catch((e) => {
      console.warn("Impossible de lancer la musique globale :", e)
    })
  }
  return Promise.resolve()
}
provide('playGlobalMusic', playGlobalMusic)

// Chargement initial depuis le localStorage
onMounted(() => {
  const savedBgVol = localStorage.getItem('bgMusicVolume')
  const savedSfxVol = localStorage.getItem('sfxVolume')
  const savedVoiceVol = localStorage.getItem('voiceVolume')
  const savedMuted = localStorage.getItem('isGlobalMuted')

  if (savedBgVol !== null) bgMusicVolume.value = parseFloat(savedBgVol)
  if (savedSfxVol !== null) sfxVolume.value = parseFloat(savedSfxVol)
  if (savedVoiceVol !== null) voiceVolume.value = parseFloat(savedVoiceVol)
  if (savedMuted !== null) isGlobalMuted.value = savedMuted === 'true'

  if (globalMusicPlayer.value) {
    globalMusicPlayer.value.volume = isGlobalMuted.value ? 0 : bgMusicVolume.value
    updateMusicState()

    const unlockAudio = () => {
      // On tente de jouer seulement si nécessaire
      if (!isGlobalMuted.value && globalMusicPlayer.value?.paused) {
        globalMusicPlayer.value.play()
          .then(() => {
            // Si succès, on n'a plus besoin d'écouter les clics
            document.removeEventListener('click', unlockAudio)
          })
          .catch((e) => {
            // Si échec (toujours bloqué ?), on continue d'écouter
            // console.debug("Tentative de déblocage audio échouée, on réessaiera au prochain clic.", e)
          })
      } else if (!globalMusicPlayer.value?.paused) {
        // Déjà en lecture, on nettoie
        document.removeEventListener('click', unlockAudio)
      }
    }
    // On écoute sur tout le document pour capturer n'importe quelle interaction
    document.addEventListener('click', unlockAudio)
  }
})

// Surveillance pour sauvegarde et mise à jour immédiate
watch(bgMusicVolume, (newVol) => {
  localStorage.setItem('bgMusicVolume', newVol.toString())
  if (globalMusicPlayer.value) {
    globalMusicPlayer.value.volume = isGlobalMuted.value ? 0 : newVol
  }
})

watch(sfxVolume, (newVol) => {
  localStorage.setItem('sfxVolume', newVol.toString())
})

watch(voiceVolume, (newVol) => {
  localStorage.setItem('voiceVolume', newVol.toString())
})

watch(isGlobalMuted, (newMuted) => {
  localStorage.setItem('isGlobalMuted', newMuted.toString())
  if (globalMusicPlayer.value) {
    globalMusicPlayer.value.volume = newMuted ? 0 : bgMusicVolume.value
    updateMusicState()
  }
})

const updateMusicState = () => {
  if (globalMusicPlayer.value) {
    if (isGlobalMuted.value || bgMusicVolume.value === 0) {
      globalMusicPlayer.value.pause()
    } else {
      globalMusicPlayer.value.play().catch(e => {
        console.warn("Autoplay bloqué", e)
      })
    }
  }
}

const toggleGlobalMute = () => {
  isGlobalMuted.value = !isGlobalMuted.value
}
</script>

<template>
  <div class="app-container">
    
    <div class="global-volume-wrapper">
      <div @click="toggleGlobalMute" class="global-mute-btn clickable">
        {{ isGlobalMuted || bgMusicVolume === 0 ? '🔇' : '🔊' }}
      </div>
      
      <div class="volume-panel">
        <div class="slider-group">
          <span title="Musique de fond">🎶</span>
          <input 
            type="range" 
            min="0" 
            max="0.5" 
            step="0.01" 
            v-model.number="bgMusicVolume"
            class="v-slider"
          >
        </div>
        <div class="slider-group">
          <span title="Effets sonores">✨</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            v-model.number="sfxVolume"
            class="v-slider"
          >
        </div>
      </div>
    </div>

    <NuxtPage />

    <audio ref="globalMusicPlayer" src="/music.mp3" loop autoplay></audio>
  </div>
</template>

<style>
/* CSS Global */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #1a1a1a;
}

/* Nouveau Contrôleur de Volume Global */
.global-volume-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 15px;
}

.global-mute-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
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

.volume-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 18px;
  border-radius: 15px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.global-volume-wrapper:hover .volume-panel {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.slider-group {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 1.2rem;
}

.v-slider {
  -webkit-appearance: none;
  width: 100px;
  height: 4px;
  background: rgba(168, 132, 243, 0.3); /* Violet translucide pour le rail */
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.v-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; /* Taille augmentée */
  height: 16px;
  background: #a884f3; /* Violet opaque pour le bouton */
  border-radius: 50%;
  box-shadow: 0 0 5px rgba(0,0,0,0.5);
  border: 2px solid white;
  transition: transform 0.1s;
}

.v-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
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