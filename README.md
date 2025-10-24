# ThinkBoard Backend API 🚀

A robust Node.js/Express backend for the ThinkBoard note-taking application, featuring authentication, rate limiting, cloud storage, and comprehensive note management.

## ✨ Features

- **User Authentication** - Secure JWT-based authentication with HTTP-only cookies
- **Note Management** - Full CRUD operations for notes with archive and trash functionality
- **Search & Filter** - Real-time search and tag-based filtering
- **Rate Limiting** - Upstash Redis-powered rate limiting to prevent abuse
- **Cloud Storage** - Cloudinary integration for profile picture uploads
- **Share Notes** - Generate unique shareable links for notes
- **Data Security** - Password hashing with bcrypt and secure cookie handling

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES6 Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **Rate Limiting**: Upstash Redis with @upstash/ratelimit
- **Cloud Storage**: Cloudinary
- **File Upload**: Multer
- **Email**: Nodemailer (configured)
- **Validation**: Joi
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account
- Upstash Redis instance

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

4. Start the development server:
```bash
npm run dev
```

5. For production:
```bash
npm start
```

The server will start on `http://localhost:5001`

## 📁 Project Structure

```
src/
├── config/              # Configuration files
│   ├── cloudinary.js   # Cloudinary setup
│   ├── db.js           # MongoDB connection
│   ├── token.js        # JWT token generation
│   └── upstash.js      # Rate limiter config
├── controller/         # Request handlers
│   ├── authController.js    # Authentication logic
│   ├── notesController.js   # Note operations
│   └── userController.js    # User profile operations
├── middleware/         # Custom middleware
│   ├── isAuth.js      # Authentication middleware
│   ├── rateLimiter.js # Rate limiting middleware
│   └── upload.js      # File upload config
├── models/            # Mongoose schemas
│   ├── Note.js       # Note model
│   └── User.js       # User model
├── routes/           # API routes
│   ├── authRoutes.js
│   ├── notesRoutes.js
│   └── userRoutes.js
└── server.js         # Entry point
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | No |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get current user profile | Yes |
| PUT | `/profile/picture` | Upload profile picture | Yes |

### Notes Routes (`/api/notes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all active notes | Yes |
| POST | `/` | Create new note | Yes |
| GET | `/:id` | Get note by ID | Yes |
| PUT | `/:id` | Update note | Yes |
| DELETE | `/:id` | Delete note | Yes |
| GET | `/search?query=term` | Search notes | Yes |
| GET | `/tag/:tag` | Filter notes by tag | Yes |
| PUT | `/:id/archive` | Toggle archive status | Yes |
| GET | `/archived` | Get archived notes | Yes |
| PUT | `/:id/trash` | Move note to trash | Yes |
| GET | `/trashed` | Get trashed notes | Yes |
| PUT | `/:id/restore` | Restore from trash | Yes |
| DELETE | `/:id/permanent` | Permanently delete | Yes |
| POST | `/:id/share` | Generate share link | Yes |
| GET | `/public/:sharedId` | View shared note | No |

## 🔐 Authentication

The API uses JWT tokens stored in HTTP-only cookies for authentication:

```javascript
// Login Response
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
// Token is automatically set in cookies
```

### Protected Routes
All routes except registration, login, and shared note viewing require authentication. Include credentials with requests:

```javascript
// Example fetch request
fetch('http://localhost:5001/api/notes', {
  method: 'GET',
  credentials: 'include', // Important!
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## 📝 Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

### Create Note
```bash
POST /api/notes
Content-Type: application/json
Cookie: token=<jwt_token>

{
  "title": "My First Note",
  "content": "This is the content of my note",
  "tags": ["work", "important"]
}
```

### Search Notes
```bash
GET /api/notes/search?query=meeting
Cookie: token=<jwt_token>
```

### Upload Profile Picture
```bash
PUT /api/user/profile/picture
Content-Type: multipart/form-data
Cookie: token=<jwt_token>

FormData: {
  avatar: <file>
}
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token generation with 30-day expiration
- **HTTP-Only Cookies**: Prevents XSS attacks
- **CORS Configuration**: Whitelist-based origin control
- **Rate Limiting**: Prevents brute force attacks (10 requests per 20 seconds)
- **Input Validation**: Joi schema validation
- **Ownership Verification**: Users can only access their own notes

## ⚙️ Configuration

### CORS Settings
Configure allowed origins in `server.js`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://your-frontend-domain.com'
];
```

### Rate Limiting
Adjust rate limits in `src/config/upstash.js`:
```javascript
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "20 s") // 10 requests per 20 seconds
})
```

### Cookie Settings
Modify cookie configuration in authentication controllers:
```javascript
res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",
  secure: true, // Set to false for local development
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});
```

## 📊 Database Models

### User Model
```javascript
{
  name: String (required, 3-50 chars),
  email: String (required, unique),
  password: String (required, min 8 chars),
  username: String (unique),
  avatarUrl: String (default: ""),
  createdAt: Date,
  updatedAt: Date
}
```

### Note Model
```javascript
{
  title: String (required, max 200 chars),
  content: String (required, max 10000 chars),
  tags: [String] (max 50 chars each),
  userId: ObjectId (ref: User),
  isArchived: Boolean (default: false),
  isTrashed: Boolean (default: false),
  sharedId: String (nullable),
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

## 🐛 Debugging

Enable detailed logging:
```javascript
// Check cookies in middleware
console.log('Received cookies:', req.cookies);

// Test cookie functionality
GET /test-cookie
```

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are set:
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure secure cookies (`secure: true`)
- Set proper CORS origins

### Recommended Platforms
- **Railway**
- **Render**
- **Heroku**
- **DigitalOcean**
- **AWS EC2**

## 📦 Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cookie-parser` - Parse cookies
- `cors` - Enable CORS
- `dotenv` - Environment variables
- `cloudinary` - Cloud storage
- `multer` - File uploads
- `@upstash/ratelimit` - Rate limiting
- `@upstash/redis` - Redis client
- `uuid` - Generate unique IDs
- `joi` - Input validation
- `nodemailer` - Email functionality

### Development
- `nodemon` - Auto-restart server

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### Common Issues

**Issue: Cookies not being set**
- Ensure `credentials: 'include'` in frontend requests
- Check `sameSite` and `secure` cookie settings
- Verify CORS configuration includes `credentials: true`

**Issue: Rate limiting too aggressive**
- Adjust limits in `src/config/upstash.js`
- Consider implementing per-user rate limiting

**Issue: MongoDB connection fails**
- Verify MongoDB URI in `.env`
- Check network access and IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions

**Issue: File upload fails**
- Verify Cloudinary credentials
- Check file size limits
- Ensure `tmp/` directory exists

## 📞 Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using Node.js and Express
