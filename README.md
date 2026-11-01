<!-- # Description -->

<p align="center">
  <img src="fgp-logo.png" alt="Full Gear Pogi Club logo" width="220">
  <img src="fgp-logo-small.png" alt="Full Gear Pogi Club small logo" width="80">
</p>

<hr>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Redux-Toolkit%20%2F%20Thunk-764ABC?logo=redux&logoColor=white" alt="Redux">
  <img src="https://img.shields.io/badge/MUI-Material%20UI-007FFF?logo=mui&logoColor=white" alt="Material UI">
</p>

<p align="center">
  A full-stack e-commerce web application built with the MERN stack for a made-up motorcycle gear shop named <strong>Full Gear Pogi Club (FGPC)</strong>. It gives riders a modern web shop to browse helmets, jackets, pants, boots, and armor, submit product reviews with profanity filtering, manage orders and return requests, and provides administrators with a complete dashboard for inventory management, sales analytics, and automated email receipts with PDF generation.
</p>

## Demo

![Admin demo](admin-demo.gif)
![Customer demo](customer-demo.gif)
![Mobile demo](mobile-demo.gif)

## Technical Details

- **Language:** JavaScript (ES6+ / Node.js & React 19)
- **Database:** MongoDB (via Mongoose ODM) with support for local MongoDB and MongoDB Atlas
- **User Interface:** Custom dark motorcycle aesthetic (`#0A0A0A` background, `#C6FF00` neon accent) styled with CSS, paired with Material UI (MUI) DataGrid components and a mobile-optimized responsive layout featuring a burger navigation menu
- **Architecture:** Client-server REST API architecture. The Express backend handles routing, data validation, image uploads, email delivery, and JWT token sessions. The React frontend uses Redux for centralized state management and Axios for API communication.

The backend server starts from [`backend/server.js`](backend/server.js) on port 8000 (or `PORT` from environment). The frontend runs as a Single Page Application (SPA) built using Create React App.

## Course Requirements Implemented

This project fulfills all requirements specified in the course syllabus:

- **MP1 (Product/Service CRUD & Datatables - 20pts):** Full CRUD for products, categories, and brands. Material UI DataGrid tables with sorting, pagination, and multi-photo uploads (`backend/utils/uploads.js`, `frontend/src/pages/admin/Products.js`).
- **MP2 (Filter Functions - 20pts):** Price filter, category filter, ratings filter, and review search filter by product name and rating score (`frontend/src/pages/store/Products.js`, `frontend/src/pages/admin/Reviews.js`).
- **MP3 (Review & Ratings - 20pts):** Verified purchase check so only users who bought and received the gear can review and rate it. Customers can edit their own reviews, and admins can moderate and delete reviews (`backend/Controllers/reviewController.js`, `frontend/src/components/Review/ReviewList.js`).
- **Term Test Lab (Transaction Completion & Email Receipts - 30pts):** Customers can mark delivered orders as completed. Admins update order statuses. Automated emails notify the customer with an itemized product list, subtotals, grand total, and an attached PDF receipt generated dynamically via PDFKit (`backend/utils/mailer.js`, `backend/utils/receiptGenerator.js`).
- **Unit 1 (Bad Words Filter & Form Validation - 20pts):** Profanity filter that masks foul words with asterisks using `bad-words`. Schema-based form validation on user registration, login, profile updates, and product forms using `yup` and `formik` (`backend/Controllers/reviewController.js`, `frontend/src/components/Product/ProductForm.js`, `frontend/src/pages/Login.js`).
- **Unit 2 (UI Design & Material UI - 20pts):** Custom dark-mode UI with hairline borders, Coolvetica font, neon accents, and Material UI (`@mui/material`, `@mui/x-data-grid`) for interactive administrative datatables (`frontend/src/index.css`, `frontend/src/components/Table/DataTable.js`).
- **Quiz 2 (Sales Analytics Charts - 15pts):** Admin sales analytics with date range picker (Last 7 Days, Last 30 Days, This Year, All Time) and a toggle between Line chart and Bar chart. Counts only delivered orders while deducting returned items (`frontend/src/pages/admin/Dashboard.js`).
- **Quiz 3 (Pagination & Infinite Scroll - 15pts):** Homepage best-seller pagination by 4s (`frontend/src/pages/store/Storefront.js`) and infinite scroll on the main products catalog page (`frontend/src/pages/store/Products.js`).
- **Quiz 4 (Google / Gmail Authentication - 15pts):** One-click Google sign-in using Firebase Authentication popup on the frontend and token verification via Firebase Admin SDK on the backend (`frontend/src/pages/Login.js`, `backend/config/firebase.js`).

