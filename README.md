# EventEmpire - Comprehensive Event Management Platform

A full-stack event management system built with **React.js**, **Node.js/Express**, and **MongoDB**, featuring vendor management, budget tracking, real-time chat, and payment integration.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0%2B-green.svg)

---

## 🎯 Features

### Core Functionality
- **Event Management**: Create, edit, and manage events with details (date, time, location, type, description)
- **Guest Management**: Invite guests via email, track RSVPs and attendance
- **Budget Tracking**: Set budgets, add expenses by category, get alerts when approaching limits
- **Vendor Directory**: Search vendors by location, service type, and availability

### Vendor Management System (NEW!)
- **Advanced Search**: Filter vendors by location (proximity), price range, date availability, rating, and service type
- **Pricing Tiers**: Multiple package options (Basic/Standard/Premium) with detailed inclusions
- **Booking System**: Complete booking workflow with date selection, guest count, venue details
- **Payment Integration**: Razorpay checkout with signature verification and budget validation
- **Real-time Chat**: Socket.io-powered 1-to-1 messaging between users and vendors
- **Review System**: Verified reviews linked to completed bookings

### User Features
- **Authentication**: JWT-based login/register with email verification and password reset (OTP)
- **Role-based Access**: User, Vendor, and Admin roles with appropriate permissions
- **Dashboard**: Personalized view of events, bookings, and statistics
- **Profile Management**: Update user details and preferences

### Design & UX
- **Modern UI**: Golden theme with glassmorphism effects, smooth animations
- **Toast Notifications**: Real-time feedback using `react-hot-toast`
- **Responsive Design**: Mobile-friendly Bootstrap components
- **Mixed-media Carousel**: Image and video support with Swiper.js

---

## 📁 Project Structure

