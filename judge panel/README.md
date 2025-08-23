# Judge Evaluation Portal - GLA University

A modern, professional web application for evaluating hackathon submissions at GLA University. Built with React and designed with GLA University's brand colors.

## Features

### 🎯 Core Functionality
- **Dashboard Home**: Overview of evaluation statistics and recent activities
- **Evaluate Submissions**: Comprehensive evaluation form with 7 judging parameters
- **My Evaluations**: Review and manage completed evaluations
- **Final Submission List**: View all approved submissions for the final round

### 🎨 Design Features
- **GLA University Branding**: Uses official brand colors (Dark Green #1B4332, Light Green #B7E4C7)
- **Modern UI**: Clean, professional interface with card-based layouts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: High contrast colors and keyboard navigation support

### 📊 Evaluation System
- **7 Judging Parameters**: Innovation, Problem Relevance, Feasibility, Tech Stack Justification, Clarity of Solution, Presentation Quality, Team Understanding
- **Slider-based Scoring**: 1-10 scale with visual feedback
- **Quality Metrics**: Uniqueness and plagiarism scores with progress bars
- **Final Recommendations**: Proceed to Next Round, Needs Improvement, or Rejected
- **Personalized Feedback**: Text area for detailed judge comments

### 🔍 Project Information Display
- **Team Metadata**: Team name, ID, submission date, category
- **Problem Statement**: Clear project description
- **Tech Stack**: Color-coded technology tags
- **AI-Generated Abstract**: Automated project summary
- **Presentation Links**: Direct access to PPT files
- **Quality Scores**: Visual indicators for uniqueness and plagiarism

## Technology Stack

- **Frontend**: React 18.2.0
- **Routing**: React Router DOM 6.3.0
- **Icons**: Lucide React 0.263.1
- **Styling**: CSS3 with CSS Custom Properties
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd judge-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js              # Dashboard overview page
│   ├── Dashboard.css
│   ├── EvaluateSubmission.js     # Main evaluation form
│   ├── EvaluateSubmission.css
│   ├── MyEvaluations.js          # Completed evaluations list
│   ├── MyEvaluations.css
│   ├── FinalSubmissionList.js    # Approved submissions list
│   ├── FinalSubmissionList.css
│   ├── Sidebar.js                # Navigation sidebar
│   └── Sidebar.css
├── App.js                        # Main app component
├── App.css                       # App-specific styles
├── index.js                      # Entry point
└── index.css                     # Global styles
```

## Usage Guide

### For Judges

1. **Dashboard**: Start here to see your evaluation overview and quick actions
2. **Evaluate Submissions**: 
   - Review project metadata and quality metrics
   - Use sliders to score each parameter (1-10)
   - Select final recommendation
   - Provide detailed feedback
   - Submit evaluation
3. **My Evaluations**: Search and filter your completed evaluations
4. **Final Submissions**: View all approved submissions for the final round

### Evaluation Process

1. **Review Project Information**: Read the problem statement, tech stack, and abstract
2. **Check Quality Metrics**: Review uniqueness and plagiarism scores
3. **Score Parameters**: Use sliders to rate each of the 7 judging criteria
4. **Make Recommendation**: Choose from three options based on overall assessment
5. **Provide Feedback**: Write detailed comments for the team
6. **Submit**: Save and submit the evaluation

## Design System

### Color Palette
- **Primary Green**: #1B4332 (Dark Green)
- **Light Green**: #B7E4C7 (Highlights)
- **White**: #FFFFFF (Background)
- **Gray Scale**: 50-900 for text and borders

### Typography
- **Font Family**: Inter (Sans-serif)
- **Weights**: 300, 400, 500, 600, 700
- **Sizes**: 0.75rem to 2rem

### Components
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Primary (green) and Secondary (outline) variants
- **Badges**: Status indicators with color coding
- **Progress Bars**: Visual metrics with gradient fills
- **Sliders**: Custom-styled range inputs for scoring

## Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar layout with detailed information
- **Tablet**: Adjusted grid layouts and spacing
- **Mobile**: Stacked layouts with touch-friendly interactions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for GLA University's hackathon evaluation system.

## Support

For technical support or questions about the evaluation portal, please contact the development team.

---

**Built with ❤️ for GLA University** 