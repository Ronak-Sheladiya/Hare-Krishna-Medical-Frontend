import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    gender: "",
    age: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile.replace(/\s+/g, ""))) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 120) {
      newErrors.age = "Age must be between 18 and 120";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password,
      )
    ) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.terms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          address: { street: "", city: "", state: "", pincode: "" },
        }),
      });

      if (response.ok) {
        setShowOtpModal(true);
        return;
      } else {
        const error = await response.json();
        alert(error.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        setShowOtpModal(false);
        setShowSuccessModal(true);

        setTimeout(() => {
          const newUser = {
            id: data.user?.id || Date.now(),
            fullName: formData.fullName,
            name: formData.fullName,
            email: formData.email,
            mobile: formData.mobile,
            gender: formData.gender,
            age: formData.age,
            role: 0,
            emailVerified: true,
            profileImage: null,
          };

          dispatch(loginSuccess({ user: newUser, rememberMe: false }));
          setShowSuccessModal(false);
          navigate("/user/dashboard");
        }, 2000);
      } else {
        alert("Invalid OTP or verification failed.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      alert("OTP verification failed. Please try again.");
    }
  };

  const resendOtp = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        alert(`New OTP sent to ${formData.email}`);
      } else {
        alert("Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Failed to resend OTP. Please try again later.");
    }
  };

  return (
    <div className="fade-in">
      {/* ... UI Components (unchanged) ... */}

      {/* OTP Modal */}
      <Modal show={showOtpModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <i className="bi bi-envelope-check display-1 text-medical-blue mb-3"></i>
            <h5>Verify Your Email</h5>
            <p className="text-muted">
              We've sent a 6-digit OTP to <strong>{formData.email}</strong>
            </p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="text-center fs-4 letter-spacing-wide"
            />
          </Form.Group>

          <div className="text-center">
            <Button
              variant="link"
              onClick={resendOtp}
              className="text-medical-red text-decoration-none"
            >
              Didn't receive OTP? Resend
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn-medical-primary w-100"
            onClick={handleOtpVerification}
            disabled={otp.length !== 6}
          >
            Verify Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
          <h4>Registration Successful!</h4>
          <p className="text-muted">
            Your account has been created successfully. You will be redirected
            to your dashboard.
          </p>
          <div className="spinner-border text-medical-red" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Register;
