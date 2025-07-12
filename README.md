# Odoo Q&A Platform

A modern Q&A platform built with React frontend and Node.js backend.

Novice Coders
* Sumit Shekhar - shekharsumit65@gmail.com
* Pranav Prajyot - krsujal2004@gmail.com
* Kumar Sujal - pranavprajyot31@gmail.com
* Mayank Nishant - nishantmayank00@gmail.com

## Features

- User authentication (register/login)
- Ask and answer questions
- Rich text editor for questions and answers
- Voting system for answers
- Search functionality
- Responsive design
- Real-time updates

## Project Structure

```
├── src/                    # React frontend source
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── backend/               # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   └── server.js          # Express server
├── package.json           # Frontend dependencies
├── vite.config.js         # Vite configuration
└── index.html             # HTML template
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/odoo_qa
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### 4. Start the Development Servers

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:3000`.

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run server` - Start backend server
- `npm run dev` - Start backend with nodemon (development)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `PATCH /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers/question/:questionId` - Create new answer
- `PATCH /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer

## Technologies Used

### Frontend
- React 18
- React Router DOM
- Vite
- React Quill (Rich text editor)
- Axios (HTTP client)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (Password hashing)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 
