import { Locales } from "@prisma/client";
import { Locale } from "discord.js";

export class Utils{
    static Letters = {
        tr: "abcçdefghıijklmnoöprsştuüvyz",
        en: "abcdefghijklmnopqrstuvwxyz"
    }
    static random<T>(array: T[]){
        return array[Math.floor(Math.random() * array.length)];
    }
    static avatarBaseURL = "https://cdn.discordapp.com/";
    static getAvatarURL(userId: string,avatarHash: string | null){
        return `${this.avatarBaseURL}avatars/${userId}/${avatarHash}.png?size=64`
    }
    static invalidCharacters = /[^a-zA-ZğüşıöçĞÜŞİÖÇ]/;
    static formatLocale(locale: Locales | Locale){
        if(["Turkish",Locale.Turkish].includes(locale)){
            return "tr";
        }else{
            return "en";
        }
    }
}