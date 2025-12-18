<script setup lang="ts">
// On garde uniquement l'import du Type (car ce n'est pas une fonction)
import type { ProfileKey } from '../../../types/quotes';

const route = useRoute();
const colorMode = useColorMode();
const profileId = route.params.id as ProfileKey;

const { currentAudio, getNextQuote } = useQuotes(profileId);

const toggleDark = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};

const audioPlayer = ref<HTMLAudioElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)

const updateProgress = () => {
    if (audioPlayer.value) {
        currentTime.value = audioPlayer.value.currentTime
        duration.value = audioPlayer.value.duration
    }
}

watch(currentAudio, () => {
    if (audioPlayer.value) {
        // IMPORTANT : .load() assure que le nouveau fichier est bien chargé avant de jouer
        audioPlayer.value.load(); 
        audioPlayer.value.play().catch(e => console.log("Lecture auto bloquée par le navigateur", e));
    }
});

// --- VISUALISEUR ---
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null; // IMPORTANT : On garde la source en mémoire
let dataArray: Uint8Array | null = null;
let animationId: number;

const draw = () => {
    if (!canvasRef.value || !analyser || !dataArray) return;

    animationId = requestAnimationFrame(draw);
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d')!;

    // Si le canvas est caché ou nul, on arrête
    if (!ctx) return;

    analyser.getByteFrequencyData(dataArray as any);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2;
    let x = 0;

    // Récupération de la couleur du thème (hack simple)
    const isDark = colorMode.value === 'dark';
    
    dataArray.forEach((value) => {
        const barHeight = (value / 255) * canvas.height; // Mise à l'échelle

        // Couleur dynamique selon le mode
        ctx.fillStyle = isDark ? `rgb(66, 184, 131)` : `rgb(50, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2;
    });
};

const initVisualizer = () => {
    // 1. Initialiser le contexte s'il n'existe pas
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // 2. IMPORTANT : Réveiller le contexte s'il est suspendu (règle des navigateurs)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    // 3. IMPORTANT : Ne créer la source et l'analyseur qu'une SEULE fois
    if (!source && audioPlayer.value) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        source = audioContext.createMediaElementSource(audioPlayer.value);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        draw(); // Lancer la boucle de dessin uniquement après la configuration
    }
};

onUnmounted(() => {
    cancelAnimationFrame(animationId);
    if (audioContext) audioContext.close();
});
</script>

<template>
    <div class="container">
        
        <nav class="top-nav">
            <NuxtLink to="/">← Retour</NuxtLink>
            <button @click="toggleDark">
                {{ colorMode.value === 'dark' ? '☀️' : '🌙' }}
            </button>
        </nav>

        <div v-if="currentAudio" class="audio-content">
            <canvas ref="canvasRef" width="300" height="100"></canvas>

            <audio 
                ref="audioPlayer" 
                :src="`/audio/${currentAudio.file}`" 
                @timeupdate="updateProgress"
                @loadedmetadata="updateProgress"
                @play="initVisualizer"
                style="display: none;" 
            ></audio>
            <div class="progress-container">
                <div class="progress-bar" :style="{ width: (duration ? (currentTime / duration * 100) : 0) + '%' }"></div>
            </div>
            <h2 ><em>🎙️ {{ currentAudio.speaker }}</em></h2>
            <button class="next-btn" @click="getNextQuote">♥</button>
        </div>
    </div>
</template>

<style scoped>

.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s, color 0.3s;
    padding: 20px;
}

.top-nav {
    position: absolute;
    top: 20px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    box-sizing: border-box;
}

.audio-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 400px;
}

.progress-container {
    width: 100%;
    height: 10px;
    background: #ccc;
    border-radius: 5px;
    margin: 20px 0;
    overflow: hidden;
    cursor: pointer; /* Idée future : rendre la barre cliquable */
}

.progress-bar {
    height: 100%;
    background: #42b883;
    transition: width 0.1s linear;
}

.next-btn {
    padding: 12px 24px;
    font-size: 1.1rem;
    background-color: #42b883;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
}

.next-btn:hover {
    transform: scale(1.05);
}

/* Gestion du Dark Mode via CSS global (à laisser dans un style non-scoped ou app.vue) 
   mais ici on gère les éléments locaux */
</style>