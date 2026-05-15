import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { Provider } from "react-redux"
import './App.css';
import {Container, Row } from "reactstrap"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Welcome from "./components/Welcome"
import UserType from "./components/UserType"
import Register from "./components/Register"
import Login from "./components/Login"
import DriverRegister from "./components/Driver/DriverRegister"
import DriverDashboard from "./components/Driver/DriverDashboard"
import DriverForgotPw from "./components/Driver/DriverForgotPw"
import ForgotPw from "./components/ForgotPw"
import AboutUs from "./components/AboutUs"
import SearchTrips from "./components/SearchTrips"
import Chat from "./components/Chat"
import PaymentMethod from "./components/PaymentMethod"
import CardPayment from "./components/CardPayment"
import CashPayment from "./components/CashPayment"
import Feedback from "./components/Feedback"
import MyBookings from "./components/MyBookings"
import Notifications from "./components/Notifications"
import Home from "./components/Home"
import travelBuddyStore from "./store/travelBuddyStore"
import AdminDashboard from "./components/Admin/AdminDashboard";
import Booking from "./components/Booking"
import ResetPassword from "./components/ResetPassword"
import ChangePassword from "./components/ChangePassword"
import { LangProvider } from "./components/LangContext"
 
 
function AppContent() {
  return (
    <Container fluid>
      <Row>
        <Header />
      </Row>
 
      <Row className="p-3">
        <Routes>
          <Route path="/" element={<Welcome />} />
 
          <Route path="/user-type" element={<UserType />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotPassword" element={<ForgotPw />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
 
 
          <Route path="/driver-login" element={<Navigate to="/login" replace />} />
          <Route path="/driver-register" element={<DriverRegister />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/driver-forgot-password" element={<DriverForgotPw />} />
          <Route path="/driver-reset-password" element={<DriverForgotPw />} />
          <Route path="/admin-login" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<AdminDashboard />} />
 
          <Route path="/about" element={<AboutUs />} />
          <Route path="/search" element={<SearchTrips />} />
 
          <Route path="/chat" element={<Chat />} />
 
          <Route path="/booking" element={<Booking />} />
 
          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/card-payment" element={<CardPayment />} />
          <Route path="/cash-payment" element={<CashPayment />} />
 
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
 
 
        </Routes>
      </Row>
 
      <Row>
        <Footer />
      </Row>
    </Container>
  )
}
 
function App() {
  return (
    <Provider store={travelBuddyStore}>
      <LangProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LangProvider>
    </Provider>
  )
}
 
export default App
 
 