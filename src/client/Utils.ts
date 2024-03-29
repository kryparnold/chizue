import { Locales } from "@prisma/client";
import { EmbedFooterData, Locale, User } from "discord.js";
import { FormattedLocale, client } from "@/globals";

export class Utils {
    static Letters = {
        tr: "abcçdefghıijklmnoöprsştuüvyz",
        en: "abcdefghijklmnopqrstuvwxyz",
    };
    static random<T>(array: T[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
    static randomInt(min: number = 0, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static randomLetter(locale: "tr" | "en") {
        return this.random(Array.from(this.Letters[locale]));
    }
    static getRandomWords(roll: number) {
        const randomWords: string[] = [];
        for (let i = 0; i < roll; i++) {
            Array.from(this.Letters.en).forEach((letter) => {
                //@ts-ignore
                randomWords.push(this.random(client.words.en[letter]));
            });
        }

        return randomWords;
    }
    static capitalize(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    static formatDate(date: string, threshold = 1) {
        return date.length > threshold ? date : "0" + date;
    }
    static invalidCharacters = /[^a-zA-ZğüşıöçĞÜŞİÖÇ]/;
    static formatLocale(locale: Locales | Locale): FormattedLocale {
        if (["Turkish", Locale.Turkish].includes(locale)) {
            return "tr";
        }
        return "en";
    }
    static hourToMs(hour: number) {
        return hour * 3600000;
    }
    static getUserMetadata(locale: Locale, user: User) {
        const userLocale = this.formatLocale(locale);
        const userFooter: EmbedFooterData = {
            text: user.username,
            iconURL: user.avatarURL() as string,
        };

        return {
            userLocale,
            userFooter,
        };
    }
    static wordleEmotes = {
        "0": {
            a: "<:a_0:1193835820600283179>",
            b: "<:b_0:1193835824773595209>",
            ç: "<:ch_0:1193835829144064010>",
            c: "<:c_0:1193835832990245014>",
            d: "<:d_0:1193835837020962827>",
            e: "<:e_0:1193835841232056362>",
            f: "<:f_0:1193835845896126494>",
            ğ: "<:gh_0:1193835849834582027>",
            g: "<:g_0:1193835855589154846>",
            h: "<:h_0:1193835859661832263>",
            ı: "<:ih_0:1193835864149729320>",
            i: "<:i_0:1193835867953971200>",
            j: "<:j_0:1193835871984693290>",
            k: "<:k_0:1193835876652949506>",
            l: "<:l_0:1193835880717221918>",
            m: "<:m_0:1193835886413099028>",
            n: "<:n_0:1193838591470731335>",
            ö: "<:oh_0:1193838594897494128>",
            o: "<:o_0:1193838599628664853>",
            p: "<:p_0:1193838604078821416>",
            q: "<:q_0:1193838609242017853>",
            r: "<:r_0:1193838613293699132>",
            ş: "<:sh_0:1193838617555111956>",
            s: "<:s_0:1193838622642814989>",
            t: "<:t_0:1193838634856632372>",
            ü: "<:uh_0:1193838639176765480>",
            u: "<:u_0:1193838643450744905>",
            v: "<:v_0:1193838647447928852>",
            w: "<:w_0:1193838651457671218>",
            x: "<:x_0:1193838655597461525>",
            y: "<:y_0:1193838659644948481>",
            z: "<:z_0:1193838664116097114>",
        },
        "1": {
            a: "<:a_1:1193835822370275338>",
            b: "<:b_1:1193835826531016704>",
            ç: "<:ch_1:1193835830364614687>",
            c: "<:c_1:1193835834420498493>",
            d: "<:d_1:1193835838421860402>",
            e: "<:e_1:1193835842804928582>",
            f: "<:f_1:1193835847343153202>",
            ğ: "<:gh_1:1193835851986239489>",
            g: "<:g_1:1193835857011019806>",
            h: "<:h_1:1193835861234683924>",
            ı: "<:ih_1:1193835865491906590>",
            i: "<:i_1:1193835869367439360>",
            j: "<:j_1:1193835873624670249>",
            k: "<:k_1:1193835877605064727>",
            l: "<:l_1:1193835882554331228>",
            m: "<:m_1:1193835888095015002>",
            n: "<:n_1:1193838592905195520>",
            ö: "<:oh_1:1193838596864626729>",
            o: "<:o_1:1193838601180553286>",
            p: "<:p_1:1193838606310199336>",
            q: "<:q_1:1193838610764542012>",
            r: "<:r_1:1193838614640078948>",
            ş: "<:sh_1:1193838619295756358>",
            s: "<:s_1:1193838624131797052>",
            t: "<:t_1:1193838636433678386>",
            ü: "<:uh_1:1193838640456015943>",
            u: "<:u_1:1193838644671299675>",
            v: "<:v_1:1193838648727195710>",
            w: "<:w_1:1193838652992794634>",
            x: "<:x_1:1193838656968998914>",
            y: "<:y_1:1193838661289128007>",
            z: "<:z_1:1193838665349222491>",
        },
        "2": {
            a: "<:a_2:1193835823691485204>",
            b: "<:b_2:1193835827860615218>",
            ç: "<:ch_2:1193835831761322014>",
            c: "<:c_2:1193835835607482420>",
            d: "<:d_2:1193835839785025577>",
            e: "<:e_2:1193835844067401869>",
            f: "<:f_2:1193835848358170696>",
            ğ: "<:gh_2:1193835854075023420>",
            g: "<:g_2:1193835858441285743>",
            h: "<:h_2:1193835862417494016>",
            ı: "<:ih_2:1193835866620186634>",
            i: "<:i_2:1193835870869016696>",
            j: "<:j_2:1193835875205906483>",
            k: "<:k_2:1193835879345692773>",
            l: "<:l_2:1193835884756336650>",
            m: "<:m_2:1193838590233423913>",
            n: "<:n_2:1193838594004099082>",
            ö: "<:oh_2:1193838598156460172>",
            o: "<:o_2:1193838602816331836>",
            p: "<:p_2:1193838607883055144>",
            q: "<:q_2:1193838611628560466>",
            r: "<:r_2:1193838616288436315>",
            ş: "<:sh_2:1193838621036380162>",
            s: "<:s_2:1193838631891247174>",
            t: "<:t_2:1193838637889114162>",
            ü: "<:uh_2:1193838642196648006>",
            u: "<:u_2:1193838646063808562>",
            v: "<:v_2:1193838649830281249>",
            w: "<:w_2:1193838654230118420>",
            x: "<:x_2:1193838658504110121>",
            y: "<:y_2:1193838662715191307>",
            z: "<:z_2:1193838666099986463>",
        },
    };
}
