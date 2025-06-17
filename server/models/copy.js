const mongoose = require('mongoose');
const { Types } = mongoose;

mongoose.connect('mongodb+srv://asd155619:y99Ikl4KuNS62Ms1@cluster0.gzp8twh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Ошибка подключения к MongoDB:'));
db.once('open', async () => {
  //// console.log('Успешное подключение к MongoDB');

  const Client = require('./clients'); // Замените на ваш путь до модели

  const originalDocumentId = 'bbef6d04-c00f-464b-a195-6db5f06e3435'; // Замените на реальный _id вашей записи
  const numberOfCopies = 1000;

  try {
    const originalDocument = await Client.findById(originalDocumentId);

    if (!originalDocument) {
      console.error('Документ с указанным _id не найден.');
      return;
    }

    const pageSize = 100; // Кількість документов на одной странице
    const pageCount = Math.ceil(numberOfCopies / pageSize);

    for (let page = 1; page <= pageCount; page++) {
      const originalDocuments = await Client.find()
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      for (const originalDocument of originalDocuments) {
        // Генерация новых ObjectId и уникальных email
        const newObjectId = new Types.ObjectId();
        const newEmail = `${newObjectId.toString()}`;

        // Создание нового документа с новыми ObjectId и email
        const newDocument = new Client({
          ...originalDocument.toObject(),
          _id: newObjectId,
          phone: newEmail,
        });

        await newDocument.save();
      }
    }

   console.log(`${numberOfCopies} копий успешно созданы.`);
  } catch (error) {
    console.error('Ошибка при создании копий:', error);
  } finally {
    // Закрытие соединения с базой данных после выполнения операции
    mongoose.connection.close();
  }
});
