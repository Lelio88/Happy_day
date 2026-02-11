import { ref, onMounted } from 'vue'

// 1. On définit l'interface EXACTE de tes données (plus de "any")
interface Quote {
  file: string;
  speaker: string;
  image: string;
}

// 2. On importe le fichier. 
// @ts-ignore (On dit à TS de se calmer si le module JSON n'est pas strictement reconnu)
import quotesDataRaw from '../../assets/data/quotes.json'

export const useQuotes = (profileName: string) => {
    // 3. On "Force" le typage : on dit que le JSON est un dictionnaire de listes de "Quote"
    const data = quotesDataRaw as Record<string, Quote[]>

    // 4. On type la variable réactive avec notre interface
    const currentQuote = ref<Quote | null>(null)
    
    const seenIndexes = ref<number[]>([])
    const storageKey = `seen_${profileName}`

    const getNextQuote = () => {
        // SÉCURITÉ : Si le profil (ex: "Asuu") n'existe pas dans le JSON
        if (!data || !data[profileName]) {
            console.warn(`Profil introuvable dans le JSON : ${profileName}`)
            // Objet de secours vide pour éviter le crash
            currentQuote.value = { 
                speaker: "Erreur", 
                file: "", 
                image: "" 
            }
            return
        }

        const allItems = data[profileName]

        // Filtrer les messages déjà vus
        let availableIndexes = allItems
            .map((_, index) => index)
            .filter((index) => !seenIndexes.value.includes(index))

        // Reset si tout est vu
        if (availableIndexes.length === 0) {
            seenIndexes.value = []
            availableIndexes = allItems.map((_, index) => index)
            if (typeof window !== 'undefined') localStorage.removeItem(storageKey)
        }

        // Tirage au sort
        if (availableIndexes.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableIndexes.length)
            const chosenIndex = availableIndexes[randomIndex]

            currentQuote.value = allItems[chosenIndex]
            seenIndexes.value.push(chosenIndex)

            if (typeof window !== 'undefined') {
                localStorage.setItem(storageKey, JSON.stringify(seenIndexes.value))
            }
        }
    }

    onMounted(() => {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
            try { seenIndexes.value = JSON.parse(saved) } catch (e) { seenIndexes.value = [] }
        }
        getNextQuote()
    })

    return {
        currentQuote,
        getNextQuote
    }
}