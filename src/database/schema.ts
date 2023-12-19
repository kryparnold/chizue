import { pgTable, serial, text, varchar, } from "drizzle-orm/pg-core";

export const englishWords = pgTable("englishWords", {
    a: text("a").array(),
    b: text("b").array(),
    c: text("c").array(),
    d: text("d").array(),
    e: text("e").array(),
    f: text("f").array(),
    g: text("g").array(),
    h: text("h").array(),
    i: text("i").array(),
    j: text("j").array(),
    k: text("k").array(),
    l: text("l").array(),
    m: text("m").array(),
    n: text("n").array(),
    o: text("o").array(),
    p: text("p").array(),
    q: text("q").array(),
    r: text("r").array(),
    s: text("s").array(),
    t: text("t").array(),
    u: text("u").array(),
    v: text("v").array(),
    w: text("w").array(),
    x: text("x").array(),
    y: text("y").array(),
    z: text("z").array(),
});

export const turkishWords = pgTable("turkishWords", {
    a: text("a").array(),
    b: text("b").array(),
    c: text("c").array(),
    ç: text("ç").array(),
    d: text("d").array(),
    e: text("e").array(),
    f: text("f").array(),
    g: text("g").array(),
    ğ: text("ğ").array(),
    h: text("h").array(),
    ı: text("ı").array(),
    i: text("i").array(),
    j: text("j").array(),
    k: text("k").array(),
    l: text("l").array(),
    m: text("m").array(),
    n: text("n").array(),
    o: text("o").array(),
    ö: text("ö").array(),
    p: text("p").array(),
    r: text("r").array(),
    s: text("s").array(),
    ş: text("ş").array(),
    t: text("t").array(),
    u: text("u").array(),
    ü: text("ü").array(),
    v: text("v").array(),
    y: text("y").array(),
    z: text("z").array(),
});

export const wordleEnglishWords = pgTable("wordleEnglishWords", {
    4: text("4").array(),
    5: text("5").array(),
    6: text("6").array()
});

export const wordleTurkishWords = pgTable("wordleTurkishWords", {
    4: text("4").array(),
    5: text("5").array(),
    6: text("6").array()
})