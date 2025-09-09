# Healthcare Frontend - Mental Wellness Platform

A modern React-based web application that connects patients with licensed mental health therapists for personalized, confidential online consultations. Built with React, Vite, and Tailwind CSS.

## 🌟 Features

### For Patients
- **User Registration & Authentication** - Secure signup and login for patients
- **Therapist Discovery** - Search and filter therapists by specialization
- **Appointment Booking** - Easy appointment scheduling with available time slots
- **Payment Integration** - Secure payment processing with Cashfree payment gateway
- **Payment History** - View and filter payment transactions with modern UI
- **Appointment Hold System** - Secure slot reservation during payment process
- **Video Consultations** - Secure video calls using Twilio integration
- **Appointment Management** - View, filter, and cancel appointments
- **Profile Management** - Update personal information and preferences

### For Doctors/Therapists
- **Professional Registration** - Complete profile setup with credentials
- **Availability Management** - Set weekly availability schedules
- **Appointment Dashboard** - View and manage patient appointments
- **Video Call Integration** - Conduct secure online consultations
- **Patient Management** - Access patient information and appointment history

### Core Features
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Real-time Video Calls** - Powered by Twilio Video API
- **Secure Authentication** - JWT-based authentication with role-based access
- **Modern UI/UX** - Clean, intuitive interface with Tailwind CSS
- **Payment Integration** - Cashfree payment gateway with appointment hold system
- **Advanced Date Handling** - Centralized date-time utilities with IST formatting
- **Smooth Animations** - Framer Motion for enhanced user experience
- **Centralized Utilities** - Shared date-time formatting and common functions

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API server running on `http://localhost:8080`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HealthCare-FrontEnd/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 🏗️ Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── api/               # API service functions
│   │   └── api.js         # All API endpoints and HTTP requests
│   ├── components/        # React components
│   │   ├── auth/          # Authentication components
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── DoctorRegisterForm.jsx
│   │   │   └── PatientRegisterForm.jsx
│   │   ├── common/        # Shared components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AppointmentCard.jsx
│   │   │   ├── AppointmentsPanel.jsx
│   │   │   ├── VideoCall.jsx
│   │   │   └── VideoCallPreview.jsx
│   │   ├── doctor/        # Doctor-specific components
│   │   │   ├── DoctorDashboard.jsx
│   │   │   └── DoctorAvailabilityPage.jsx
│   │   ├── patient/       # Patient-specific components
│   │   │   ├── PatientDashboard.jsx
│   │   │   └── BookAppointment.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── FindTherapistPage.jsx
│   │   │   ├── DoctorProfileDashboard.jsx
│   │   │   ├── PatientProfileDashboard.jsx
│   │   │   ├── PatientPaymentsPage.jsx
│   │   │   ├── VideoCallPage.jsx
│   │   │   └── VideoCallPreviewPage.jsx
│   │   └── payment/       # Payment components
│   │       ├── cashfree.js
│   │       ├── PaymentStatus.jsx
│   │       ├── PaymentSuccess.jsx
│   │       ├── PaymentFailure.jsx
│   │       └── PaymentPending.jsx
│   ├── context/           # React Context providers
│   │   └── AuthContext.jsx # Authentication state management
│   ├── styles/            # CSS modules and styles
│   ├── utils/             # Utility functions
│   │   ├── mediaUtils.js  # Media handling utilities
│   │   └── dateTime.js    # Date-time formatting utilities
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── eslint.config.js       # ESLint configuration
```

## 🔧 Technology Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - React component library
- **Heroicons & React Icons** - Icon libraries

### API & Communication
- **Axios** - HTTP client for API requests
- **JWT Authentication** - Secure token-based authentication

### Video Calling
- **Twilio Video** - Real-time video communication
- **Twilio Video SDK** - Client-side video functionality

### Payment Processing
- **Cashfree Payment Gateway** - Secure payment processing with appointment hold system
- **Appointment Hold Management** - Secure slot reservation during payment

### Development Tools
- **ESLint** - Code linting and quality assurance
- **React Hooks ESLint Plugin** - Hooks-specific linting rules
- **Date-fns** - Modern date utility library
- **Framer Motion** - Animation library for React

## 🔌 API Integration

The application integrates with a backend API running on `http://localhost:8080`. Key API endpoints include:

### Authentication
- `POST /api/auth/doctor/register` - Doctor registration
- `POST /api/auth/patient/register` - Patient registration
- `POST /api/auth/doctor/login` - Doctor login
- `POST /api/auth/patient/login` - Patient login

