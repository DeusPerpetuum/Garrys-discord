import express from "express";
import cookieParser from "cookie-parser";

import config from "./config.js";
import * as discord from "./discord.js";
import * as storage from "./storage.js";

let keys = []; // users keys collect
let metadata = []; //users metadata collect

/**
 * @param {number} steamID
 * @param {string} tokenKey
 */
function SaveKey(steamID, tokenKey) {
	let timeout;

	if (!keys[steamID]) console.log(`${steamID}: Steam token collected!`);
	if (keys[steamID]) {
		clearTimeout(keys[steamID].expiredTimeout);
		console.log(`${steamID}: Steam token refreshed!`);
	}

	timeout = setTimeout(() => {
		delete keys[steamID];
		console.log(`${steamID}: Steam token expired!`);
	}, 1000 * 60 * 5); //key expired

	keys[steamID] = {
		tokenKey: tokenKey,
		expiredTimeout: timeout,
	};
}

const app = express();
app.use(cookieParser(config.COOKIE_SECRET));

app.get("/linked-role", async (req, res) => {
	const steamID = req.query["steamID"];
	const tokenKey = req.query["key"];

	console.log(`${steamID}: connection!`);

	if (!steamID) return res.sendStatus(400);
	if (!tokenKey) return res.sendStatus(400);

	if (!keys[steamID]) return res.sendStatus(400);

	const { url, state } = discord.getOAuthUrl();

	res.cookie("clientState", state, { maxAge: 1000 * 60 * 5, signed: true });
	res.cookie("steamID", steamID, { maxAge: 1000 * 60 * 5, signed: true });
	res.cookie("tokenKey", tokenKey, { maxAge: 1000 * 60 * 5, signed: true });

	res.redirect(url); //redirect to discord login
});

app.get("/discord-oauth-callback", async (req, res) => {
	try {
		const code = req.query["code"];
		const discordState = req.query["state"];

		const { clientState, steamID, tokenKey } = req.signedCookies;
		if (clientState !== discordState) {
			console.error(steamID + ": State verification failed.");
			return res.sendStatus(403);
		}

		if (tokenKey != keys[steamID].tokenKey) return res.sendStatus(400);
		if (!tokenKey) return res.sendStatus(400);

		const tokens = await discord.getOAuthTokens(code);

		const meData = await discord.getUserData(tokens);
		const userId = meData.user.id;
		await storage.storeDiscordTokens(userId, {
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expires_at: Date.now() + tokens.expires_in * 1000,
		});

		await updateMetadata(userId, metadata[steamID]);

		//change to res.sendFile for send html file and make this page beautiful
		res.send("You did it!  Now go back to Discord.");
	} catch (e) {
		console.error(e);
		res.sendStatus(500);
	}
});

app.post("/update-metadata", async (req, res) => {
	try {
		const userId = req.body.userId;
		await updateMetadata(userId);

		res.sendStatus(204);
	} catch (e) {
		res.sendStatus(500);
	}
});

app.post("/secret", function (req, res) {
	if (!req.get("key")) return res.sendStatus(400);
	if (!req.get("secret")) return res.sendStatus(400);
	if (!req.get("steamID")) return res.sendStatus(400);
	if (req.get("secret") != config.SERVER_SECRET) return res.sendStatus(400);
	const key = req.get("key");
	const steamID = req.get("steamID");

	metadata[steamID] = JSON.parse(req.get("metadata"));
	if (req.get("metadata") == null || req.get("metadata") == undefined) metadata[steamID] = {};

	SaveKey(steamID, key);
	res.sendStatus(200);
});

/**
 * @param {number} userId
 * @param {object} metadata
 */
async function updateMetadata(userId, metadata) {
	try {
		const tokens = await storage.getDiscordTokens(userId);
		await discord.pushMetadata(userId, tokens, metadata);
	} catch (e) {
		e.message = `Error fetching external data: ${e.message}`;
		console.error(e);
	}
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
