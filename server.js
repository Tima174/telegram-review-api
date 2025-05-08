const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const BOT_TOKEN = '7755461558:AAFX_-QPezXvtd6iN8OICP3Yfo6b-E9MUSY';
const TARGET_THREAD = 4;

app.get('/api/reviews', async (req, res) => {
  try {
    const updates = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const messages = updates.data.result
      .map(u => u.message)
      .filter(msg => msg && msg.text && msg.message_thread_id === TARGET_THREAD)
      .map(msg => ({
        from: msg.from.username || msg.from.first_name,
        text: msg.text
      }));

    res.json(messages);
  } catch (err) {
    console.error('Ошибка:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки отзывов' });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});