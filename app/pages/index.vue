<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isTransitioning = ref(false)

// Injection de la commande de musique globale
const playGlobalMusic = inject('playGlobalMusic', () => Promise.resolve())

// On récupère la commande globale pour lancer la musique (State)
const shouldPlayMusic = useState('shouldPlayMusic')

const enterWorld = () => {
  // 1. ON LANCE LA MUSIQUE GLOBALE ICI (Geste utilisateur direct)
  shouldPlayMusic.value = true 
  playGlobalMusic()
  
  // 2. Animation de transition classique
  isTransitioning.value = true
  setTimeout(() => {
    router.push('/cosmos')
  }, 1000)
}

// ... le reste du script reste pareil ...

const goToSurprise = () => {
    // UTILISATION DU ROUTEUR DE NUXT (Ça ne recharge pas la page = musique continue !)
    router.push('/surprise')
}
</script>

<template>
  <div class="landing-page">
    
    <button @click="goToSurprise" class="surprise-btn">
      🕯️
    </button>

    <div class="background-layer" :class="{ 'focus-mode': isTransitioning }"></div>

    <main :class="{ 'fade-out': isTransitioning }">
      
      <div class="intro-box">
        <h1>Cosmos & Chats</h1>   
        <p>
          Bienvenue dans ton café Cosmos & Chats !<br>
          Un endroit tout doux pour écouter des messages tout pipou !
        </p>
        <p class="love-note">Je t'aime fort ! ❤️</p>
      </div>

      <button @click="enterWorld" class="enter-btn">
          <span></span>
          <span>Entrer</span>
      </button>

    </main>
  </div>
</template>

<style scoped>
/* --- 1. CONFIGURATION GÉNÉRALE --- */
.landing-page {
  --icon-scale: 0;
  --icon-rotation: 0;
  --icon-opacity: 0;
  --color-pale-pink: hsl(272 16% 56.99%);
  --color-dark-purple: hsl(269.35 100% 21%);
  --color-light-purple: hsl(269.99 100% 40%);
  --color-bubblegum-pink: hsl(300deg 97% 68%);
  --color-mix: color-mix(in lch, var(--color-bubblegum-pink) 60%, var(--color-dark-purple));

  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: sans-serif;
  
  display: flex;
  justify-content: center;
  align-items: center;
}

/* --- BOUTON SURPRISE (DISCRET) --- */
.surprise-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 100;
    font-size: 1.5rem !important;
    background: rgba(255,255,255,0.5) !important;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    cursor: pointer;
    transition: transform 0.2s;
    /* On annule les styles globaux des boutons pour celui-ci */
    box-shadow: none !important; 
}
.surprise-btn:hover {
    transform: scale(1.1);
    background: rgba(255,255,255,0.8) !important;
}
/* Annulation des pseudo-éléments du bouton coeur pour le bouton surprise */
.surprise-btn::before, .surprise-btn::after, 
.surprise-btn span::before, .surprise-btn span::after {
    display: none !important;
}


/* --- 2. LE FOND --- */
.background-layer {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 0;
  background-image: url('/background.png');
  background-size: cover;
  background-position: center;
  
  filter: blur(15px);
  transform: scale(1.1);
  transition: filter 1s ease-in-out, transform 1s ease-in-out;
}

.background-layer.focus-mode {
  filter: blur(0px);
  transform: scale(1);
}

/* --- 3. LE CONTENU (Main) --- */
main {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
  transition: opacity 0.5s ease-in-out;
  opacity: 1;
}

main.fade-out {
  opacity: 0;
}

