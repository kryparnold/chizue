import { GuildPlayers } from "./globals";
import { WordGame as RawWordGame } from "@prisma/client";
import { UUID } from "crypto";

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
        [x in WordleLengths]: string[];
    };
};

export type WordleLengths = 4 | 5 | 6;

export interface IStats {
    startTime: number;
    wordCount: number;
    playerCount: number;
    gameCount: number;
    guildCount: number;
}

export type FormattedLocale = "tr" | "en";

export type RawWordGameWithPlayers = RawWordGame & { players: GuildPlayers };

export type ButtonParams = { [x: string]: string };

export enum ProcessTypes {
    SlashCommand = "SlashCommand",
    Word = "Word",
    Number = "Number",
    Button = "Button",
}

interface BaseProcess {
    id: UUID;
    startTime: number;
}

interface ISlashCommandProcess extends BaseProcess {
    type: ProcessTypes.SlashCommand;
    props: {
        authorId: string;
        authorName: string;
        command: string;
        subCommand?: string;
    };
}

interface IButtonProcess extends BaseProcess {
    type: ProcessTypes.Button;
    props: {
        authorId: string;
        authorName: string;
        name: string;
    };
}

interface IWordProcess extends BaseProcess {
    type: ProcessTypes.Word;
    props: {
        word: string;
        playerId: string;
    };
}

interface INumberProcess extends BaseProcess {
    type: ProcessTypes.Number;
    props: {
        integer: number;
        playerId: string;
    };
}

export type TProcess = ISlashCommandProcess | IButtonProcess | IWordProcess | INumberProcess;