```
EventEmpire/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components (Navbar, PrivateRoute)
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── pages/              # Page components
│   │   │   ├── Home.js         # Landing page with hero, stats, carousel
│   │   │   ├── Login.js        # Authentication
│   │   │   ├── Register.js     # User registration
│   │   │   ├── UserDashboard.js # User events overview
│   │   │   ├── EventPage.js    # Event details (guests, budget)
│   │   │   ├── FindVendors.js  # Vendor search interface
│   │   │   ├── VendorBooking.js # Booking page with Razorpay
│   │   │   └── Messages.js     # Real-time chat
│   │   ├── utils/              # Helper functions (toastConfig)
│   │   ├── App.js              # Main app with routing
│   │   └── index.css           # Global styles
│   └── package.json
│
├── server/                     # Node.js/Express backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js             # User with totalBudget field
│   │   ├── Event.js            # Event details
│   │   ├── VendorProfile.js    # Enhanced vendor schema (GeoJSON, tiers)
│   │   ├── Booking.js          # Booking with payment tracking
│   │   ├── Budget.js           # Budget and expenses
│   │   └── Guest.js            # Guest list
│   ├── routes/                 # API endpoints
│   │   ├── authRoutes.js       # Login, register, password reset
│   │   ├── eventRoutes.js      # CRUD for events
│   │   ├── vendorRoutes.js     # Search (basic + advanced)
│   │   ├── bookingRoutes.js    # Create booking, verify payment
│   │   ├── budgetRoutes.js     # Budget management
│   │   └── statsRoutes.js      # Dashboard statistics
│   ├── services/               # Business logic
│   │   ├── authService.js      # Authentication logic
│   │   ├── vendorService.js    # Advanced search aggregation
│   │   ├── bookingService.js   # Booking workflow
│   │   ├── paymentService.js   # Razorpay integration
│   │   └── budgetService.js    # Expense tracking
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── budgetValidation.js # Spending limit checks
│   ├── utils/
│   │   └── sendEmail.js        # Nodemailer email sending
│   ├── seed.js                 # Populate database with 48 vendors
│   ├── server.js               # Express server + Socket.io
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── .gitignore                  # Exclude node_modules, .env, etc.
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** 5.0+ (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Gmail Account** (for email sending via App Password)
- **Razorpay Account** (optional, for payment testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EventEmpire.git
   cd EventEmpire
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   ```
   Edit `.env` and fill in your credentials:
   - **MONGO_URI**: Your MongoDB connection string
   - **JWT_SECRET**: A strong random string (e.g., `openssl rand -base64 32`)
   - **EMAIL_USER** / **EMAIL_PASS**: Gmail address and [App Password](https://support.google.com/accounts/answer/185833)
   - **RAZORPAY_KEY_ID** / **RAZORPAY_KEY_SECRET**: From [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)

5. **Seed the database** (optional, for test data)
   ```bash
   node seed.js
   ```
   This creates 48 vendors across 6 service types in 8 Indian cities.

### Running the Application

**Development Mode:**

1. Start the backend server:
   ```bash
   cd server
   node server
   # Server runs on http://localhost:5000
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd client
   npm start
   # React app opens at http://localhost:3000
   ```

**Access the app:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

**Test vendor credentials** (after seeding):
- Email: `vendor1@eventempire.com`
- Password: `vendor123`

---

## 🔌 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new user account |
| `/api/auth/login` | POST | Login and receive JWT token |
| `/api/auth/forgot-password` | POST | Send OTP to email |
| `/api/auth/reset-password` | POST | Reset password with OTP |

### Events
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/events` | GET | ✓ | Get user's events |
| `/api/events` | POST | ✓ | Create new event |
| `/api/events/:id` | GET | ✓ | Get event details |
| `/api/events/:id` | PUT | ✓ | Update event |
| `/api/events/:id` | DELETE | ✓ | Delete event |

### Vendors
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/vendors/search` | GET | - | Basic search (location, serviceType) |
| `/api/vendors/search/advanced` | GET | - | Advanced search (10+ filters, pagination) |
| `/api/vendors/profile` | POST | ✓ Vendor | Create/update vendor profile |

### Bookings & Payments
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/bookings/create` | POST | ✓ User | Create booking + Razorpay order |
| `/api/bookings/verify-payment` | POST | ✓ User | Verify Razorpay signature |
| `/api/bookings` | GET | ✓ | Get user's bookings |
| `/api/bookings/:id/vendor-progress` | PATCH | ✓ Vendor | Update service status |

### Budget
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/budget/:eventId` | GET | ✓ | Get event budget |
| `/api/budget/:eventId` | POST | ✓ | Set total budget |
| `/api/budget/:eventId/expense` | POST | ✓ | Add expense (triggers alerts) |

**For complete API documentation**, see [api_documentation.md](./docs/api_documentation.md)

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **UI Library**: React Bootstrap
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Carousel**: Swiper.js
- **Styling**: Custom CSS (Golden theme, Glassmorphism)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer (Gmail SMTP)
- **Payments**: Razorpay SDK
- **Real-time**: Socket.io
- **Security**: Helmet, CORS

---

## 📊 Database Schemas

### VendorProfile (Enhanced)
- **Location**: GeoJSON with coordinates for proximity search
- **Pricing Tiers**: Array of packages (Basic/Standard/Premium)
- **Availability Dates**: Calendar with booked/available/blocked status
- **Reviews**: Verified reviews with booking references

### Booking
- **Payment Status**: pending → due → paid → refunded
- **Vendor Progress**: not_started → in_progress → completed
- **Payment History**: Audit trail with Razorpay IDs and signatures

### User
- **Total Budget**: Track overall event spending across all bookings

---

## 🔒 Security Features

1. **Environment Variables**: Sensitive data in `.env` (excluded from git)
2. **JWT Authentication**: Secure token-based auth with expiration
3. **Password Hashing**: bcryptjs with salt rounds
4. **Payment Verification**: HMAC-SHA256 signature validation for Razorpay
5. **Input Validation**: Mongoose schema validation
6. **CORS Protection**: Configured allowed origins
7. **Helmet.js**: Security headers

---

## 📝 Deployment

### Backend (Heroku / Render)
1. Set environment variables in dashboard
2. Ensure `PORT` is dynamic: `process.env.PORT || 5000`
3. Build command: `npm install`
4. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Build command: `npm run build`
2. Publish directory: `build`
3. Set `REACT_APP_API_URL` to backend URL

### Database (MongoDB Atlas)
1. Create cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Whitelist deployment IP or use `0.0.0.0/0` (all IPs)
3. Update `MONGO_URI` in `.env`

---

## 🧪 Testing

**Manual Testing**:
1. Run seed script: `node server/seed.js`
2. Test search: `curl http://localhost:5000/api/vendors/search?serviceType=Photography`
3. Test authentication flow (register → login → verify email)
4. Test booking workflow (select vendor → fill form → Razorpay modal)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

**Code Style**:
- Use ES6+ syntax
- Follow existing naming conventions
- Add comments for complex logic
- Update README if adding new features

---

## 🐛 Troubleshooting

**Problem**: "Cannot GET /api/vendors/search"
- **Solution**: Ensure server is running on port 5000

**Problem**: Email not sending
- **Solution**: Generate Gmail App Password (not regular password)

**Problem**: Razorpay checkout not opening
- **Solution**: Check `RAZORPAY_KEY_ID` in `.env` and browser console for errors

**Problem**: Location search returns no results
- **Solution**: Ensure seed script ran successfully, restart server

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- React Bootstrap for UI components
- MongoDB for excellent database documentation
- Razorpay for payment gateway integration
- All contributors and testers

---

**⭐ If you find this project helpful, please give it a star!**
