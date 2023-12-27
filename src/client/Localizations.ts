export const localizations = {
    tr: {
        English: "İngilizce",
        Turkish: "Türkçe",
        Endless: "Sonsuz",
        Normal: "Normal",
        WordGame: "Kelime Oyunu",
        CountingGame: "Sayı Sayma Oyunu",
        buttonSetup: "Kur",
        gameSetupSuccess: "Oyun başarıyla kuruldu!",
        gameSetupFailed:
            "Oyun kurulumu başarısız, lütfen daha sonra tekrar deneyin.",
        buttonRemove: "Kaldır",
        gameMode: "Oyun Modu",
        gameModeNormalDesc:
            "Normal oyun modu, 40 kelimeden önce oyun bitirilemez",
        gameModeEndlessDesc: "Sonsuz oyun modu, oyun bitirilemez.",
        gameModeEndless: "Sonsuz",
        gameModeChange: (mode: string) =>
            `Oyun modu başarıyla **${mode}** yapıldı.`,
        channelLangTr: "Türkçe",
        channelLangTrDesc: "Türkçe için oyun dili seçeneği.",
        channelLangEn: "İngilizce",
        channelLangEnDesc: "İngilizce için oyun dili seçeneği.",
        channelLocale: "Kanal Dili",
        channelWordCount: "Yazılan Kelime",
        gameLangChange: (lang: string) =>
            `Oyun dili başarıyla **${lang}** yapıldı.`,
        gameExists: (gameType: string) => `Bu kanalda **${gameType}** kurulu.`,
        gameDoesntExists: "Bu kanalda oyun kurulu değil.",
        commandTimeout: (command: string) =>
            `Bu komut artık geçersiz, eğer tekrar kullanmak isterseniz lütfen **/${command}** komudunu tekrar kullanın.`,
    },
    en: {
        English: "English",
        Turkish: "Turkish",
        Endless: "Endless",
        Normal: "Normal",
        WordGame: "Word Game",
        CountingGame: "Counting Game",
        buttonSetup: "Setup",
        gameSetupSuccess: "Game setup successfull!",
        gameSetupFailed: "Game setup failed, please try again later.",
        buttonRemove: "Remove",
        gameMode: "Game Mode",
        gameModeNormalDesc:
            "Normal game mode, game cannot be finished until 40 words.",
        gameModeEndlessDesc: "Endless game mode, game cannot be finished.",
        gameModeEndless: "Endless",
        gameModeChange: (mode: string) => `Game mode changed to: **${mode}**`,
        channelLangTr: "Turkish",
        channelLangTrDesc: "Game language option for Turkish.",
        channelLangEn: "English",
        channelLangEnDesc: "Game language option for English.",
        channelLocale: "Channel Language",
        channelWordCount: "Word Counter",
        gameLangChange: (lang: string) => `Game language changed to: **${lang}**`,
        gameExists: (gameType: string) =>
            `There is a **${gameType}** in this channel.`,
        gameDoesntExists: "There is no game in this channel.",
        commandTimeout: (command: string) =>
            `This command has expired, if you want to use it again please use **/${command}** command again.`,
    },
};
