# Event Management Tool - Backend

Express.js backend server for the Event Management Tool application.

## Features

- RESTful API architecture
- JWT authentication
- MongoDB database integration
- User and Event management
- Admin role-based access control
- Input validation and error handling

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventmanagement
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Events
- `GET /api/events` - Get all events (protected)
  - All company users can see all events
- `GET /api/events/:id` - Get event by ID (protected)
- `POST /api/events` - Create new event (protected)
- `PUT /api/events/:id` - Update event (protected)
  - All company users can edit any event
- `DELETE /api/events/:id` - Delete event (admin only)
- `GET /api/events/calendar/upcoming` - Get upcoming events (protected)
- `GET /api/events/drafts` - Get draft events (protected)
- `GET /api/events/dashboard/stats` - Get dashboard statistics (admin only)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health Check
- `GET /api/health` - Server health status

## Project Structure

```
server/
├── logs/                  # Log files
├── scripts/               # Utility scripts (e.g., createAdminUser.js)
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── catalog.controller.js
│   │   ├── event.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── logging.js
│   │   ├── rateLimiter.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/
│   │   ├── Event.model.js
│   │   └── User.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── catalog.routes.js
│   │   ├── event.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── email.service.js
│   │   └── pdf.service.js
│   ├── utils/
│   │   └── budgetCalculator.js
│   └── index.js
├── test/
│   └── test-budget-calculation.js
├── clear-pdf.js
├── EMAIL_SETUP.md
├── email-preview.html
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All errors are handled centrally and return consistent JSON responses:

```json
{
  "message": "Error message",
  "stack": "Stack trace (development only)"
}
```

## License

ISC
