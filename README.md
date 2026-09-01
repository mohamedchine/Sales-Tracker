# Sales Tracker Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for tracking daily sales and transactions.

## Project Structure

```
shop-app/
├── server/
│   ├── models/
│   │   └── Sale.js          # MongoDB Sale schema
│   ├── routes/
│   │   └── sales.js         # REST API endpoints
│   ├── .env                 # Environment variables
│   ├── package.json
│   └── server.js            # Express server entry point
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── DateNavigator.jsx   # Date selection navigation
    │   │   ├── SaleCard.jsx        # Individual sale card
    │   │   ├── SalesList.jsx       # List of sales
    │   │   ├── SaleModal.jsx       # Add/Edit sale form modal
    │   │   └── Total.jsx           # Total sales display
    │   ├── api.js           # API service methods
    │   ├── App.jsx          # Main React component
    │   ├── main.jsx         # React entry point
    │   └── styles.css       # Global styling (plain CSS)
    ├── .env                 # Environment variables
    ├── index.html
    ├── package.json
    └── vite.config.js       # Vite configuration
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/sales-tracker
   PORT=5000
   ```

   Or if using MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sales-tracker
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## Running Both Frontend and Backend

### Terminal 1 - Backend:
```bash
cd server
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Features

- **Date Navigation**: Select any date to view sales for that specific day
- **Create Sales**: Add new sales with product name, price, and optional image URL
- **View Sales**: See all sales for the selected date with details
- **Edit Sales**: Modify existing sales
- **Delete Sales**: Remove sales (with confirmation)
- **Automatic Total**: Calculates total sales amount for the selected date
- **Responsive Design**: Works on desktop and mobile devices
- **Clean UI**: Modern, polished design with pure CSS styling

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales?date=YYYY-MM-DD` | Fetch sales for a specific date |
| POST | `/api/sales` | Create a new sale |
| PUT | `/api/sales/:id` | Update an existing sale |
| DELETE | `/api/sales/:id` | Delete a sale |
| GET | `/api/health` | Health check endpoint |

## Database Schema

### Sale Model

```javascript
{
  name: String (required),
  price: Number (required, min: 0),
  image: String (optional, null by default),
  createdAt: Date (default: current date/time),
  updatedAt: Date (timestamps)
}
```

## Technologies Used

- **Frontend**: React 18, Vite, Plain CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Other**: CORS, dotenv for environment variables

## Notes

- Date handling is timezone-aware; sales are queried based on the full day in UTC
- Image URLs are optional; if not provided or fails to load, a placeholder is shown
- The modal is reused for both creating and editing sales
- All forms include validation and error handling
- Deletion requires user confirmation
- The UI uses a clean, modern design with subtle shadows and smooth transitions
