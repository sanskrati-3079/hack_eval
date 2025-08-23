# 🚀 Hackathon Team Dashboard - MERN Stack

A comprehensive and modern team/participant dashboard for hackathon platforms built with the MERN stack (MongoDB, Express.js, React.js, Node.js), designed with GLA University's color scheme and featuring real-time updates, mentor availability, analytics, and team member contributions.

## 🎯 Features

### ✅ **Complete Dashboard Features**
- **Team Information Management**: Team details, members, roles, and contributions
- **Real-time Submissions**: File upload/download for all rounds (IST, Round 1, Round 2)
- **Mentor Availability System**: Schedule management, expertise matching, and team assignment
- **Advanced Analytics**: Comprehensive statistics and performance metrics
- **Enhanced Leaderboard**: Overall and category-wise rankings with real-time updates
- **Member Contributions**: Track individual contributions, hours, and project progress
- **Real-time Notifications**: Live updates for submissions, deadlines, and team activities
- **Responsive Design**: Optimized for all devices with modern UI/UX

### 🎨 **Design & UI**
- **GLA University Branding**: Dark green (#1B4332), light green (#B7E4C7), white background
- **Modern Interface**: Card-based layout with soft shadows and rounded corners
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Real-time Updates**: Socket.IO integration for live data synchronization
- **Mobile-First**: Fully responsive design for all screen sizes

## 🛠️ Technical Stack

### **Backend (Node.js/Express)**
- **Express.js**: RESTful API server
- **MongoDB/Mongoose**: Database and ODM
- **Socket.IO**: Real-time communication
- **Multer**: File upload handling
- **JWT**: Authentication (ready for implementation)
- **Helmet**: Security middleware
- **Rate Limiting**: API protection

### **Frontend (React.js)**
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Socket.IO Client**: Real-time updates
- **Axios**: HTTP client
- **Recharts**: Data visualization
- **React Icons**: Icon library
- **React Hot Toast**: Notifications
- **Framer Motion**: Animations

### **Database (MongoDB)**
- **Team Management**: Complete team data with member contributions
- **Mentor System**: Availability schedules and expertise tracking
- **Submissions**: File management and status tracking
- **Analytics**: Performance metrics and statistics
- **Real-time Data**: Live updates and notifications

## 📁 Project Structure

```
hackathon-dashboard/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env                      # Environment variables
├── models/                   # MongoDB schemas
│   ├── Team.js              # Team and member models
│   ├── Mentor.js            # Mentor and availability models
│   └── Analytics.js         # Analytics tracking
├── routes/                   # API endpoints
│   ├── teams.js             # Team management
│   ├── mentors.js           # Mentor system
│   ├── submissions.js       # File uploads
│   ├── leaderboard.js       # Rankings
│   ├── analytics.js         # Statistics
│   └── notifications.js     # Real-time notifications
├── client/                   # React frontend
│   ├── public/              # Static files
│   ├── src/                 # React source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── api/             # API utilities
│   │   └── styles/          # CSS files
│   └── package.json         # Frontend dependencies
└── uploads/                  # File storage
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-dashboard
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hackathon-dashboard
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the development servers**
   ```bash
   # Start backend server
   npm run server
   
   # In a new terminal, start frontend
   npm run client
   
   # Or run both simultaneously
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📊 Key Features Explained

### **1. Team Management**
- **Member Profiles**: Individual member information with roles and skills
- **Contribution Tracking**: Log hours and activities for each member
- **Project Progress**: Real-time progress calculation and visualization
- **Team Analytics**: Performance metrics and statistics

### **2. Mentor System**
- **Availability Scheduling**: Set availability for each day and time
- **Expertise Matching**: Automatic mentor assignment based on team category
- **Real-time Status**: Current availability status with live updates
- **Team Assignment**: Manage mentor-team relationships

### **3. Submissions Management**
- **Multi-round Support**: IST, Round 1, Round 2 submissions
- **File Upload**: Drag-and-drop file upload with progress tracking
- **Status Tracking**: Uploaded, reviewed, qualified, not-qualified
- **Download System**: Secure file download for team members

### **4. Analytics Dashboard**
- **Overall Statistics**: Total teams, participants, submissions
- **Category-wise Analysis**: Performance by project category
- **Mentor Analytics**: Availability, ratings, and session statistics
- **Real-time Metrics**: Live updates of all analytics

### **5. Leaderboard System**
- **Overall Rankings**: Complete hackathon standings
- **Category Rankings**: Filter by AI/ML, Web Dev, Mobile, etc.
- **Real-time Updates**: Live score updates and ranking changes
- **Performance Tracking**: Historical performance data

### **6. Real-time Features**
- **Live Updates**: Socket.IO integration for instant updates
- **Notifications**: Real-time alerts for submissions, deadlines, etc.
- **Team Activity**: Live tracking of team progress and contributions
- **Mentor Status**: Real-time availability updates

## 🎮 API Endpoints

### **Teams**
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `GET /api/teams/team/:teamId` - Get team by team ID
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `POST /api/teams/:id/contributions` - Add member contribution
- `GET /api/teams/:id/analytics` - Get team analytics

### **Mentors**
- `GET /api/mentors` - Get all mentors
- `GET /api/mentors/:id` - Get mentor by ID
- `GET /api/mentors/expertise/:expertise` - Get mentors by expertise
- `GET /api/mentors/available/current` - Get currently available mentors
- `POST /api/mentors` - Create new mentor
- `PUT /api/mentors/:id` - Update mentor
- `POST /api/mentors/:mentorId/assign-team/:teamId` - Assign mentor to team

### **Submissions**
- `GET /api/submissions/team/:teamId` - Get team submissions
- `POST /api/submissions/upload/:teamId/:round` - Upload files
- `GET /api/submissions/download/:teamId/:round/:filename` - Download file
- `PUT /api/submissions/status/:teamId/:round` - Update submission status

### **Leaderboard**
- `GET /api/leaderboard/overall` - Get overall rankings
- `GET /api/leaderboard/category/:category` - Get category rankings
- `GET /api/leaderboard/top-performers` - Get top performers
- `GET /api/leaderboard/stats` - Get leaderboard statistics

### **Analytics**
- `GET /api/analytics` - Get overall analytics
- `GET /api/analytics/category/:category` - Get category analytics
- `GET /api/analytics/mentors` - Get mentor analytics
- `GET /api/analytics/teams/performance` - Get team performance analytics

## 🔧 Customization

### **Adding New Features**
1. **New Submission Types**: Extend the submissions model and routes
2. **Additional Categories**: Update the category enums in models
3. **Custom Analytics**: Add new analytics endpoints and calculations
4. **Enhanced Notifications**: Extend the notification system

### **Styling Customization**
The dashboard uses CSS custom properties for easy theming:
```css
:root {
  --primary-green: #1B4332;    /* Main brand color */
  --light-green: #B7E4C7;      /* Accent color */
  --white: #ffffff;            /* Background */
  /* ... other colors */
}
```

## 🚀 Deployment

### **Backend Deployment (Heroku)**
1. Create Heroku app
2. Set environment variables
3. Deploy with `git push heroku main`

### **Frontend Deployment (Netlify/Vercel)**
1. Build the React app: `npm run build`
2. Deploy the `build` folder
3. Set environment variables for API URL

### **Database (MongoDB Atlas)**
1. Create MongoDB Atlas cluster
2. Update connection string in environment variables
3. Configure network access and security

## 📱 Mobile Responsiveness

The dashboard is fully responsive with:
- **Desktop**: Full-featured layout with sidebar navigation
- **Tablet**: Adjusted grid layouts and optimized spacing
- **Mobile**: Single-column layout with hamburger menu
- **Touch-friendly**: Optimized touch targets and gestures

## 🔒 Security Features

- **Input Validation**: Express-validator for all API endpoints
- **File Upload Security**: File type and size restrictions
- **Rate Limiting**: API protection against abuse
- **Helmet.js**: Security headers and protection
- **CORS Configuration**: Cross-origin resource sharing setup

## 🧪 Testing

### **Backend Testing**
```bash
# Run backend tests
npm test

# Test specific routes
npm run test:routes
```

### **Frontend Testing**
```bash
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is created for educational purposes and hackathon platforms.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for GLA University Hackathon Platform**

*This dashboard provides a complete solution for managing hackathon teams, mentors, submissions, and analytics with real-time updates and modern UI/UX design.* 