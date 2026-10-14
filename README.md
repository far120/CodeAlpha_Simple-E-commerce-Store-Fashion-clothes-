# 🛍️ Fashion Market — Full-Stack E-Commerce Store

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A modern, responsive full-stack fashion e-commerce web application developed as part of the **CodeAlpha** internship. The platform provides a seamless shopping experience for customers and a full-featured management panel for administrators.

---

## ✨ Features

### 🛒 Customer Storefront
- **Product Catalog & Discovery**: Browse, search, and filter fashion items by categories and brands.
- **Product Details & Reviews**: View detailed item descriptions, images, pricing, and customer ratings/reviews.
- **Shopping Cart & Checkout**: Add items to cart, manage quantities, and place orders.
- **Order Tracking**: Review past orders, shipment status, and purchase history.
- **User Authentication**: Secure sign-up, sign-in, and profile management using JWT authentication.

### 🛡️ Admin Dashboard
- **Product Management**: Create, update, upload images, and delete products.
- **Category & Brand Management**: Organize the store taxonomy.
- **Order Management**: Monitor incoming customer orders and update status.
- **User & Activity Logs**: Track registered users and inspect system audit logs (`UserLogs`).

### 🔒 Security & Performance
- **Data Validation & Sanitization**: Joi schemas for request validation.
- **API Security**: HTTP security headers with Helmet, CORS configuration, and rate-limiting.
- **Logging & Error Handling**: Structured logging with Winston & Morgan alongside centralized async error handling.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, TanStack React Query v5, Axios, React Hook Form, React Icons |
| **Backend** | Node.js, Express 5, Mongoose (MongoDB ODM), JWT, bcryptjs, Multer |
| **Security & Utilities** | Helmet, Express Rate Limit, Compression, Joi, Winston, Morgan |

---

## 📁 Project Structure

```text
├── Backend/                 # Express API server
│   ├── api/                 # Serverless / API configuration
│   ├── seeding/             # Database seeders (products & categories)
│   ├── src/
│   │   ├── config/          # DB connection & environment configs
│   │   ├── controllers/     # Route logic controllers
│   │   ├── middlewares/     # Auth, rate-limit, logger, upload middlewares
│   │   ├── models/          # Mongoose data schemas (User, Product, Order, etc.)
│   │   ├── routes/          # Express route endpoints
│   │   └── utils/           # Error handling & logger utilities
│   └── .env                 # Backend environment variables
│
├── Frontend/                # React + Vite client
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks & TanStack Query hooks
│   │   ├── pages/           # Store pages (Home, Menu, ProductDetails, Orders)
│   │   │   └── admin/       # Admin dashboards (Products, Users, Orders, Logs)
│   │   └── services/        # Axios API client calls
│
└── image of project/        # Application screenshots & UI previews
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

---

### 1. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Configure environment variables
# Verify or edit .env:
# PORT=3006
# MONGO_URI=mongodb://localhost:27017/FashionMarket
# JWT_SECRET=your_jwt_secret

# (Optional) Seed the database with sample products and categories
npm run seed:products

# Start the server (development mode)
npm run dev
```

*The API server will run at `http://localhost:3006`.*

---

### 2. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

*The client application will run at `http://localhost:5173`.*

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/register` | Register new user account | Public |
| `POST` | `/api/users/login` | Login & receive JWT | Public |
| `GET` | `/api/products` | Fetch paginated/filtered products | Public |
| `POST` | `/api/products` | Create a new product | Admin |
| `GET` | `/api/orders` | Fetch user / all orders | Authenticated / Admin |
| `POST` | `/api/orders` | Place a new order | Customer |
| `GET` | `/api/categories` | List product categories | Public |
| `GET` | `/api/brands` | List product brands | Public |
| `GET` | `/api/userslogs` | View user activity audit logs | Admin |

---

## 👤 Author

- **Mostafa ELFAR**
- Project developed for **CodeAlpha** Internship
