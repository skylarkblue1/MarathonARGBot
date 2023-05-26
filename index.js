// Require the necessary discord.js classes
const { Client, EmbedBuilder, Events, GatewayIntentBits, time } = require('discord.js');
const { token, guildID, channelID, chatsThreadID, emailsThreadID, testChannelID } = require('./config.json');
const fs = require('fs');
const { createHash } = require('node:crypto');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

const FAST_INTERVAL = 15
const SLOW_INTERVAL = 60
const FASTS_BEFORE_SLOW = 2

client.on('ready', async () => {
    const md5 = (str) => createHash('md5').update(str).digest('hex')

    const fetchEmails = async () => {
        console.log((new Date()).toISOString(), "Fetching Emails");
        const res = await fetch("https://sekiguchigenetics.jp/api/mail-history", {
            "credentials": "omit",
            "referrer": "https://sekiguchigenetics.jp/mailbox-MGj67PK",
            "body": "{\"token\":\"charon\"}",
            "method": "POST",
            "mode": "cors"
        });
        return res.json()
    }

    const fetchChat = async () => {
        console.log((new Date()).toISOString(), "Fetching Chat");
        const res = await fetch("https://traxus.global/api/chat-history", {
            "credentials": "omit",
            "referrer": "https://traxus.global/",
            "body": "{\"token\":\"serpent\"}",
            "method": "POST",
            "mode": "cors"
        });
        return res.json()
    }

    const readFromJSON = async (fileName) => {
        const buffer = fs.readFileSync(fileName)
        return JSON.parse(buffer.toString('utf8'))
    }

    const writeFromJSON = async (fileName, obj) => {
        fs.writeFileSync(fileName, Buffer.from(JSON.stringify(obj, null, 2), 'utf8'))
    }

    const sendMessage = (thread, message) => {
        // CHANGE TO THE #marathon CHANNEL FOR PRODUCTION (channelID)
        // const channelID = testChannelID

        const threadID = thread === 'chat' ? chatsThreadID : emailsThreadID
        client.channels.cache.get(channelID).threads.cache.get(threadID).send(message)
    }

    const sendEmail = async (email) => {
        // todo: translate
        const fields = [
            { name: "From", value: email.from, inline: true },
            { name: "To", value: email.to, inline: true },
            { name: "Date (fictional)", value: email.maildate, inline: true },
            { name: "Date (IRL)", value: time(new Date(email.date + 'Z')), inline: true },
            { name: "Subject", value: email.subject },
            { name: "Content", value: email.content }
        ]
        if (email.attachement) fields.push(
            { name: "Attachment", value: email.attachement ?? 'None' }
        )
        sendMessage('email', {
            embeds: [{
                color: 5763719,
                timestamp: email.date,
                author: { name: "Sekiguchi Genetics Email" },
                fields
            }]
        })
    }

    const buildChat = (chat) => {
        const fields = [
            { name: "From", value: chat.from, inline: true },
            { name: "Sent", value: time(new Date(chat.timestamp + 'Z')), inline: true },
            { name: "Valid Until", value: time(new Date(chat.valid_until + 'Z')), inline: true },
            { name: "Content", value: chat.message },
        ]
        if (chat.attachment) fields.push(
            { name: "Attachment", value: chat.attachment.metadata.fileName }
        )

        return {
            color: 5763719,
            timestamp: chat.timestamp,
            author: { name: "Traxus Chat Message" },
            fields
        }
    }

    let fetchesWithoutUpdates = 0
    const checkForUpdates = async () => {
        const emails = await fetchEmails()
        const lastEmails = await readFromJSON('emails.json')
        const emailIDs = emails.map(email => email.id)
        const lastEmailIDs = lastEmails.map(email => email.id)
        const newEmailIDs = emailIDs.filter(id => !lastEmailIDs.includes(id))
        const newEmails = emails.filter(email => newEmailIDs.includes(email.id))
        newEmails.forEach((email) => {
            console.log((new Date()).toISOString(), 'New email with id', email.id, 'and subject', email.subject)
            sendEmail(email)
        })

        const chats = await fetchChat()
        const lastChats = await readFromJSON('chat.json')
        const chatHashes = chats.map(chat => ({ ...chat, hash: md5(JSON.stringify(chat)) }))
        const lastChatHashes = lastChats.map(chat => md5(JSON.stringify(chat)))
        const newChats = chatHashes.filter(({ hash }) => !lastChatHashes.includes(hash))

        if (newChats.length > 0) {
            const embeds = newChats.map(buildChat)
            const messageEmbeds = [[]]
            embeds.forEach((embed) => {
                const latest = messageEmbeds[messageEmbeds.length - 1]
                if (latest.length === 10) {
                    messageEmbeds.push([embed])
                } else {
                    latest.push(embed)
                }
            })
            messageEmbeds.forEach((embeds) => {
                sendMessage('chat', { embeds })
            })
            newChats.forEach((chat) => {
                console.log((new Date()).toISOString(), 'New chat with timestamp', chat.timestamp, 'and hash', chat.hash)
            })
        }

        if (newChats.length > 0) {
            fetchesWithoutUpdates = 0
            if (loopSpeed === SLOW_INTERVAL) {
                console.log((new Date()).toISOString(), 'Speeding up')
                setLoopSpeed(FAST_INTERVAL)
            }
        }

        if (newChats.length === 0) {
            fetchesWithoutUpdates++
            if (loopSpeed === FAST_INTERVAL && fetchesWithoutUpdates > FASTS_BEFORE_SLOW) {
                console.log((new Date()).toISOString(), 'Slowing down')
                setLoopSpeed(SLOW_INTERVAL)
            }
        }

        writeFromJSON('emails.json', emails)
        writeFromJSON('chat.json', chats)
    }

    const loop = () => {
        checkForUpdates().catch((e) => {
            console.error((new Date()).toISOString(), e)
        })
    }

    let interval = null
    let loopSpeed = SLOW_INTERVAL
    const setLoopSpeed = (delay) => {
        if (interval) clearInterval(interval)
        loopSpeed = delay
        setInterval(loop, delay * 1000)
    }

    checkForUpdates() // first run
    setLoopSpeed(SLOW_INTERVAL) // subsequent runs
})