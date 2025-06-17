const express = require('express');
const multer = require('multer');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors')
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const Manager = require('./models/manager');
const Client = require('./models/clients');
const Buyer = require('./models/buyers');
const Product = require('./models/products');
const Notice = require('./models/Notice')
const CloseClient = require('./models/closeClients')
const Task = require('./models/tasks')
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// wss.on('connection', ws => {
//   ws.on('message', m => {
//     // Обработка входящих сообщений от Клієнтов
//     console.log('Получено сообщение от Клієнта:', m);

//     // Пример: Рассылка полученного сообщения всем Клієнтам
//     wss.clients.forEach(client => {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(m);
//       }
//     });
//   });

//   ws.on('close', () => {
//     // Обработка отключения Клієнта
//     console.log('Клієнт отключился');
//   });



//   // Вы не можете отправлять сообщения Клієнтам здесь сразу после подключения
//   // Переместите эту логику в соответствующие части вашего приложения, где происходит регистрация Клієнта
// });
//mongoose.connect('mongodb+srv://seksikoleg5:se4HivNRYKdydnzc@cluster0.pdc2rrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });


mongoose.connect('mongodb+srv://asd155619:y99Ikl4KuNS62Ms1@cluster0.gzp8twh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', () => {
  //// console.log('Connected to MongoDB');
});
// app.use(express.static(path.join(__dirname, 'public')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors())
// app.use(cors({
//   origin: '', // Указываем разрешённый источник
//   methods: 'GET,POST', // Указываем разрешённые методы
//   credentials: true // Если нужен доступ к cookies
// }));

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true // Если вы работаете с куками или авторизацией
}));

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await Manager.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }

    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return done(null, false, { message: 'Incorrect password.' });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.post('/api/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// app.get('/', (req, res) => {
//   res.send('Home Page');
// });

app.get('/register', (req, res) => {
  res.send('Registration Page');
});

// app.post('/api/register/admin', async (req, res) => {
//   const { email, password, role } = req.body;

//   try {
//     const user = new User({ email, password, role });
//     // const manager = new Manager({ email, password });
//     await user.save();
//     // await manager.save();
//     // await adminUser.save();
//     res.status(201).json({ message: 'User registered successfully.' });
//   } catch (err) {
//     console.error('Error during user registration:', err);
//     res.status(500).json({ error: 'Error in registration.' });
//   }
// });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:\\Users\\mp848\\OneDrive\\Рабочий стол\\work\\crm\\crm-without-node-moduls\\uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });
// , upload.single('photo')

app.post('/api/register/manager', async (req, res) => {
  const { nameManager, email, password, role, managerKey } = req.body;

  try {
    const manager = new Manager({ nameManager, email, password, role, managerKey });

    if (role === 'manager') {
      manager.managerKey = managerKey;
    }

    await manager.save();
    res.status(201).json({ message: 'Manager registered successfully.' });
  } catch (err) {
    console.error('Error during manager registration:', err);
    res.status(500).json({ error: 'Error in registration.' });
  }
});


app.post('/api/register/client', async (req, res) => {
  const { _id, email, phone, role, managerID, managerKey, status, product, payment, selectedDate, dateOfCreated, clientName, secondPhone, notice } = req.body;

  try {
    const client = new Client({ _id, email, phone, role, managerID, managerKey, status, product, payment, selectedDate, dateOfCreated, clientName, secondPhone, notice });
    client.managerID = managerID;
    client.managerKey = managerKey;
    await client.save();

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'client_added', data: client }));
      }
    });

    res.status(201).json({ message: 'Manager registered successfully.' });
  } catch (err) {
    console.error('Error during manager registration:', err);
    res.status(500).json({ error: 'Error in registration.' });
  }
});

app.post('/api/register/buyer', async (req, res) => {
  const { email, phone, notice, name, role, managerID, managerKey, adminKey } = req.body;

  try {
    const buyer = new Buyer({ email, phone, notice, name, role, managerID, managerKey, adminKey });
    buyer.managerID = managerID;
    buyer.managerKey = managerKey;
    await buyer.save();
    res.status(201).json({ message: 'Manager registered successfully.' });
  } catch (err) {
    console.error('Error during manager registration:', err);
    res.status(500).json({ error: 'Error in registration.' });
  }
});

