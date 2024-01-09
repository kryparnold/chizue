import { Players } from "./globals";
import { WordGame as RawWordGame } from "@prisma/client";


export interface ITurkishWords {
    a: string[];
    b: string[];
    c: string[];
    ç: string[];
    d: string[];
    e: string[];
    f: string[];
    g: string[];
    h: string[];
    ı: string[];
    i: string[];
    j: string[];
    k: string[];
    l: string[];
    m: string[];
    n: string[];
    o: string[];
    ö: string[];
    p: string[];
    r: string[];
    s: string[];
    ş: string[];
    t: string[];
    u: string[];
    ü: string[];
    v: string[];
    y: string[];
    z: string[];
}

export interface IEnglishWords {
    a: string[];
    b: string[];
    c: string[];
    d: string[];
    e: string[];
    f: string[];
    g: string[];
    h: string[];
    i: string[];
    j: string[];
    k: string[];
    l: string[];
    m: string[];
    n: string[];
    o: string[];
    p: string[];
    q: string[];
    r: string[];
    s: string[];
    t: string[];
    u: string[];
    v: string[];
    w: string[];
    x: string[];
    y: string[];
    z: string[];
}

export type IWordleWords = {
    [x in FormattedLocale]: {
        [x in WordleLengths]: string[]
    };
};

export type WordleLengths = 4 | 5 | 6;

export interface IStats {
    startTime: number,
    wordCount: number,
    playerCount: number
}

export type FormattedLocale = "tr" | "en";

export type RawWordGameWithPlayers = RawWordGame & {players: Players};
