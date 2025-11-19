# Code Snippets Backend API

A modern, well-structured REST API built with Express.js and MySQL for managing code snippets, notes, projects, and more.

## 🚀 Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **CRUD Operations**: Full CRUD for snippets, notes, projects, folders, and tags
- **Search Functionality**: Search across all content types
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Request logging and error logging
- **Validation**: Express-validator for request validation
- **Service Layer**: Clean separation of concerns with service layer pattern

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Database configuration
│   │   └── env.js           # Environment configuration
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── snippet.controller.js
│   │   ├── note.controller.js
│   │   ├── project.controller.js
│   │   └── search.controller.js
│   ├── middlewares/         # Custom middleware
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Error handling
│   │   ├── validator.js     # Request validation
│   │   └── logger.js        # Request logging
│   ├── routes/              # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── snippet.routes.js
│   │   ├── note.routes.js
│   │   ├── project.routes.js
│   │   ├── folder.routes.js
│   │   ├── search.routes.js
│   │   └── index.js
│   ├── services/            # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── snippet.service.js
│   │   ├── note.service.js
│   │   └── project.service.js
│   ├── utils/               # Utility functions
│   │   └── helpers.js
│   └── index.js             # Entry point
├── .env.example             # Environment variables example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Clone the repository** (if not already done)

2. **Navigate to backend folder**
   ```bash
   cd backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create environment file**
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables**
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5001
   NODE_ENV=development
   
   DB_HOST=your_db_host
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   DB_PORT=3306
   
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   
   CORS_ORIGIN=http://localhost:5173
   ```

6. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (protected)
- `GET /api/users/:id` - Get user by ID (protected)
- `PATCH /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

### Snippets
- `GET /api/snippets` - Get all snippets (protected)
- `GET /api/snippets/:id` - Get snippet by ID (protected)
- `POST /api/snippets` - Create snippet (protected)
- `PATCH /api/snippets/:id` - Update snippet (protected)
- `DELETE /api/snippets/:id` - Delete snippet (protected)

### Notes
- `GET /api/notes` - Get all notes (protected)
- `GET /api/notes/:id` - Get note by ID (protected)
- `POST /api/notes` - Create note (protected)
- `PATCH /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)

### Projects
- `GET /api/projects` - Get all projects (protected)
- `GET /api/projects/:id` - Get project by ID (protected)
- `GET /api/projects/:id/stats` - Get project statistics (protected)
- `POST /api/projects` - Create project (protected)
- `PATCH /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)
- `GET /api/projects/:projectId/snippets` - Get project snippets (protected)
- `GET /api/projects/:projectId/notes` - Get project notes (protected)

### Folders
- `GET /api/folders/:folderId/snippets` - Get folder snippets (protected)
- `GET /api/folders/:folderId/notes` - Get folder notes (protected)

### Search
- `GET /api/search?q=query` - Search across all content (protected)

### Health Check
- `GET /api/health` - Check API health
- `GET /` - API information

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🎯 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🔧 Technologies Used

- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Express Validator** - Request validation
- **Express Rate Limit** - Rate limiting
- **Nanoid** - ID generation
- **Dotenv** - Environment variables

## 📝 Development

- Use `npm run dev` for development with auto-reload
- Follow the existing code structure and patterns
- Add validation for all new endpoints
- Use the service layer for business logic
- Handle errors properly with try-catch

## 🚨 Error Handling

The API uses centralized error handling:

- Validation errors: 400
- Authentication errors: 401
- Authorization errors: 403
- Not found errors: 404
- Conflict errors: 409
- Server errors: 500

## 🔐 Security Features

- **Helmet**: Sets secure HTTP headers
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Validates all inputs
- **Password Hashing**: bcrypt with salt rounds
- **JWT**: Secure token-based authentication

## 📊 Performance

- Connection pooling for database
- Async/await for non-blocking operations
- Efficient SQL queries
- Response caching (can be added)

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Create meaningful commit messages

## 📄 License

MIT

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

Built with ❤️ using modern JavaScript and Express.js best practices.
