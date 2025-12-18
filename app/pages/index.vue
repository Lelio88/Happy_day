<script setup lang="ts">
// On récupère le module color-mode pour le bouton
const colorMode = useColorMode()

const toggleDark = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
    <div class="home">
        <button @click="toggleDark" class="dark-btn">
            {{ colorMode.value === 'dark' ? 'Mode Clair ☀️' : 'Mode Sombre 🌙' }}
        </button>

        <h1>Bienvenue 👋</h1>
        <p>Qui es-tu aujourd'hui ?</p>

        <div class="buttons">
            <NuxtLink to="/profile/Asu" class="choice-link">Profil Asu</NuxtLink>
            <NuxtLink to="/profile/Lpk" class="choice-link">Profil Lpk</NuxtLink>
        </div>
    </div>
</template>

<style scoped>
.home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    text-align: center;
}

.buttons {
    margin-top: 2rem;
    display: flex;
    gap: 20px;
}

.choice-link {
    padding: 15px 30px;
    background-color: #42b883;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: transform 0.2s;
}

.choice-link:hover {
    transform: scale(1.05);
}

.dark-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 8px 12px;
    cursor: pointer;
}
</style>