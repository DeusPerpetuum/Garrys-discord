import fetch from 'node-fetch';
import config from './config.js';

const url = `https://discord.com/api/v10/applications/${config.DISCORD_CLIENT_ID}/role-connections/metadata`;

// put your metadata here
// https://discord.com/developers/docs/resources/application-role-connection-metadata
const metadata = [
  {
    key: 'vip',
    name: 'VIP',
    description: 'User have VIP?',
    type: 7,
  }
];

const response = await fetch(url, {
  method: 'PUT',
  body: JSON.stringify(metadata),
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bot ${config.DISCORD_TOKEN}`,
  },
});
if (response.ok) {
  const data = await response.json();
  console.log(data);
} else {
  const data = await response.text();
  console.log(data);
}