## Packages Used & Why We Used Them

### Backend Packages

- **`express`** - The core web framework we used to set up the server, define REST endpoints, and handle HTTP request/response lifecycles.
- **`mongoose`** - Connects our Node.js app to MongoDB and lets us define clear schemas for products, users, orders, reviews, and carts.
- **`dotenv`** - Loads secret keys and environment variables (like database connection strings, JWT secret, and email credentials) from the `.env` file.
- **`cors`** - Enables Cross-Origin Resource Sharing so our React frontend can talk to our Express backend without the browser blocking the requests.
- **`cookie-parser`** - Parses incoming cookies from the client so we can read session cookies.
- **`jsonwebtoken`** - Generates and verifies JWT tokens to keep users logged in securely and protect private routes.
- **`bcryptjs`** - Hashes user passwords with salt before saving them to MongoDB so plain text passwords are never stored in the database.
- **`multer`** - Middleware that processes incoming `multipart/form-data` uploads when users upload product images or profile photos.
- **`cloudinary`** - Cloud image hosting service where uploaded pictures are stored and served via CDN URLs so we don't have to rely solely on local disk storage.
- **`nodemailer`** - Handles sending transactional emails (like order status updates and receipts) to customers via Mailtrap SMTP.
- **`pdfkit`** - Creates clean, downloadable PDF receipts programmatically in memory so we can attach them to customer transaction emails.
- **`bad-words`** - Scans customer reviews and discussion replies and replaces swear words with asterisks to keep user reviews clean.
- **`validator`** - Validates strings (like checking if an email is formatted properly) before creating new database documents.
- **`firebase-admin`** - Verifies Google authentication tokens on the backend when someone logs in using their Gmail account.

### Frontend Packages

- **`react` & `react-dom`** - The primary library for rendering our UI components, managing component states, and rendering the DOM.
- **`react-router-dom`** - Client-side router that switches pages (e.g. `/`, `/products`, `/admin`, `/login`) instantly without reloading the whole browser.
- **`redux` & `react-redux`** - Centralized store that keeps track of global app data like products, current cart items, logged-in user, and orders.
- **`redux-thunk`** - Middleware that allows our Redux action creators to make asynchronous API calls and dispatch results to reducers.
- **`axios`** - Makes HTTP requests from React to our Express API. We configured an interceptor to automatically attach our `Bearer` token to headers.
- **`@mui/material` & `@mui/x-data-grid`** - Material UI library used for rich datatables in the admin panel with built-in sorting, filtering, and row pagination.
- **`@emotion/react` & `@emotion/styled`** - Style engines required by Material UI to inject component CSS rules.
- **`formik`** - Simplifies form handling by managing values, change events, blur events, and form submission states without boilerplate.
- **`yup`** - Defines schema rules (like minimum length, required fields, and email format) to validate form fields alongside Formik.
- **`react-hook-form`** - Lightweight form library installed for flexible form control and performance.
- **`recharts`** - Renders the interactive Line and Bar charts in the admin dashboard for tracking delivered net sales over custom date ranges.
- **`firebase`** - Client SDK used to trigger the Google Sign-In popup window and get the user's ID token.

## Features

- **Storefront & Catalog:**
  - Hero banner with quick shop links and responsive burger menu navigation.
  - Homepage best-seller pagination by 4s.
  - Products catalog with infinite scroll loading, category filter, price range inputs, and minimum star rating filter.
  - Multi-image carousel on product detail pages with thumbnail selector.
  - Out-of-stock items automatically placed at the end with distinct out-of-stock indicators.
- **Customer Account & Activity:**
  - User registration and login with Formik + Yup validation.
  - One-click Google / Gmail sign-in with Firebase.
  - Profile page with multiple shipping address management and avatar photo upload.
  - Combined "My Activity" dashboard displaying past orders, product reviews, and return requests in one place.
  - Order cancellation for pending orders, and order completion for delivered orders.
- **Review & Discussion System:**
  - Verified purchase restriction: customer can only rate and review gear they ordered and received.
  - Customers can edit their existing reviews and star ratings.
  - Automated profanity filter masking inappropriate words using `bad-words`.
  - Nested discussion replies with profile picture circles and role badges (`🛡️ Store Admin` vs `👤 Customer`).