app.post('/api/register/product', async (req, res) => {
  const { name, cost, count } = req.body;

  try {
    const product = new Product({ name, cost, count });
    await product.save();

    res.status(201).json({ message: 'Manager registered successfully.' });
  } catch (err) {
    console.error('Error during manager registration:', err);
    res.status(500).json({ error: 'Error in registration.' });
  }
});

app.post('/api/register/notice', async (req, res) => {
  const { noticeID, content, noticeDate } = req.body;
  //// console.log(content)
  try {
    const product = new Notice({ noticeID, content, noticeDate });
    await product.save();

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'client_added', data: product }));
      }
    });
    res.status(201).json({ message: 'Manager registered successfully.' });
  } catch (err) {
    console.error('Error during manager registration:', err);
    res.status(500).json({ error: 'Error in registration.' });
  }
});

app.post('/api/register/task', async (req, res) => {
  const { taskLine, startDate, endDate, createdDate, taskStatus, managerID, managerKey } = req.body;

  try {
    const task = new Task({ taskLine, startDate, endDate, createdDate, taskStatus, managerID, managerKey });
    await task.save();
    res.status(201).json({ message: 'Manager registered successfully.' });
  } catch (err) {
    console.error('Error during manager registration:', err);
    res.status(500).json({ error: 'Error in registration.' });
  }
});

app.get('/login', (req, res) => {
  res.send('Login Page');
});

