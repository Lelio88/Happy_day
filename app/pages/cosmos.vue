<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLeaving = ref(false)

// --- EASTER EGG (Le Chat de Nessrine) ---
const showEasterEgg = ref(false)

// --- GESTION AUDIO BAR (Local) ---
const isGlobalMuted = useState('isGlobalMuted') 
const sfxVolume = useState('sfxVolume', () => 0.5)
const voiceVolume = useState('voiceVolume', () => 0.8)
const barAmbience = ref<HTMLAudioElement | null>(null)

watch([isGlobalMuted, sfxVolume], ([muted, vol]) => {
  if (barAmbience.value) {
    barAmbience.value.volume = (vol as number) * 0.1
    if (muted) barAmbience.value.pause()
    else barAmbience.value.play().catch(() => {})
  }
})

const handleBack = () => {
  isLeaving.value = true
  if (barAmbience.value) {
    const audio = barAmbience.value
    const startVol = audio.volume
    const fadeInterval = setInterval(() => {
      if (audio.volume > 0.01) audio.volume -= startVol / 20
      else { audio.volume = 0; audio.pause(); clearInterval(fadeInterval) }
    }, 50)
  }
  setTimeout(() => { router.push('/') }, 1000)
}

// --- LOGIQUE QUOTES ---
interface Quote { file: string; speaker: string; image?: string; text?: string; }
// @ts-ignore
import quotesDataRaw from '../../assets/data/quotes.json'

const useQuotes = (profileName: string) => {
    const data = quotesDataRaw as Record<string, Quote[]>
    const currentQuote = ref<Quote | null>(null)
    const seenIndexes = ref<number[]>([])
    const storageKey = `seen_${profileName}`

    const getNextQuote = () => {
        if (!data || !data[profileName]) {
            currentQuote.value = { speaker: "Erreur", file: "", text: "Profil introuvable", image: "" }
            return
        }
        const allItems = data[profileName]
        let availableIndexes = allItems.map((_, index) => index).filter((index) => !seenIndexes.value.includes(index))

        if (availableIndexes.length === 0) {
            seenIndexes.value = []
            availableIndexes = allItems.map((_, index) => index)
            if (typeof window !== 'undefined') localStorage.removeItem(storageKey)
        }

        if (availableIndexes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableIndexes.length)
            const chosenIndex = availableIndexes[randomIndex]
            currentQuote.value = allItems[chosenIndex]
            seenIndexes.value.push(chosenIndex)
            if (typeof window !== 'undefined') localStorage.setItem(storageKey, JSON.stringify(seenIndexes.value))
        }
    }
    onMounted(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) try { seenIndexes.value = JSON.parse(saved) } catch (e) { seenIndexes.value = [] }
        getNextQuote()
    })
    return { currentQuote, getNextQuote }
}

const { currentQuote, getNextQuote } = useQuotes('Asuu')
const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const progress = ref(0)

watch(voiceVolume, (newVol) => {
  if (audioPlayer.value) audioPlayer.value.volume = newVol
})

const togglePlay = () => {
  if (!audioPlayer.value) return
  if (audioPlayer.value.paused) { audioPlayer.value.play(); isPlaying.value = true }
  else { audioPlayer.value.pause(); isPlaying.value = false }
}

const handleNext = () => {
  getNextQuote()
  isPlaying.value = false
  progress.value = 0
  setTimeout(() => { if (audioPlayer.value) audioPlayer.value.load() }, 50)
}

const updateProgress = () => {
  if (audioPlayer.value && audioPlayer.value.duration) {
    progress.value = (audioPlayer.value.currentTime / audioPlayer.value.duration) * 100
  }
}

const onLoadedMetadata = () => {
  if (audioPlayer.value) audioPlayer.value.volume = voiceVolume.value
}

const onEnded = () => { isPlaying.value = false; progress.value = 0 }

// --- LIFECYCLE ---
onMounted(() => {
  if (barAmbience.value) {
    barAmbience.value.volume = (sfxVolume.value || 0.5) * 0.1 
    if (!isGlobalMuted.value) barAmbience.value.play().catch(e => console.log("Autoplay Bar bloqué", e))
  }
})
onUnmounted(() => { if(barAmbience.value) barAmbience.value.pause() })
</script>