/* --- 4. LA BOITE DE TEXTE --- */
.intro-box {
  background: rgba(255, 255, 255, 0.7);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  backdrop-filter: blur(5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  max-width: 600px;
  border: 1px solid rgba(255,255,255,0.5);
}

.intro-box h1 {
  color: #2a1f45;
  font-size: 3rem;
  margin: 0 0 15px 0;
}

.intro-box p {
  font-size: 1.2rem;
  color: #4a4a4a;
  line-height: 1.6;
  margin: 0;
}

.love-note {
  display: block;
  margin-top: 20px !important;
  color: #a884f3 !important;
  font-weight: bold;
  font-size: 1.4rem !important;
}

/* --- 5. LE BOUTON ENTRER (Style Coeur) --- */
.enter-btn {
  all: unset;
  cursor: pointer;
  position: relative;
  display: flex;       
  justify-content: center;
  align-items: center;
  
  font-size: 2.5em; 
  font-weight: 1000;
  color: white;
  transition: transform .2s ease;
}

.enter-btn::before {
  content: "";
  display: block;
  position: absolute;
  width: 100%; height: 100%;
  background: linear-gradient(to bottom right, var(--color-pale-pink), var(--color-pale-pink));
  transform: scale(0.9);
  border-radius: 1000px;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.enter-btn span:nth-child(2) {
  position: relative;
  padding: 0.5em 1.5em;
  z-index: 2;
  display: block;
  border-radius: 1000px;
  transition: transform 0.2s ease;
  line-height: 1;
}

.enter-btn span:nth-child(2)::before,
.enter-btn span:nth-child(2)::after {
  content: "";
  display: block;
  position: absolute;
  width: 100%; height: 100%;
  top: 0; left: 0;
  opacity: var(--icon-opacity);
  transform: scale(var(--icon-scale)) rotate(calc(var(--icon-rotation) * -1deg));
  transition: transform 0.2s ease, opacity .2s ease, --icon-rotation 0.4s cubic-bezier(.02,1.02,.67,1.06);
  pointer-events: none;
  z-index: -1;
}

.enter-btn span:nth-child(2)::before {
  width: 2.1em;
  top: -0.8em; left: -0.8em;
  background: url(https://assets.codepen.io/64/heart+%286%29+%281%29.png) no-repeat center center / contain;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 20%)) saturate(150%);
}

.enter-btn span:nth-child(2)::after {
  width: 1.2em;
  top: 1em; left: 0.5em;
  background: url(https://assets.codepen.io/64/heart+%285%29+%281%29.png) no-repeat center center / contain;
  filter: blur(2px) drop-shadow(0 2px 4px rgb(0 0 0 / 20%)) saturate(150%);
}

.enter-btn span:nth-child(1) {
  position: absolute;
  width: 100%; height: 100%;
  top: 0; left: 0;
  background: transparent;
  pointer-events: none; 
}

.enter-btn span:nth-child(1)::before,
.enter-btn span:nth-child(1)::after {
  content: "";
  display: block;
  position: absolute;
  width: 100%; height: 100%;
  top: 0; right: 0;
  z-index: 5;
  transform: scale(var(--icon-scale)) rotate(calc(var(--icon-rotation) * -1deg));
  transition: transform 0.2s ease, opacity .2s ease, --icon-rotation 0.4s cubic-bezier(.02,1.02,.67,1.06);
  pointer-events: none;
}

.enter-btn span:nth-child(1)::before {
  width: 1.75em;
  top: -1em; right: 0.5em;
  background: url(https://assets.codepen.io/64/heart+%283%29+%281%29.png) no-repeat center center / contain;
  filter: blur(1px) drop-shadow(0 2px 4px rgb(0 0 0 / 20%)) saturate(150%);
}

.enter-btn span:nth-child(1)::after {
  width: 2em;
  top: 1em; right: -0.5em;
  background: url(https://assets.codepen.io/64/heart+%284%29+%281%29.png) no-repeat center center / contain;
  filter: drop-shadow(0 2px 4px rgb(0 0 0 / 20%)) saturate(150%);
}

/* --- INTERACTIONS ENTER BTN --- */
.enter-btn:hover {
  --icon-scale: 1;
  --icon-rotation: 0;
  --icon-opacity: 1;
}

.enter-btn:hover::before {
  transform: scale(1.05);
  background: linear-gradient(to bottom right, var(--color-dark-purple), var(--color-light-purple));
  box-shadow: 0 4px 22px -8px var(--color-mix);
}

.enter-btn:hover > span:nth-child(2) {
  transform: scale(0.95);
}

.enter-btn:active {
  --icon-scale: 0.8;
  --icon-rotation: 20;
  transform: scale(1.05);
}

.enter-btn:active::before {
  box-shadow: 0 2px 12px var(--color-mix);
  transform: scale(0.95);
}

.enter-btn:active span:nth-child(odd)::before,
.enter-btn:active span:nth-child(even)::before {
  --icon-rotation: -20;
}

.enter-btn:active span:nth-child(odd)::after,
.enter-btn:active span:nth-child(even)::after {
  --icon-rotation: 20;
}
</style>