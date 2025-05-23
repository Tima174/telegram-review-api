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

// Загрузка отзывов из файла при запуске
if (fs.existsSync(reviewsFile)) {
  try {
    reviews = JSON.parse(fs.readFileSync(reviewsFile, 'utf-8'));
  } catch (err) {
    console.error('Ошибка чтения файла отзывов:', err.message);
    reviews = [];
  }
}

// Сохраняем в файл при каждом новом сообщении
function saveReviewsToFile() {
  fs.writeFile(reviewsFile, JSON.stringify(reviews, null, 2), (err) => {
    if (err) console.error('Ошибка записи файла отзывов:', err.message);
  });
}

app.post('/webhook', (req, res) => {
  const msg = req.body.message;
  console.log("DEBUG >>>", JSON.stringify(msg, null, 2));

if (
  msg &&
  msg.text &&
  msg.message_thread_id === TARGET_THREAD &&
  !msg.sender_chat // <- эта строка исключает все ответы от имени канала/бота
) {
  reviews.unshift({
    from: msg.from.username || msg.from.first_name,
    text: msg.text,
    timestamp: new Date().toISOString()
  });
    saveReviewsToFile();
  }

  res.sendStatus(200);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.delete('/api/reviews', (req, res) => {
  reviews = [];
  saveReviewsToFile();
  res.json({ message: 'Отзывы очищены' });
});
app.get('/api/raw', (req, res) => {
  try {
    const data = fs.readFileSync(reviewsFile, 'utf-8');
    res.type('text').send(data);
  } catch (err) {
    res.status(500).send('Ошибка чтения файла');
  }
});
app.get('/download/reviews', (req, res) => {
  try {
    const filePath = reviewsFile;
    res.download(filePath, 'reviews.json');
  } catch (err) {
    res.status(500).send('Ошибка при скачивании файла');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
