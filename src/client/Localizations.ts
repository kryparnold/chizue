export const localizations = {
    tr: {
        Turkish: "Türkçe",
        English: "İngilizce",
        tr: "Türkçe",
        en: "İngilizce",
        Endless: "Sonsuz",
        Normal: "Normal",
        WordGame: "Kelime Oyunu",
        Word: "Kelime",
        Length: "Uzunluk",
        Locale: "Dil",
        CountingGame: "Sayı Sayma Oyunu",
        anErrorOccured: "Oops, bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        buttonSetup: "Kurulum",
        buttonRemove: "Kaldır",
        buttonConfirm: "Onayla",
        buttonHowToPlay: "Nasıl Oynanır?",
        buttonGuess: "Tahmin Et!",
        buttonTicketUserHasTicket: "Halihazırda bir ticket'ınız bulunuyor.",
        buttonTicketSuccess: (channelId: string) => `Ticket başarıyla oluşturuldu: <#${channelId}>`,
        confirmRemove: "Kaldırmayı Onayla",
        confirmRemoveDesc: "Oyunu kaldırmak için 15 saniyen var. Emin misin?",
        confirmRemoveExpire: "Onay süren doldu.",
        confirmUsed: "Bu onay mesajı artık geçerli değil.",
        gameSamePlayer: "Aynı oyuncu peşpeşe oynayamaz.",
        wordGameInvalidLetter: (letter: string) => `Kelime **${letter}** harfiyle başlamalı.`,
        wordGameInvalidWord: "Bu kelime sözlüğümde yok.",
        wordGameSameWord: "Bu kelime daha önce kullanıldı.",
        wordGameNotYet: (wordCount: string) => `Bu kelimeyi **${wordCount}** kelime sonra kullanabilirsin.`,
        wordGameNotYetAgain: (wordIndex: string) => `Bu kelimeyi **${wordIndex}** kelime sonra tekrar kullanabilirsin.`,
        wordGameNewLetter: (letter: string) => `Yeni harfiniz **${letter}**`,
        wordGameStarted: (letter: string) => `Bu kanalda yeni bir **Kelime Oyunu** başladı. İlk harfiniz **${letter}**`,
        wordGameRestarted: (letter: string) => `Oyun yeniden başladı, yeni harfiniz **${letter}**`,
        wordGameFinished: (gameReward: string) => `Tebrikler! Oyunu bitirdin ve **${gameReward}** skor kazandın.`,
        countingGameStarted: (multiplier: number) => `Bu kanalda yeni bir **Sayı Sayma Oyunu** başladı. Sayınız ${multiplier}`,
        countingGameMessageDeleted: (authorTag: string) => `${authorTag} mesajını sildi.`,
        countingGameDeletedNumber: (integer: number) => `Silinen sayı **${integer}**`,
        wordleGameExists: "Zaten devam eden bir Wordle oyunun var. Eğer mesajı yanlışlıkla sildiysen lütfen zaman aşımını bekle.",
        wordleStarted: "Oyun başladı, tahmin yapmaya başlayabilirsin.",
        wordleGuessWord: "Tahmin etmek istediğin kelimeyi aşağıya yaz.",
        wordleGuessTimedOut: "Tahminin zaman aşımına uğradı, lütfen tekrar tahmin etme butonuna bas.",
        wordleInvalidWord: "Lütfen geçerli bir kelime gir.",
        wordleInvalidLength: "Lütfen doğru uzunlukta bir kelime gir.",
        wordleYourGuesses: "Tahminlerin:",
        wordleYourGuess: (word: string) => `Tahminin: ${word}`,
        wordleYouWin: "Doğru tahmin! Oyun bitti, kazandın.",
        wordleYouLose: (word: string) => `Oyun bitti, kaybettin.\nDoğru Kelime: **${word}**`,
        wordleHowToPlayTitle: "Wordle Nasıl Oynanır?",
        wordleHowToPlayDescription:
            "Wordle oyunu, gizli bir kelimenin harflerini doğru sırayla tahmin etmeye dayalı bir oyundur. Her tahmininizde, doğru harfin doğru konumda olup olmadığını ve yanlış harflerin doğru konumda olup olmadığını gösteren ipuçları alırsınız. Oyunun amacı, belirlenen kelimeyi en az tahminle bulmaktır. Her seferinde bir harf veya tam bir kelime tahmin edebilirsin. İyi şanslar!",
        commandTimeout: (command: string) => `Bu komut artık geçerli değil, **/${command}** yazarak tekrar kullanabilirsin.`,
        commandGameSetupSuccess: "Oyun başarıyla kuruldu!",
        commandGameRemoveSuccess: "Oyun başarıyla kaldırıldı.",
        commandWordGameWordCounter: "Yazılan Kelime",
        commandCountingGameNumberCounter: "Yazılan Sayı",
        commandWordGameLetter: "Harf",
        commandCountingGameMultiplier: "Çarpan",
        commandCountingGameMultiplierChange: (multiplier: string) => `Oyun çarpanı başarıyla **${multiplier}** yapıldı.`,
        commandWordGameMode: "Oyun Modu",
        commandWordGameModeNormalDesc: "Normal oyun modu, 40 kelimeden önce oyun bitirilemez.",
        commandWordGameModeEndlessDesc: "Sonsuz oyun modu, oyun bitirilemez.",
        commandWordGameModeEndless: "Sonsuz",
        commandWordGameModeChange: (mode: string) => `Oyun modu başarıyla **${mode}** yapıldı.`,
        commandWordGameLocaleTrDesc: "Türkçe için oyun dili seçeneği.",
        commandWordGameLocaleEnDesc: "İngilizce için oyun dili seçeneği.",
        commandWordGameLocale: "Kanal Dili",
        commandWordGameLangChange: (lang: string) => `Oyun dili başarıyla **${lang}** yapıldı.`,
        commandGameExists: (gameType: string) => `Bu kanalda **${gameType}** mevcut.`,
        commandGameDoesntExists: "Bu kanalda oyun yok.",
        commandGameAnother: (game: string) => `Bu kanalda ${game} mevcut.`,
        commandScoreTitle: (username: string) => `${username} için Skor`,
        commandScoreNoScore: "Bu kullanıcının hiç skoru yok.",
        commandScoreTotalScore: "Toplam Skor",
        commandScoreGuildScore: "Sunucu Skoru",
        commandScoreChannelScores: "Oyun Puanları",
        commandScoresTitle: (guildName: string) => `${guildName} için Skorlar`,
        commandScoresNoGames: "Bu sunucuda kimsenin skoru yok.",
        commandWordTitle: "Kelime Raporu",
        commandWordWrongLanguage: "Yanlış kelime veya dil.",
        commandWordThanks: "Kelime bildirin için çok teşekkür ederiz.",
    },
    en: {
        English: "English",
        Turkish: "Turkish",
        tr: "Turkish",
        en: "English",
        Endless: "Endless",
        Normal: "Normal",
        WordGame: "Word Game",
        Word: "Word",
        Length: "Length",
        Locale: "Language",
        CountingGame: "Counting Game",
        anErrorOccured: "Oops, an error occurred. Please try again later.",
        buttonSetup: "Setup",
        buttonRemove: "Remove",
        buttonConfirm: "Confirm",
        buttonHowToPlay: "How To Play?",
        buttonGuess: "Guess!",
        buttonTicketUserHasTicket: "You already have a ticket.",
        buttonTicketSuccess: (channelId: string) => `Your ticket created: <#${channelId}>`,
        confirmRemove: "Confirm Removal",
        confirmRemoveDesc: "You have 15 seconds to remove the game. Are you sure?",
        confirmRemoveExpire: "Your time has expired to confirm.",
        confirmUsed: "This confirmation message is expired.",
        gameSamePlayer: "Same player cannot play in a row.",
        wordGameInvalidLetter: (letter: string) => `Word should start with the letter **${letter}**.`,
        wordGameInvalidWord: "I don't have this word in my dictionary.",
        wordGameSameWord: "This word is used before.",
        wordGameNotYet: (wordCount: string) => `You can use this word after **${wordCount}** words.`,
        wordGameNotYetAgain: (wordIndex: string) => `You can use this word again after **${wordIndex}** words.`,
        wordGameNewLetter: (letter: string) => `Your new letter is **${letter}**`,
        wordGameStarted: (letter: string) => `There is a new **Word Game** that started in this channel. Your first letter is **${letter}**`,
        wordGameRestarted: (letter: string) => `Game restarted, your new letter is **${letter}**`,
        wordGameFinished: (gameReward: string) => `Congratulations! You found the random word and you won **${gameReward}** scores.`,
        countingGameStarted: (multiplier: number) => `There is a new **Counting Game** that started in this channel. Your number is ${multiplier}`,
        countingGameMessageDeleted: (authorTag: string) => `${authorTag} has deleted their message.`,
        countingGameDeletedNumber: (integer: number) => `Deleted number was **${integer}**`,
        wordleGameExists: "You already have a Wordle game going on. If you accidentally deleted the message, please wait for the timeout.",
        wordleStarted: "The game has started. You can start guessing.",
        wordleGuessWord: "Write the word you want to guess below.",
        wordleGuessTimedOut: "Your guess has timed out. Please click the guess button again.",
        wordleInvalidWord: "Please enter a valid word!",
        wordleInvalidLength: "Please enter a word of the correct length!",
        wordleYourGuesses: "Your guesses:",
        wordleYourGuess: (word: string) => `Your guess: ${word}`,
        wordleYouWin: "Correct guess, game ended, you win.",
        wordleYouLose: (word: string) => `Game ended, you lose.\nSecret Word: **${word}**`,
        wordleHowToPlayTitle: "How to Play Wordle",
        wordleHowToPlayDescription:
            "Wordle is a game based on guessing the letters of a hidden word in the correct order. With each guess, you receive clues indicating whether the correct letter is in the correct position and whether incorrect letters are in the correct position. The goal of the game is to find the specified word with the fewest guesses. You can guess one letter or the entire word each time. Good luck!",
        commandTimeout: (command: string) => `This command has expired. You can use it again by typing **/${command}**.`,
        commandGameSetupSuccess: "Game setup successful!",
        commandGameRemoveSuccess: "Game removal successful.",
        commandWordGameWordCounter: "Word Counter",
        commandCountingGameNumberCounter: "Number Counter",
        commandWordGameLetter: "Letter",
        commandCountingGameMultiplier: "Multiplier",
        commandCountingGameMultiplierChange: (multiplier: string) => `Game multiplier changed to: **${multiplier}**`,
        commandWordGameMode: "Game Mode",
        commandWordGameModeNormalDesc: "Normal game mode, the game cannot be finished until 40 words.",
        commandWordGameModeEndlessDesc: "Endless game mode, the game cannot be finished.",
        commandWordGameModeEndless: "Endless",
        commandWordGameModeChange: (mode: string) => `Game mode changed to: **${mode}**`,
        commandWordGameLocaleTrDesc: "Game language option for Turkish.",
        commandWordGameLocaleEnDesc: "Game language option for English.",
        commandWordGameLocale: "Channel Language",
        commandWordGameLangChange: (lang: string) => `Game language changed to: **${lang}**`,
        commandGameExists: (gameType: string) => `There is a **${gameType}** in this channel.`,
        commandGameDoesntExists: "There is no game in this channel.",
        commandGameAnother: (game: string) => `There is ${game} in this channel.`,
        commandScoreTitle: (username: string) => `Score for ${username}`,
        commandScoreNoScore: "This user has no score.",
        commandScoreTotalScore: "Total Score",
        commandScoreGuildScore: "Guild Score",
        commandScoreChannelScores: "Game Scores",
        commandScoresTitle: (guildName: string) => `Scores for ${guildName}`,
        commandScoresNoGames: "There is no player with score in this guild.",
        commandWordTitle: "Word Report",
        commandWordWrongLanguage: "Invalid word or language.",
        commandWordThanks: "Thanks for your report.",
    },
};
