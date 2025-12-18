export type ProfileKey = "Asu" | "Lpk";

export interface AudioItem {
    file: string;
    speaker: string;
}

export interface QuoteData {
    Asu: AudioItem[];
    Lpk: AudioItem[];
}