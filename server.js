const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const reviewsFile = path.join(__dirname, 'reviews.json');
const TARGET_THREAD = 4;
let reviews = [];

// 1. Загрузка отзывов из файла при запуске
if (fs.existsSync(reviewsFile)) {
  try {
    reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf-8'));
  } catch (err) {
    console.error('Ошибка чтения файла отзывов:', err.message);
    reviews = [];
  }
}

// 2. Сохраняем в файл при каждом новом сообщении
function saveReviewsToFile() {
  fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), (err) => {
    if (err) console.error('Ошибка записи файла отзывов:', err.message);
  });
}

app.post('/webhook', (req, res) => {
  const msg = req.body.message;

 if (msg && msg.text) {
  reviews.unshift({
    from: msg.from.username || msg.from.first_name,
    text: msg.text
  });

  saveReviewsToFile();
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
