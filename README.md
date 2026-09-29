# Product Price & Quality Comparison Platform

A production-quality platform helping users find the best products within their budget by comparing prices, quality, and real reviews across multiple platforms without overwhelming technical jargon.

## Features
- **Multi-Platform Price Comparison**: Compare final prices (including shipping & discounts).
- **Quality Analysis Engine**: Aggregates reviews, showing rating, review volume, and positive/negative thematic feedback.
- **Smart Recommendation System**: Suggests the best product based on price, quality, and a user's budget.
- **Visual Analytics**: Interactive Recharts-based bar chart comparing prices visually.
- **Authentication**: JWT & bcrypt powered authentication system.
- **Modern Responsive UI**: Clean TailwindCSS and React design.

## Architecture
This project strictly follows a decoupled MVC architecture.

### Technology Stack
- **Frontend**: React, React Router, Vite, TailwindCSS, Recharts, Axios, Lucide React
- **Backend**: Node.js, Express, bcrypt, jsonwebtoken, Helmet, CORS, Morgan
- **Database**: Supabase / PostgreSQL (Schema provided)

## Folder Structure
```
product-comparison-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── .env.example
│   └── package.json
└── database_schema.sql
```

## Installation & Setup

### Database Setup
1. Create a Supabase project.
2. Go to the SQL Editor and run the contents of `database_schema.sql` (located in the root folder).

### Environment Variables
**Backend (`backend/.env`)**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
BCRYPT_SALT_ROUNDS=12
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Backend
```bash
cd backend
npm install
npm run dev
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Documentation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products/search?q=` | Search products by name/brand |
| GET | `/api/products/:id` | Get basic product details |
| GET | `/api/comparisons/:id/compare` | Get multi-platform price listings |
| GET | `/api/comparisons/:id/quality` | Get aggregated review metrics |
| POST | `/api/comparisons/recommendations` | Calculate best product in budget |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get logged-in user profile |

## Demo Data Note
As requested per the specifications, real-time scraping of marketplaces is omitted to respect TOS. The backend currently supplies robust mock `Demo Data` through the controllers to fully demonstrate the product comparison, recommendation, and quality analysis functionality without relying on unauthorized scraping.
# New-ROLE
