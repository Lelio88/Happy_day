import type { ProfileKey, AudioItem } from '../../types/quotes'
import quotesDataRaw from '../../assets/data/quotes.json'
import { ref, onMounted } from 'vue'

// On force TypeScript à reconnaître la structure du JSON
const quotesData = quotesDataRaw as Record<ProfileKey, AudioItem[]>;

export const useQuotes = (profile: ProfileKey) => {
    // 1. La phrase que l'on affiche à l'écran
    const currentAudio = ref<AudioItem | null>(null)

    // 2. Liste des index déjà vu pour CE profil
    const seenIndexes = ref<number[]>([])

    // Clé unique pour le LocalStorage
    const storageKey = `quotes_seen_${profile}`

    // --- LOGIQUE : SAUVEGARDER ---
    const saveToStorage = () => {
        localStorage.setItem(storageKey, JSON.stringify(seenIndexes.value))
    }

    // --- LOGIQUE : TIRAGE AU SORT ---
    const getNextQuote = () => {
        const allItems = quotesData[profile]

        // 1. Trouver les index qui ne sont pas encore dans SeenIndexes
        let availableIndexes = allItems
            .map((_, index: number) => index)
            .filter((index: number) => !seenIndexes.value.includes(index))

        // 2. Si tous les index ont été vus, on réinitialise
        if (availableIndexes.length === 0) {
            seenIndexes.value = []
            localStorage.removeItem(storageKey)
            // Après reset, tous les index sont disponibles à nouveau
            availableIndexes = allItems.map((_, index: number) => index)
        }
        
        // 3. Tirer un index au hasard parmi les disponibles
        const randomIndexInAvailable = Math.floor(Math.random() * availableIndexes.length)
        const chosenIndex = availableIndexes[randomIndexInAvailable]

        // 4. Mettre à jour l'état et sauvegarder
        if (typeof chosenIndex === 'number') {
            const nextItem = allItems[chosenIndex]
                
            // On vérifie que l'objet existe bien dans le tableau avant de l'assigner
            if (nextItem) {
                currentAudio.value = nextItem // On stocke l'objet { file, speaker }
                seenIndexes.value.push(chosenIndex)
                saveToStorage()
            }
        }
    }

    // --- LOGIQUE : INITIALISATION ---
    // OnMounted s'assure que le code s'exécute côté client sur le navigateur
    onMounted(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            seenIndexes.value = JSON.parse(saved)
        }
        // Tirer la première citation dès le montage
        getNextQuote()
    })

    return {
        currentAudio,
        getNextQuote
    }
}