const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const TARGET_THREAD = 4; // номер треда с отзывами
const reviews = [];

app.post('/webhook', (req, res) => {
  const msg = req.body.message;
  if (msg && msg.text && msg.message_thread_id === TARGET_THREAD) {
  reviews.unshift({
    from: msg.from.username || msg.from.first_name,
    text: msg.text
  });
}

    
  res.sendStatus(200);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
