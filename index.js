const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const TOKEN = process.env.FOOTBALL_TOKEN || 'YOUR_KEY_HERE';
const LEAGUES = { PL: 'Premier League', PD: 'La Liga', SA: 'Serie A', BL1: 'Bundesliga', FL1: 'Ligue 1', CL: 'Champions League', DED: 'Eredivisie' };

async function getScores(leagueCode) {
  const url = leagueCode? `https://api.football-data.org/v4/competitions/${leagueCode}/matches` : `https://api.football-data.org/v4/matches?status=LIVE,IN_PLAY`;
  try {
    const { data } = await axios.get(url, { headers: { 'X-Auth-Token': TOKEN } });
    if (!data.matches.length) return 'No live games right now ⚽';
    return data.matches.slice(0,10).map(m => `*${m.competition.name}*\n${m.homeTeam.name} ${m.score.fullTime.home?? m.score.halfTime.home?? 0} - ${m.score.fullTime.away?? m.score.halfTime.away?? 0} ${m.awayTeam.name}\n_${m.status}_\n`).join('\n');
  } catch(e){ return 'API error - add FOOTBALL_TOKEN in Railway Variables ⚽'; }
}

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ['Football Bot','Chrome','1.0'] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.qr) console.log('SCAN THIS QR IN WHATSAPP > LINKED DEVICES');
    if(u.connection==='open') console.log('WhatsApp Connected ✅');
  });
  sock.ev.on('messages.upsert', async ({ messages })=>{
    const msg = messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toUpperCase();
    if(!text) return;
    let reply = '';
    if(['LIVE','ALL','SCORES'].includes(text)) reply = await getScores();
    else if(LEAGUES[text]) reply = await getScores(text);
    else if(text==='MENU' || text==='HELP') reply = `⚽ *Football Bot*\n\nType:\nLIVE - All live games\nPL - Premier League\nPD - La Liga\nSA - Serie A\nBL1 - Bundesliga\nCL - Champions League\n\nRedeeming the time ⏰`;
    if(reply) await sock.sendMessage(msg.key.remoteJid, { text: reply });
  });
}
startBot();

app.get('/', (req,res)=> res.send('Football WhatsApp Bot Online ⚽ - Check Railway Logs for QR code'));
app.listen(PORT, ()=> console.log('Server on', PORT));