### Appointments
- `POST /api/appointments/hold` - Create appointment hold (new)
- `GET /api/appointments/doctor/{id}` - Get doctor's appointments
- `GET /api/appointments/patient/{id}` - Get patient's appointments
- `DELETE /api/appointments/{id}` - Cancel appointment
- `GET /api/appointments/availability/{doctorId}` - Get available slots

### Availability Management
- `POST /api/availability/{doctorId}` - Set doctor availability
- `GET /api/availability/{doctorId}` - Get doctor availability

### Doctor Search
- `GET /api/doctor/search` - Search doctors by name/specialization
- `GET /api/doctor/filter` - Filter doctors by specialization

### Profiles
- `GET /api/doctor/profile` - Get doctor profile
- `PUT /api/doctor/profile` - Update doctor profile
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update patient profile

### Video Calls
- `POST /api/video-call/session/{appointmentId}` - Create video session
- `GET /api/video-call/session/{appointmentId}` - Get session info
- `GET /api/video-call/token/{appointmentId}` - Get Twilio access token
- `POST /api/video-call/end/{appointmentId}` - End video session

### Payment Processing
- `POST /api/payments/initiate` - Initiate payment with appointment hold
- `GET /api/payments/status/{orderId}` - Get payment status
- `GET /api/payments/payment-details/{patientId}` - Get patient payment history with filters

## 💳 Payment System

The application implements a secure payment flow using Cashfree payment gateway:

### Payment Flow
1. **Appointment Hold Creation** - Creates a temporary hold on the appointment slot
2. **Payment Initiation** - Initiates payment with Cashfree using the hold reference
3. **Payment Processing** - User completes payment on Cashfree's secure platform
4. **Status Verification** - Real-time payment status polling
5. **Appointment Confirmation** - Backend automatically confirms appointment upon successful payment

### Features
- **Secure Payment Gateway** - Cashfree integration with PCI compliance
- **Appointment Hold System** - Prevents double-booking during payment
- **Real-time Status Updates** - Live payment status monitoring
- **Automatic Confirmation** - Seamless appointment booking upon payment success
- **Payment History** - Modern UI for viewing and filtering payment transactions
- **Error Handling** - Graceful handling of payment failures and cancellations

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with role-based access control:

- **Patient Role** - Can book appointments, view their appointments, access payment history, join video calls
- **Doctor Role** - Can manage availability, view patient appointments, conduct video calls

Authentication state is managed through React Context and persisted in localStorage.

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern Interface** - Clean, professional design with smooth animations
- **Accessibility** - ARIA labels and semantic HTML
- **Loading States** - User-friendly loading indicators
- **Error Handling** - Graceful error messages and fallbacks
- **Smooth Animations** - Framer Motion powered transitions
- **Advanced Date Picker** - React DatePicker with custom filtering
- **Centralized Date Formatting** - IST timezone support with AM/PM format
- **Enhanced Payment UI** - Modern card-based design with filters and pagination

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_CASHFREE_APP_ID=your_cashfree_app_id
VITE_CASHFREE_ENVIRONMENT=TEST
```

## 📦 Dependencies

### Core Dependencies
- **React 19.1.0** - Latest React with concurrent features
- **Vite 6.3.5** - Modern build tool
- **Tailwind CSS 4.1.10** - Latest Tailwind with new features
- **Material-UI 7.2.0** - Latest MUI components

### Payment & Business Logic
- **@cashfreepayments/cashfree-js 1.0.5** - Cashfree payment gateway
- **date-fns 4.1.0** - Modern date utilities
- **react-datepicker 8.4.0** - Advanced date picker component

### UI & Animation
- **Framer Motion 12.23.12** - Animation library
- **Lucide React 0.539.0** - Icon library
- **React Icons 5.5.0** - Icon collection

### Video & Media
- **Twilio Video 2.32.0** - Video calling SDK

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common issues

## 🔄 Version History

- **v1.2.0** - Payment history and enhanced UI
  - Patient payment history page with modern card design
  - Centralized date-time utilities with IST formatting
  - Enhanced pagination with arrow icons and better UX
  - Payment filtering by status, mode, and amount range
  - Improved appointment card with shared date utilities
  - Updated project structure and documentation

- **v1.1.0** - Payment integration and appointment hold system
  - Cashfree payment gateway integration
  - Appointment hold system for secure booking
  - Enhanced date handling with date-fns
  - Smooth animations with Framer Motion
  - Updated API endpoints and error handling

- **v1.0.0** - Initial release with core features
  - Authentication system
  - Appointment booking and management
  - Video calling integration
  - Responsive design

---

**Built with ❤️ for better mental health care**