- **Shopping Cart & Checkout:**
  - Persistent shopping cart supporting both guests and signed-in customers.
  - Quantity controls with live stock boundary limits.
  - Multi-step checkout with saved shipping address selection.
- **Admin Management & Dashboard:**
  - Administrative dashboard showing sales metrics, delivered net sales, top products, and top customers.
  - Interactive charts supporting date range filtering and toggle between Line and Bar charts.
  - Full CRUD operations with Material UI DataGrid tables for Products, Categories, Brands, Orders, Returns, Reviews, and Users.
  - Soft-delete support across products, categories, brands, orders, and reviews.
  - Admin reply to reviews and delete review / delete reply controls.
- **Email & PDF Receipts:**
  - Automated email dispatch via Nodemailer / Mailtrap when order status changes.
  - Email includes itemized list of gear, quantities, unit prices, subtotals, and grand total.
  - PDF receipt generated dynamically via PDFKit and attached directly to the email.
- **Mobile Responsive Design:**
  - Full responsive optimization for smartphones and tablets (`<= 768px` and `<= 480px`).
  - Mobile burger menu drawer with logo on the left and menu toggle on the right.
  - Mobile-friendly stacked cart view with touch-friendly quantity controls.

## Project Structure

```text
backend/
├── config/             Firebase Admin SDK configuration
├── Controllers/        Route controller handlers (auth, products, orders, reviews, etc.)
├── middlewares/        Authentication, role checks, and file upload middlewares
├── Models/             Mongoose data schemas (User, Product, Order, Review, Cart, etc.)
├── Routes/             Express API routes
├── utils/              JWT signing, cookies, Mailtrap emailer, PDFKit receipt generator, Cloudinary uploads
├── app.js              Express app configuration and CORS setup
└── server.js           Database connection and HTTP server listener

frontend/
├── public/             Static assets, index.html, manifest.json, and Render _redirects
└── src/
    ├── actions/        Redux action creators for authentication, cart, and resources
    ├── api/            Axios HTTP client configured with baseURL and Bearer token interceptor
    ├── assets/         Logos, branding imagery, and hero photos
    ├── components/     Reusable UI components (Catalog, Form, Layout, Product, Review, Table)
    ├── constants/      Redux action type constants
    ├── hooks/          Custom React hooks (useAuth)
    ├── pages/
    │   ├── admin/      Admin dashboard, products, categories, brands, orders, reviews, users
    │   └── store/      Storefront, catalog, product details, cart, checkout, profile, activity
    ├── reducers/       Redux reducers for auth, cart, and resource collections
    ├── utils/          Date formatters, price formatters, image URL resolvers
    ├── App.js          Root router, route protection, and dynamic title/favicon manager
    ├── index.js        React root entry point with Redux Provider
    └── index.css       Main custom CSS styling and responsive media queries
```

## Setup & Local Installation

### Prerequisites

- Node.js (version 18 or later)
- MongoDB running locally on `mongodb://127.0.0.1:27017/fgp` or a MongoDB Atlas cloud URI
- npm or yarn

### 1. Clone the repository

```bash
git clone <repository-url>
cd fgp-mern
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory (you can refer to `backend/render-env.txt` for all available keys):

```env
PORT=8000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/fgp
JWT_SECRET=supersecretfgpjwtkey2026fgpcsecure
CLIENT_URL=http://localhost:3000

# Cloudinary (Image Hosting)
CLOUDINARY_ENABLED=true
CLOUDINARY_CLOUD_NAME=zde7dpud
CLOUDINARY_API_KEY=643555333758435
CLOUDINARY_API_SECRET=ZabXy0VqtGfzn2VPwrmotzT_b0Q

# Mailtrap (Email & PDF Receipts)
MAILTRAP_ENABLED=true
MAILTRAP_USER=d06f8760800fa0
MAILTRAP_PASS=c6053775ed89ea

# Render deployment toggle (leave false for local MongoDB)
DEPLOY_TO_RENDER=false
```

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

In a new terminal window:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

The store will open at [http://localhost:3000](http://localhost:3000) and the backend API will run on [http://localhost:8000](http://localhost:8000).

## Deployment (Render.com)

- **Backend:** Deployed as a Web Service. Run command: `node server.js`. Add environment variables from `backend/render-env.txt`.
- **Frontend:** Deployed as a Static Site. Build command: `npm install && npm run build`, Publish directory: `build`. Add rewrite rule `/* -> /index.html` (handled automatically via `frontend/public/_redirects`).
