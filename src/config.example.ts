const srcPath = import.meta.dir;
const jsonsPath = srcPath + "<JSON_FILES_PATH>"

export default {
    guildId: "<GUILD_ID>",
    logChannelId: "<LOG_CHANNEL_ID>",
    clientId: "<CLIENT_ID>",
    clientStatus: "<CLIENT_STATUS>",
    statsMessageId: "<STATS_MESSAGE_ID>",
    statsMessageChannelId: "<STATS_MESSAGE_CHANNEL_ID>",
    statsChannelId: "<STATS_CHANNEL_ID>",
    wordReportChannelId: "<WORD_REPORT_CHANNEL_ID>",
    wordLogChannelId: "<WORD_LOG_CHANNEL_ID>",
    commandsPath: srcPath + "/<COMMANDS_FOLDER_NAME>",
    buttonsPath: srcPath + "/<BUTTONS_FOLDER_NAME",
    statsPath: jsonsPath + "/<STATS_JSON_PATH>",
    englishWordsPath: jsonsPath + "/<ENGLISH_WORDS_JSON_FILENAME>",
    turkishWordsPath: jsonsPath + "/<TURKISH_WORDS_JSON_FILENAME>",
    wordleWordsPath: jsonsPath + "/<WORDLE_WORDS_JSON_FILENAME>",
    acceptEmote: "<ACCEPT_EMOTE_TAG_STRING>",
    denyEmote: "<DENY_EMOTE_TAG_STRING>"
};