# 💰 Expense Tracker

A full-stack web application for tracking income and expenses with data visualization, user authentication, and Excel export functionality.

## 🌟 Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Dashboard Overview**: Visual representation of income and expense data
- **Income Management**: Add, view, and delete income entries
- **Expense Management**: Add, view, and delete expense entries
- **Data Visualization**: Interactive charts using Recharts library
- **Excel Export**: Download income and expense data as Excel files
- **Image Upload**: Support for uploading images with entries
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS v4** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Moment.js** - Date formatting
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Emoji Picker React** - Emoji selection

### Backend
- **Node.js** - Runtime environment
- **Express.js v5** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **XLSX** - Excel file generation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
Expense-Tracker/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   └── expense-tracker/
│       ├── src/
│       │   ├── pages/       # Page components
│       │   ├── components/  # Reusable components
│       │   ├── context/     # React Context
│       │   ├── utils/       # Helper functions
│       │   └── App.jsx
│       └── package.json
└── vercel.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shanidhya01/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd frontend/expense-tracker
   npm install
   ```

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `frontend/expense-tracker` directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

2. **Start Frontend Development Server**
   ```bash
   cd frontend/expense-tracker
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/getUser` - Get user info

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data

### Income
- `POST /api/v1/income/add` - Add income entry
- `GET /api/v1/income/get` - Get all incomes
- `DELETE /api/v1/income/:id` - Delete income
- `GET /api/v1/income/downloadexcel` - Download income Excel

### Expense
- `POST /api/v1/expense/add` - Add expense entry
- `GET /api/v1/expense/get` - Get all expenses
- `DELETE /api/v1/expense/:id` - Delete expense
- `GET /api/v1/expense/downloadexcel` - Download expense Excel

### Image
- `POST /api/v1/image/upload-image` - Upload image

## 📊 Features in Detail

### Dashboard
- Visual overview of total income and expenses
- Bar charts showing income over time
- Line charts showing expense trends
- Recent transactions list

### Income Page
- Add new income entries with source, amount, and date
- View all income records
- Delete individual entries
- Download income data as Excel

### Expense Page
- Add new expense entries with category, amount, and date
- View all expense records
- Delete individual entries
- Download expense data as Excel
- Upload receipt images

## 🎨 UI Components

- Modern card-based layout
- Custom styled buttons and inputs
- Interactive charts and graphs
- Toast notifications for user feedback
- Responsive sidebar navigation

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed using bcryptjs
3. JWT token is generated upon login
4. Token is stored in localStorage
5. Protected routes verify token on each request

## 📦 Build for Production

### Frontend
```bash
cd frontend/expense-tracker
npm run build
```

### Backend
The backend is ready for production deployment. Ensure environment variables are properly configured.

## 🚢 Deployment

The project includes a `vercel.json` configuration for easy deployment to Vercel.

```bash
# Deploy backend
vercel --prod

# Deploy frontend
cd frontend/expense-tracker
vercel --prod
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Shanidhya01**
- GitHub: [@Shanidhya01](https://github.com/Shanidhya01)

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first CSS framework
- Recharts for beautiful data visualizations

---

Made with ❤️ by Shanidhya01