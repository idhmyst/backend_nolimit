# NoLimit Backend Test

Backend API untuk blog aplikasi dengan Node.js, Express, Sequelize, MySQL, JWT, dan Bcrypt.

## 📋 Prasyarat

- Node.js v14+ 
- MySQL Server
- npm atau yarn

## 🚀 Cara Menjalankan Proyek

### 1. Clone Repository

```bash
git clone <repository-url>
cd nolimit-backend-test
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat Database

Buat database MySQL dengan nama `nolimit_blog`:

```sql
CREATE DATABASE nolimit_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Atau gunakan command line:

```bash
mysql -u root -p -e "CREATE DATABASE nolimit_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Setup Environment Variables

Buat file `.env` di root folder proyek:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nolimit_blog
DB_PORT=3306

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

NODE_ENV=development
PORT=3000
```

**Sesuaikan nilai-nilai berikut dengan konfigurasi Anda:**
- `DB_USER`: Username MySQL Anda
- `DB_PASSWORD`: Password MySQL Anda
- `JWT_SECRET`: Secret key untuk JWT (gunakan string yang kuat)

### 5. Jalankan Aplikasi

**Mode Development (dengan hot reload):**

```bash
npm run dev
```

**Mode Production:**

```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## 🧪 Running Tests

Jalankan unit test:

```bash
npm test
```

Semua test cases akan ditampilkan dengan status PASSED ✅

## 📁 Struktur Folder

```
nolimit-backend-test/
├── config/
│   └── database.js          # Konfigurasi Sequelize
├── models/
│   ├── User.js              # Model User
│   └── Post.js              # Model Post
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── controllers/
│   ├── authController.js    # Register & Login
│   └── postController.js    # Post CRUD operations
├── routes/
│   └── api.js               # API endpoint definitions
├── tests/
│   └── api.test.js          # Unit tests
├── .env                     # Environment variables (jangan commit)
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies
└── server.js               # Entry point
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register user baru
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login dan dapatkan token
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Posts (memerlukan authentication token)

- `GET /api/posts` - Dapatkan semua posts
- `GET /api/posts/:id` - Dapatkan post berdasarkan ID
- `POST /api/posts` - Buat post baru (perlu token)
  ```json
  {
    "title": "Judul Post",
    "content": "Isi post"
  }
  ```
- `PUT /api/posts/:id` - Update post (perlu token, hanya pemilik)
- `DELETE /api/posts/:id` - Hapus post (perlu token, hanya pemilik)

## 🔐 Authentication

Untuk mengakses endpoint yang memerlukan authentication, sertakan header:

```
Authorization: Bearer <token>
```

Token diperoleh dari endpoint login dan berlaku selama 24 jam.

## 🛠️ Teknologi yang Digunakan

- **Express.js** - Web framework
- **Sequelize** - ORM untuk MySQL
- **MySQL2** - MySQL driver
- **JWT (jsonwebtoken)** - Token authentication
- **Bcrypt** - Password hashing
- **Dotenv** - Environment variables management
- **Jest** - Unit testing framework
- **Supertest** - HTTP assertion library
- **Nodemon** - Auto-reload development server

## 📝 Development

### Hot Reload

Aplikasi sudah menggunakan `nodemon` untuk development. Setiap perubahan file akan otomatis me-reload aplikasi.

### Database Sync

Untuk auto-sync database schema, uncomment line di `server.js`:

```javascript
await sequelize.sync({ alter: true });
```

⚠️ **Hati-hati** di production environment!

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED"
- Pastikan MySQL Server sudah running
- Periksa konfigurasi `.env` (host, port, user, password)

### Error: "Unknown database 'nolimit_blog'"
- Pastikan database sudah dibuat dengan nama yang benar
- Periksa nama database di file `.env`

### Error: "Access denied for user"
- Periksa username dan password MySQL di file `.env`

## 📄 Lisensi

ISC

## 👤 Author

Created for NoLimit Backend Test Project

---

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.