app.post('/api/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// Додати обработчик к существующему коду вашего сервера
app.post('/api/getAdminKey', isAuthenticated, async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Manager.findOne({ email });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Проверяем, совпадает ли пароль
    if (password !== user.password) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    // Если роль пользователя - администратор, возвращаем adminKey
    if (user.role === 'admin') {
      res.json({ adminKey: user.adminKey });
    } else {
      res.status(403).json({ error: 'User is not an admin' });
    }
  } catch (error) {
    console.error('Error while fetching adminKey:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api', (req, res) => {
  const { email } = req.query;
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') {
      res.redirect('/admin/dashboard/email');
    } else {
      res.redirect('/dashboard');
    }
  } else {
    res.send('Home Page');
  }
});
////////////////////////////////////////////////////////////////
app.get('/api/userRole', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await Manager.findOne({ email });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ role: user.role, key: user.adminKey, manID: user.managerID, manKey: user.managerKey, email: user.email, nameUser: user.nameManager });
    // res.json({adminKey: user.adminKey})
  } catch (error) {
    console.error('Error while fetching user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

////////////////////////////////////////////////////////////////
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Welcome, ${req.user.email}!`);
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function isAdminAuthenticated(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}
// Маршрут для получения списка пользователей с определенным adminKey
// Серверный код
app.get('/api/usersByAdminKey', async (req, res) => {
  try {
    const managerKey = req.query.adminKey; // Получаем из параметра запроса
    const users = await Manager.find({ managerKey }).exec();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/api/getClients', async (req, res) => {
  try {
    const clientEmail = req.query._id;
    const limit = req.query.limit || 10;
    const status = req.query.status || ''; // Добавляем параметр status

    let query = { clientEmail };

    // Если есть параметр status, добавляем его в запрос
    if (status) {
      query = { ...query, status };
    }

    // Добавляем сортировку, чтобы получить последнюю запись первой
    const users = await Client.find(query).exec();
    // .sort({ dateOfCreated: -1 }) // Предполагается, что в вашей модели есть поле dateOfCreated
    // .limit(parseInt(limit))
    // .exec();

    res.json(users);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.get('/api/getAllClients', async (req, res) => {
  try {
    const clientEmail = req.query._id;
    const limit = req.query.limit || 10000;
    const status = req.query.status || ''; // Добавляем параметр status

    let query = { clientEmail };

    // Если есть параметр status, добавляем его в запрос
    if (status) {
      query = { ...query, status };
    }

    // Добавляем сортировку, чтобы получить последнюю запись первой
    const users = await Client.find(query)
      .sort({ dateOfCreated: -1 }) // Предполагается, что в вашей модели есть поле dateOfCreated
      .limit(parseInt(limit))
      .exec();

    res.json(users);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});


app.delete('/api/client/:clientId/product/:productIndex', async (req, res) => {
  const clientId = req.params.clientId;
  const productIndex = req.params.productIndex;

  try {
    // Находим Клієнта по его идентификатору
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).send('Клієнт не найден');
    }

    // Проверяем, что индекс находится в допустимом диапазоне
    if (productIndex < 0 || productIndex >= client.product.length) {
      // return res.status(400).send('Недопустимый индекс продукта');
    }

    // Удаляем продукт из массива product по индексу
    client.product.splice(productIndex, 1);

    // Сохраняем обновленные данные Клієнта в базе данных
    await client.save();

    res.status(200).json({ message: 'Продукт успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении продукта из массива product Клієнта:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.delete('/api/client/:clientId/payment/:productIndex', async (req, res) => {
  const clientId = req.params.clientId;
  const productIndex = req.params.productIndex;

  try {
    // Находим Клієнта по его идентификатору
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).send('Клієнт не найден');
    }

    // Проверяем, что индекс находится в допустимом диапазоне
    if (productIndex < 0 || productIndex >= client.payment.length) {
      // return res.status(400).send('Недопустимый индекс продукта');
    }

    // Удаляем продукт из массива product по индексу
    client.payment.splice(productIndex, 1);

    // Сохраняем обновленные данные Клієнта в базе данных
    await client.save();

    res.status(200).json({ message: 'Продукт успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении продукта из массива product Клієнта:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

app.post('/api/updateClientDataPayment', async (req, res) => {
  const requestData = req.body;

  try {
    // Добавляем новые данные Оплати Клієнта в массив payment
    await Client.findOneAndUpdate(
      { _id: requestData._id },
      { $push: { payment: requestData.payment } }
    );
    res.status(200).send('Данные Оплати успешно добавлены');
  } catch (error) {
    console.error(error);
    res.status(500).send('Ошибка при добавлении данных Оплати');
  }
});




app.get('/api/getCloseClients', async (req, res) => {
  try {
    const clientEmail = req.query._id;
    const users = await CloseClient.find({ clientEmail }).exec();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
})
app.get('/api/getManagers', async (req, res) => {
  try {
    const clientEmail = req.query.email; // Получаем из параметра запроса
    const users = await Manager.find({ clientEmail }).exec();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
})
app.get('/api/getBuyers', async (req, res) => {
  try {
    const clientEmail = req.query.email; // Получаем из параметра запроса
    const users = await Buyer.find({ clientEmail }).exec();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/api/getProducts', async (req, res) => {


  try {
    const productId = req.query.name;
    const product = await Product.find({ productId }).exec();;

    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getNotices', async (req, res) => {


  try {
    const productId = req.query.noticeID;
    const product = await Notice.find({ productId }).exec();;

    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getTasks', async (req, res) => {


  try {
    const taskId = req.query._id;
    const task = await Task.find({ taskId }).exec();;

    res.json(task);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
// Получение данных менеджера по идентификатору
app.get('/api/getManagerData', async (req, res) => {


  try {
    const managerId = req.query._id;
    const manager = await Manager.findById(managerId).exec();

    // if (!manager) {
    //   res.status(404).json({ error: 'Менеджер не найден' });
    //   return;
    // }

    res.json(manager);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getCloseClientsData', async (req, res) => {


  try {
    const managerId = req.query._id;
    const manager = await CloseClient.findById(managerId).exec();
    console.log(managerId)
    console.log(manager)
    // if (!manager) {
    //   res.status(404).json({ error: 'Менеджер не найден' });
    //   return;
    // }

    res.json(manager);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
// Обновление данных менеджера
app.put('/api/updateManagerData', async (req, res) => {
  const managerId = req.body._id;
  const email = req.body.email;
  const nameManager = req.body.nameManager;

  const password = req.body.password;
  const updatedData = req.body;


  try {
    const manager = await Manager.findByIdAndUpdate(managerId, { nameManager: nameManager, email: email, password: password }, { new: true });

    if (!manager) {
      res.status(404).json({ error: 'Менеджер не найден' });
      return;
    }

    res.json({ message: 'Данные менеджера успешно обновлены', updatedManager: manager });
  } catch (error) {
    console.error('Ошибка при обновлении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getClientData', async (req, res) => {


  try {
    const clientId = req.query._id;
    const client = await Client.findById(clientId).exec();

    // if (!manager) {
    //   res.status(404).json({ error: 'Менеджер не найден' });
    //   return;
    // }
    if (!client) {
      console.log('Клієнт не найден');
      res.status(404).json({ error: 'Клієнт не найден' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
app.get('/api/getBuyerData', async (req, res) => {


  try {
    const clientId = req.query._id;
    const client = await Buyer.findById(clientId).exec();
    res.json(client);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getProductData', async (req, res) => {

  try {
    const productId = req.query._id;
    const product = await Product.findById(productId).exec();
    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getNoticeData', async (req, res) => {

  try {
    const productId = req.query._id;
    const product = await Notice.findById(productId).exec();
    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/getTaskData', async (req, res) => {

  try {
    const productId = req.query._id;
    const product = await Task.findById(productId).exec();
    res.json(product);
  } catch (error) {
    console.error('Ошибка при получении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/updateClientData', async (req, res) => {
  const managerId = req.body._id;
  const email = req.body.email;
  const phone = req.body.phone;
  const managerID = req.body.managerID
  const status = req.body.status
  const product = req.body.product
  const clientName = req.body.clientName
  const payment = req.body.payment
  const notice = req.body.notice
  const selectedDate = req.body.selectedDate
  const secondPhone = req.body.secondPhone

  try {
    const client = await Client.findByIdAndUpdate(managerId, { notice: notice, secondPhone: secondPhone, selectedDate: selectedDate, payment: payment, email: email, phone: phone, managerID: managerID, status: status, product: product, clientName: clientName }, { new: true });

    if (!client) {
      res.status(404).json({ error: 'Менеджер не найден' });
      return;
    }

    res.json({ message: 'Данные менеджера успешно обновлены', updatedManager: client });
  } catch (error) {
    console.error('Ошибка при обновлении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/updateBuyerData', async (req, res) => {
  const buyerId = req.body._id;
  const name = req.body.name
  const email = req.body.email;
  const phone = req.body.phone;
  const notice = req.body.notice;
  const managerID = req.body.managerID;


  try {
    const client = await Buyer.findByIdAndUpdate(buyerId, { email: email, phone: phone, managerID: managerID, name: name, notice: notice }, { new: true });

    if (!client) {
      res.status(404).json({ error: 'Менеджер не найден' });
      return;
    }

    res.json({ message: 'Данные менеджера успешно обновлены', updatedManager: client });
  } catch (error) {
    console.error('Ошибка при обновлении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/searchClients', async (req, res) => {
  const { numberPhone, adminKey } = req.body;

  try {
    const lastSixDigits = numberPhone.slice(-9);

    const searchData = await Client.find({
      $and: [
        {
          $or: [
            { phone: { $regex: `${lastSixDigits}$` } },
            { secondPhone: { $regex: `${lastSixDigits}$` } }
          ]
        }
      ]
    });

    // Возвращаем результаты поиска Клієнтов
    res.json(searchData);
  } catch (error) {
    console.error(`Ошибка при выполнении поиска Клієнтов: ${error}`);
    res.status(500).json({ error: 'Произошла ошибка при выполнении поиска' });
  }
});
//commit
app.post('/api/searchClientsManagers', async (req, res) => {
  const { numberPhone, adminKey } = req.body;

  try {
    const lastSixDigits = numberPhone.slice(-9);
    // Выполнение поиска в коллекции Client
    // const searchData = await Client.find({
    //   $or: [
    //     { phone: numberPhone },
    //     { secondPhone: numberPhone },
    //     { clientName: numberPhone }
    //   ]
    // });
    const searchData = await Client.find({
      $and: [
        {
          $or: [
            { phone: { $regex: `${lastSixDigits}$` } },
            { secondPhone: { $regex: `${lastSixDigits}$` } },
            { clientName: numberPhone }
          ]
        }
      ]
    });
    console.log(req.body)
    res.json(searchData);
  } catch (error) {
    console.error(`Ошибка при выполнении поиска Клієнтов: ${error}`);
    res.status(500).json({ error: 'Произошла ошибка при выполнении поиска' });
  }
});

// app.post('/api/checkContact', async (req, res) => {
//   const { numberPhone, adminKey } = req.body;

//   try {
//     // Поиск контакта по номеру телефона
//     const contact = await Client.findOne({
//       $or: [
//         { phone: numberPhone },
//         { secondPhone: numberPhone }
//       ]
//     });

//     // Проверка наличия контакта
//     if (contact) {
//       res.json({ contactExists: true });
//     } else {
//       res.json({ contactExists: false });
//     }
//   } catch (error) {
//     console.error(`Ошибка при выполнении проверки контакта: ${error}`);
//     res.status(500).json({ error: 'Произошла ошибка при проверке контакта' });
//   }
// }); 

//commit2
const normalizePhoneNumber = (phoneNumber) => {
  // Удаляем все символы, кроме цифр
  const normalized = phoneNumber.replace(/\D/g, '');

  // Получаем последние 7 цифр номера
  const lastSevenDigits = normalized.slice(-10);

  return lastSevenDigits;
};


//commit2
app.post('/api/checkContact', async (req, res) => {
  const { numberPhone, adminKey } = req.body;
  const phone = req.body.numberPhone
  try {
    // Нормализуем Номер телефону и получаем последние 7 цифр
    const normalizedPhone = normalizePhoneNumber(numberPhone);
    const client = await Client.find({ phone });

    const contacts = await Client.find({
      $or: [
        { phone: { $regex: normalizedPhone.slice(-10) } },
        { secondPhone: { $regex: normalizedPhone.slice(-10) } }
      ]
      
    });
    const manager = await Manager.find({ managerID: contacts.map(contact => contact.managerID) });
    console.log(normalizedPhone.slice(-10))
    
    // Проверка наличия контактов
    const contactExists = contacts.length > 0;

    if (contactExists) {
      res.json({ contactExists, manager });
    } else {
      res.json({ contactExists });
    }
  } catch (error) {
    console.error(`Ошибка при выполнении проверки контакта: ${error}`);
    res.status(500).json({ error: 'Произошла ошибка при проверке контакта' });
  }
});



app.put('/api/updateProductData', async (req, res) => {
  const productID = req.body._id
  const name = req.body.name
  const cost = req.body.cost
  const count = req.body.count


  try {
    const product = await Product.findByIdAndUpdate(productID, { name: name, cost: cost, count: count }, { new: true });

    if (!product) {
      res.status(404).json({ error: 'Менеджер не найден' });
      return;
    }

    res.json({ message: 'Данные менеджера успешно обновлены', updatedManager: product });
  } catch (error) {
    console.error('Ошибка при обновлении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/updateNotice', async (req, res) => {
  const noticeID = req.body._id
  const content = req.body.content
 
  try {
    const product = await Notice.findByIdAndUpdate(noticeID, { content: content }, { new: true });

    if (!product) {
      res.status(404).json({ error: 'Менеджер не найден' });
      return;
    }

    res.json({ message: 'Данные менеджера успешно обновлены' });
  } catch (error) {
    console.error('Ошибка при обновлении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.put('/api/updateTaskStatus', async (req, res) => {
  const taskID = req.body._id
  const status = req.body.taskStatus
  //// console.log(status)

  try {
    const product = await Task.findByIdAndUpdate(taskID, { taskStatus: status }, { new: true });

    if (!product) {
      res.status(404).json({ error: 'Менеджер не найден' });
      return;
    }

    res.json({ message: 'Данные менеджера успешно обновлены', updatedManager: product });
  } catch (error) {
    console.error('Ошибка при обновлении данных менеджера:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/deleteClient', async (req, res) => {
  const clientId = req.body._id; // Извлекаем идентификатор Клієнта из тела запроса
   console.log(clientId); // Проверяем, что идентификатор успешно извлечен

  try {
    // Используйте метод findByIdAndDelete для удаления Клієнта по идентификатору
    const deletedClient = await Client.findByIdAndDelete(clientId);
    console.log(deletedClient);
    if (!deletedClient) {
      res.status(404).json({ error: 'Клієнт не найден' });
      return;
    }
    const buyerData = {
      email: deletedClient.email,
      phone: deletedClient.phone,
      clientName: deletedClient.clientName,
      role: deletedClient.role,
      managerID: deletedClient.managerID,
      managerKey: deletedClient.managerKey,
      status: deletedClient.status,
      product: deletedClient.product,
      payment: deletedClient.payment,
      notice: deletedClient.notice,
      selectedDate: deletedClient.selectedDate,
      dateOfCreated: deletedClient.selectedDate
    };

    const buyer = new CloseClient(buyerData);
    buyer.save();

    res.json({ message: 'Клієнт успешно удален и добавлен в Buyer', deletedClient, newBuyer: buyer });
  } catch (error) {
    console.error('Ошибка при удалении Клієнта и добавлении в Buyer:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/deleteBuyer', async (req, res) => {
  const clientId = req.body._id;

  try {
    const deletedClient = await Buyer.findByIdAndDelete(clientId);

    if (!deletedClient) {
      res.status(404).json({ error: 'Клієнт не найден' });
      return;
    }

    res.json({ message: 'Клієнт успешно удален', deletedClient });
  } catch (error) {
    console.error('Ошибка при удалении Клієнта:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.delete('/api/deleteProduct', async (req, res) => {
  const clientId = req.body._id; // Извлекаем идентификатор Клієнта из тела запроса
  //// console.log(clientId); // Проверяем, что идентификатор успешно извлечен

  try {
    // Используйте метод findByIdAndDelete для удаления Клієнта по идентификатору
    const deletedClient = await Product.findByIdAndDelete(clientId);

    if (!deletedClient) {
      res.status(404).json({ error: 'Клієнт не найден' });
      return;
    }

    res.json({ message: 'Клієнт успешно удален', deletedClient });
  } catch (error) {
    console.error('Ошибка при удалении Клієнта:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});


app.delete('/api/deleteNotice', async (req, res) => {
  const clientId = req.body._id; // Извлекаем идентификатор Клієнта из тела запроса
  console.log(clientId); // Проверяем, что идентификатор успешно извлечен

  try {
    // Используйте метод findByIdAndDelete для удаления Клієнта по идентификатору
    const deletedClient = await Notice.findByIdAndDelete(clientId);

    if (!deletedClient) {
      res.status(404).json({ error: 'Клієнт не найден' });
      return;
    }

    res.json({ message: 'Клієнт успешно удален', deletedClient });
  } catch (error) {
    console.error('Ошибка при удалении Клієнта:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});
//commit
app.delete('/api/deleteClientAll', async (req, res) => {
  const clientId = req.body._id; // Извлекаем идентификатор Клієнта из тела запроса
  console.log(clientId); // Проверяем, что идентификатор успешно извлечен

  try {
    // Используйте метод findByIdAndDelete для удаления Клієнта по идентификатору
    const deletedClient = await CloseClient.findByIdAndDelete(clientId);

    if (!deletedClient) {
      res.status(404).json({ error: 'Клієнт не найден' });
      return;
    }

    res.json({ message: 'Клієнт успешно удален', deletedClient });
  } catch (error) {
    console.error('Ошибка при удалении Клієнта:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
