# Event Management Tool

A full-stack event management platform for organizing, tracking, and managing events. This project includes a React-based client and a Node.js/Express backend.

## Features

- User authentication (admin and regular users)
- Event creation, editing, and deletion
- Event catalog and dashboard views
- Calendar integration
- Email notifications
- PDF generation for event details
- Budget calculation utilities
- Responsive UI with modern design

## Project Structure

```
client/           # React frontend
server/           # Node.js/Express backend
```

### Client (Frontend)
- Built with React and Vite
- Located in the `client/` directory
- Main entry: `src/App.jsx`
- Components for authentication, dashboard, calendar, event forms, and more
- Styles in `src/styles/`

### Server (Backend)
- Built with Node.js, Express, and MongoDB
- Located in the `server/` directory
- Main entry: `src/index.js`
- RESTful API endpoints for events, users, authentication, and catalog
- Email and PDF services
- Middleware for authentication, error handling, logging, and rate limiting

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Setup

#### 1. Clone the repository
```bash
git clone <repo-url>
cd eventmanagement tool
```

#### 2. Install dependencies
- For the client:
  ```bash
  cd client
  npm install
  # or
  yarn
  ```
- For the server:
  ```bash
  cd ../server
  npm install
  # or
  yarn
  ```

#### 3. Configure environment variables
- Create a `.env` file in the `server/` directory with your MongoDB URI and email credentials. See `EMAIL_SETUP.md` for email configuration.

#### 4. Run the development servers
- Start the backend:
  ```bash
  cd server
  npm run dev
  ```
- Start the frontend:
  ```bash
  cd client
  npm run dev
  ```

#### 5. Access the app
- Open [http://localhost:5173](http://localhost:5173) in your browser for the frontend.
- The backend runs on [http://localhost:3000](http://localhost:3000) by default.

## Testing
- Backend tests are in `server/test/`.
- Run tests with:
  ```bash
  cd server
  npm test
  ```

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
