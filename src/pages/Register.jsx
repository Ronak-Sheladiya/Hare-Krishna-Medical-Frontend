import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }
    if (!formData.age || formData.age < 18 || formData.age > 120) {
      newErrors.age = "Age must be between 18 and 120";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
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
      newErrors.terms = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { fullName, email, mobile, password } = formData;
      const response = await axios.post(`${backendUrl}/api/auth/register`, {
        fullName,
        email,
        mobile,
        password,
        address: {
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
      });
      if (response.status === 201) {
        setShowOtpModal(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        error?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      alert("Enter valid 6-digit OTP");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email: formData.email,
        otp,
      });

      if (response.status === 200) {
        const data = response.data;

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
        alert("OTP verification failed.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      alert("OTP verification failed.");
    }
  };

  const resendOtp = async () => {
    if (resendCooldown) return;
    try {
      const response = await axios.post(`${backendUrl}/api/auth/resend-otp`, {
        email: formData.email,
      });
      if (response.status === 200) {
        alert(`New OTP sent to ${formData.email}`);
        setResendCooldown(true);
        setTimeout(() => setResendCooldown(false), 30000);
      } else {
        alert("Failed to resend OTP.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Could not resend OTP. Try again.");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="p-4">
            <h2 className="text-center">Register</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  isInvalid={!!errors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Mobile</Form.Label>
                <Form.Control
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  isInvalid={!!errors.mobile}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.mobile}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  isInvalid={!!errors.gender}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.gender}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Age</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  isInvalid={!!errors.age}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.age}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  isInvalid={!!errors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group>
                <Form.Check
                  type="checkbox"
                  label="I agree to the terms & conditions"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  isInvalid={!!errors.terms}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.terms}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-grid mt-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </div>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* OTP Modal */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>OTP Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter 6-digit OTP</Form.Label>
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
          </Form.Group>
          <div className="d-flex justify-content-between mt-3">
            <Button variant="secondary" onClick={resendOtp} disabled={resendCooldown}>
              {resendCooldown ? "Wait..." : "Resend OTP"}
            </Button>
            <Button variant="primary" onClick={handleOtpVerification}>
              Verify
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Account Verified</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Your account has been successfully verified. Redirecting...</p>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Register;
