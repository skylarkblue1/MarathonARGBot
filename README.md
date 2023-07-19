# MarathonARGBot
Discord bot for watching the Marathon ARG sites.

## Features:
- Watches the Serpent chatlog at https://traxus.global/
- Watches Yoshito Tamura's email inbox at https://sekiguchigenetics.jp/
- Posts any new chat messages or emails from those 2 specific places into their own respective threads

If you would like to run this bot yourself, make a config.json file and put in the IDs for 2 different threads, one for the chat and one for emails (or use the same ID if you want them to be sent to the same place)
> chatsThreadID, emailsThreadID

### Please note:
As phase 1 is seemingly over for the ARG, Tamura's inbox has been deactivated and the Serpent chat has gone offline. It's possible that these won't come back online but as soon as we get more information for any further sources this bot will be updated to watch those as well.

Currently it also doesn't pull any attachments from either the emails or the chats. There will be an addition to the message sent if an attachment is found however (see screenshots below for more information). It cannot tell if an attachment is password protected or not.

## Screenshots:
![Screenshot of the chat messages in discord the bot sends. This shows the messages for any new chat messages from the Traxus website as a rich embed showing the message, who sent it, the sent date and what date and time the message is valid until.](https://github.com/skylarkblue1/MarathonARGBot/assets/15182062/f6acceed-4c36-41d0-94a5-ed107fac4b75)


![Screenshot of the chat messages in discord the bot sends. This shows the messages for any new emails from the Sekiguchi website as a rich embed showing the email subject and body, who sent it, who it's sent to, what fictional date it was sent from and what actual date it was sent from. 2 emails are shown, one with an extra field detailing an attachment is on the email and what the attachment is called.](https://github.com/skylarkblue1/MarathonARGBot/assets/15182062/9519304f-e373-4c0f-9fcf-6fa39114219a)
