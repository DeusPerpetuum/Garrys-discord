# Init
1) Download server, open directory and type in console `npm i`.
2) Make `.env` file in root directory.

Your `.env` should be like that:
```
DISCORD_TOKEN="DISCORD BOT TOKEN"
DISCORD_CLIENT_ID="DISCORD CLIENT ID"
DISCORD_CLIENT_SECRET="DISCORD CLIENT SECRET"
DISCORD_REDIRECT_URI="YOUR DISCORD REDIRECT URL (DON'T FORGOT LINK IT IN APPLICATION SETTINGS). INCLUDE WAY `/discord-oauth-callback`"
COOKIE_SECRET="YOUR COOKIE SECRET"
SERVER_SECRET="YOUR SERVER SECRET"
```

3) Move `LinkedRoleAddon` to server addons folder and rewrite client side file how you needs.
4) Change server secret and domen variables in server side file. They should be same like in `.env` file.
5) Change metadata in `register.js` file.
6) Run `npm register` for register your application settings.
7) Type `npm start` for start server. Hosting is required!
