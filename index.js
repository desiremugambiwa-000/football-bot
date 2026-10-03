const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get('https://api.football-data.org/v4/matches', {
      headers: { 'X-Auth-Token': 'demo' }
    });
    res.json({ status: 'Football Bot Online ⚽', matches: data.matches?.slice(0,10) || [] });
  } catch(e){
    res.json({ status: 'Football Bot Online ⚽ - Live scores ready', message: 'Add your API key to get real data' });
  }
});

app.get('/live', async (req,res)=>{
  res.json({ live: 'Use / - Bot is working. Add Football API later' });
});

app.listen(PORT, ()=> console.log('Football Bot running on', PORT));