<template>
  <div class="main-container" :class="{ 'blur-mode': isLeaving }">
    
    <audio ref="barAmbience" src="/bar.mp3" loop></audio>

    <div class="cat-hotspot" @click="showEasterEgg = true" title="Miaou ?"></div>

    <div v-if="showEasterEgg" class="easter-egg-modal" @click="showEasterEgg = false">
        <div class="easter-egg-content">
            <img src="/nessrine_cat.jpg" alt="Le chat de Nessrine" />
            <p>Surprise, voilà BIBOUUUU ! 🐱✨</p>
        </div>
    </div>

    <div @click="handleBack" class="back-button clickable" :class="{ 'fade-out': isLeaving }">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    </div>

    <div class="content-wrapper" :class="{ 'fade-out': isLeaving }">
      
      <section class="profile-card pixel-box white-theme">
        <div class="cat-container">
            <div class="cat">
                <div class="head">
                    <div class="ears"><div class="ear left"></div><div class="ear right"></div></div>
                    <div class="eyes"><div class="eye left"></div><div class="eye right"></div></div>
                    <div class="muzzle"><div class="nose"></div></div>
                </div>
                <div class="body"><div class="paw"></div></div>
                <div class="tail">
                  <div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"><div class="tail-segment"></div></div></div></div></div></div></div></div></div></div></div></div></div></div>
                </div>
            </div>
        </div>

        <h2 class="user-name">{{ currentQuote?.speaker || 'Cosmos' }}</h2>
        
        <button @click="handleNext" class="next-button pixel-button">
          <span class="heart-icon">♥</span> Next
        </button>
      </section>

      <section class="message-box pixel-box glass-theme">
        <h3 class="message-title">Un message de :</h3>
        <div class="sender-avatar-placeholder">
           <img v-if="currentQuote?.image" :src="currentQuote.image" alt="Avatar" class="pixel-avatar"/>
           <div v-else class="pixel-art-icon">🐱</div>
        </div>

        <div class="audio-player-custom white-theme">
          <button @click="togglePlay" class="play-button">{{ isPlaying ? '❚❚' : '▶' }}</button>
          
          <div class="voice-volume-control">
            <div class="voice-icon">🎙️</div>
            <div class="voice-slider-wrapper">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                v-model.number="voiceVolume"
                class="voice-v-slider"
              >
            </div>
          </div>

          <div class="progress-bar-container">
            <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <audio 
            ref="audioPlayer" 
            :src="currentQuote?.file" 
            @timeupdate="updateProgress" 
            @ended="onEnded"
            @loadedmetadata="onLoadedMetadata"
            :volume="voiceVolume"
          ></audio>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

/* --- VOLUME VOIX --- */
.voice-volume-control {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  cursor: pointer;
  position: relative;
  width: 30px;
}

.voice-icon {
  font-size: 1.2rem;
  z-index: 2;
  background: var(--white-off);
  padding: 5px 0;
}

.voice-slider-wrapper {
  height: 0;
  width: 30px;
  overflow: hidden;
  transition: height 0.3s ease;
  display: flex;
  justify-content: center;
  position: absolute;
  bottom: 30px;
  background: var(--white-off);
  border-radius: 10px 10px 0 0;
}

.voice-volume-control:hover .voice-slider-wrapper {
  height: 100px;
  padding: 10px 0;
}

.voice-v-slider {
  -webkit-appearance: none;
  width: 4px;
  height: 80px;
  background: rgba(168, 132, 243, 0.3);
  border-radius: 2px;
  outline: none;
  writing-mode: bt-lr;
  appearance: slider-vertical;
}

.voice-v-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: var(--purple-primary);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid white;
}

/* --- HOTSPOT INVISIBLE --- */
.cat-hotspot {
    position: absolute;
    bottom: 10px;
    left: 150px;
    width: 400px;  /* Largeur estimée du chat sur le fond */
    height: 200px; /* Hauteur estimée */
    z-index: 5;    /* Au dessus du fond, mais en dessous du reste */
    cursor: help;  /* Curseur point d'interrogation pour l'indice */
    /*background: rgba(255, 0, 0, 0.3);*/
}

/* --- MODALE EASTER EGG --- */
.easter-egg-modal {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    animation: fadeIn 0.3s ease;
}

.easter-egg-content {
    background: white;
    padding: 20px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 0 30px rgba(168, 132, 243, 0.5);
    transform: scale(0.8);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.easter-egg-content img {
    max-width: 80vw;
    max-height: 70vh;
    border-radius: 10px;
    border: 3px solid #a884f3;
}

.easter-egg-content p {
    font-family: 'VT323', monospace;
    font-size: 2rem;
    color: #2a1f45;
    margin-top: 10px;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { to { transform: scale(1); } }

/* --- LE RESTE DU CSS (Inchangé) --- */
.main-container {
  --bg-purple-dark: #2a1f45;
  --purple-primary: #a884f3;
  --purple-light: #e0d5f7;
  --glass-bg: rgba(62, 47, 91, 0.65);
  --white-off: #fffcf2;
  --text-dark: #3E2F5B;
  --pixel-font: 'VT323', monospace;
  --border-radius-pixel: 12px;

  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--white-off);
  font-family: var(--pixel-font);
  font-size: 20px;
  overflow: hidden;
  transition: filter 1s ease-in-out, transform 1s ease-in-out;
  filter: blur(0px);
  transform: scale(1);
}
.main-container.blur-mode { filter: blur(15px); transform: scale(1.1); }
.content-wrapper, .back-button { transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out; opacity: 1; }
.fade-out { opacity: 0; transform: scale(0.95); pointer-events: none; }
* { box-sizing: border-box; }
.back-button { position: absolute; top: 20px; left: 20px; background: var(--white-off); width: 50px; height: 50px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: var(--purple-primary); box-shadow: 3px 3px 0px rgba(0,0,0,0.2); border: 2px solid var(--purple-primary); z-index: 10; }
.clickable { cursor: pointer; transition: transform 0.1s; }
.clickable:active { transform: scale(0.95); }
.content-wrapper { display: flex; width: 90%; max-width: 1000px; gap: 30px; align-items: flex-end; height: 60vh; }
.pixel-box { border-radius: var(--border-radius-pixel); box-shadow: 4px 4px 0px rgba(0,0,0,0.2); }
.white-theme { background-color: var(--white-off); color: var(--text-dark); }
.glass-theme { background-color: var(--glass-bg); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 2px solid rgba(168, 132, 243, 0.3); }
.profile-card { width: 300px; height: 550px; flex-shrink: 0; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; margin-bottom: 20px; overflow: hidden; }
.user-name { font-size: 2.5rem; text-transform: uppercase; line-height: 1.1; z-index: 5; position: relative; margin: auto 0; width: 100%; word-wrap: break-word; }
.pixel-button { background-color: var(--purple-primary); color: white; border: none; padding: 10px 25px; font-family: var(--pixel-font); font-size: 1.4rem; border-radius: 25px; cursor: pointer; display: flex; align-items: center; gap: 10px; box-shadow: 3px 3px 0px rgba(0,0,0,0.3); transition: transform 0.1s; z-index: 5; position: relative; }
.pixel-button:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0px rgba(0,0,0,0.3); }
.message-box { flex-grow: 1; height: 100%; padding: 30px; display: flex; flex-direction: column; }
.message-title { font-size: 2rem; margin-bottom: 10px; }
.sender-avatar-placeholder { flex-grow: 1; width: 100%; display: flex; justify-content: center; align-items: center; overflow: hidden; margin-bottom: 15px; }
.pixel-avatar { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; border: 2px solid var(--purple-primary); box-shadow: 2px 2px 0px rgba(0,0,0,0.2); }
.audio-player-custom { display: flex; align-items: center; padding: 15px 20px; border-radius: 40px; gap: 15px; margin-top: auto; }
.play-button { background: none; border: none; color: var(--purple-primary); font-size: 1.5rem; cursor: pointer; width: 30px; padding: 0; display: flex; justify-content: center; }
.progress-bar-container { flex-grow: 1; height: 12px; background-color: #EAEAEA; border-radius: 6px; overflow: hidden; }
.progress-bar-fill { height: 100%; background-color: var(--purple-primary); transition: width 0.1s linear; border-radius: 6px; }
.cat-container { transform: scale(0.8); height: 180px; width: 100%; display: flex; justify-content: center; align-items: flex-start; flex-shrink: 0; }
.cat { position: relative; width: 100%; max-width: 200px; }
.cat * { text-align: center; margin-left: auto; margin-right: auto; }
.cat, .ears, .eyes, .muzzle, .body, .paw, .tail, .tail-segment {position: relative;}
.head, .body, .paw, .tail-segment {background-color: #3E2F5B;} 
.left {float: left;} .right {float: right;}
.cat { margin-top: 50px; animation: purr 5s infinite cubic-bezier(0,.75,1,.25); }
.head { width: 100px; height: 90px; border-radius: 50%; z-index: 100; animation: head-bob 5s infinite ease-in-out; }
.ears { top: -20px; z-index: -100; }
.ear { width: 0; height: 0; border-left: 25px solid transparent; border-right: 25px solid transparent; border-bottom: 50px solid #3E2F5B; }
.ear.left { transform: rotate(-20deg) translateX(-10px); }
.ear.right { transform: rotate(20deg) translateX(10px); }
.eyes { top: -18px; width: 60%; }
.eye { width: 16px; height: 16px; border-radius: 50%; background-color: #FFD700; animation: eye-blink 5s infinite; text-align: center; }
.muzzle { top: 50px; }
.nose { width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #a884f3; }
.body { width: 200px; height: 120px; border-top-left-radius: 200px; border-top-right-radius: 200px; top: -75px; left: 0; z-index: -10; }
.paw { height: 30px; width: 50px; border-radius: 25px; left: -80px; top: 90px; }
.tail { left: 85px; top: -100px; transform: rotate(90deg); width: 30px; }
.tail-segment { height: 20px; width: 30px; border-radius: 25px; top: 0px; left: 10px; animation: tail-swish 5s infinite cubic-bezier(.8,0,.2,1); }
@keyframes tail-swish { 0% {transform: rotate(12deg);} 10% {transform: rotate(12deg);} 40% {transform: rotate(-5deg);} 50% {transform: rotate(5deg);} 60% {transform: rotate(-5deg);} 100% {transform: rotate(12deg);} }
@keyframes head-bob { 0% {transform: translateX(-15px) translateY(45px);} 10% {transform: translateX(-15px) translateY(45px);} 30% {transform: translateX(0) translateY(0);} 75% {transform: translateX(0) translateY(0);} 90% {transform: translateX(-15px) translateY(45px);} 100% {transform: translateX(-15px) translateY(45px);} }
@keyframes eye-blink { 0% {transform: scaleY(0);} 10% {transform: scaleY(0);} 15% {transform: scaleY(1);} 48% {transform: scaleY(1);} 50% {transform: scaleY(0);} 52% {transform: scaleY(1);} 90% {transform: scaleY(1);} 95% {transform: scaleY(0);} 100% {transform: scaleY(0);} }
@keyframes purr { 0% {left: -1px;} 1% {left: 0px;} 2% {left: -1px;} 3% {left: 0px;} 4% {left: -1px;} 5% {left: 0px;} 6% {left: -1px;} 7% {left: 0px;} 8% {left: -1px;} 9% {left: 0px;} 10% {left: -1px;} 11% {left: 0px;} 12% {left: -1px;} 13% {left: 0px;} 14% {left: -1px;} 15% {left: 0px;} 16% {left: -1px;} 17% {left: 0px;} 18% {left: -1px;} 19% {left: 0px;} 20% {left: -1px;} 21% {left: 0px;} 94% {left: 0px;} 95% {left: -1px;} 96% {left: 0px;} 97% {left: -1px;} 98% {left: 0px;} 99% {left: -1px;} 100% {left: 0px;} }
</style>