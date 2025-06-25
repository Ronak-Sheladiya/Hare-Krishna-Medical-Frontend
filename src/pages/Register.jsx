import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
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
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          address: {
            street: "",
            city: "",
            state: "",
            pincode: "",
          },
        }),
      });

      if (response.ok) {
        setShowOtpModal(true);
      } else {
        const data = await response.json();
        alert(data.message || "Registration failed.");
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
      alert("Enter valid 6-digit OTP");
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
        alert("OTP verification failed.");
      }
    } catch (error) {
      console.error("OTP error:", error);
      alert("OTP verification failed.");
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
      alert("Could not resend OTP. Try again.");
    }
  };

  return (
    <div className="fade-in">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Body>
                <h3 className="mb-4 text-center">Create Account</h3>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
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

                  <Form.Group className="mb-3">
                    <Form.Label>Mobile</Form.Label>
                    <Form.Control
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      isInvalid={!!errors.mobile}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.mobile}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
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

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          isInvalid={!!errors.gender}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.gender}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
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
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        isInvalid={!!errors.password}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
                      </Button>
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        isInvalid={!!errors.confirmPassword}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`} />
                      </Button>
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Check
                    className="mb-3"
                    type="checkbox"
                    name="terms"
                    label="I agree to the Terms and Privacy Policy"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    isInvalid={!!errors.terms}
                    feedback={errors.terms}
                  />

                  <Button type="submit" className="w-100" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  Already have an account? <Link to="/login">Login</Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* OTP Modal */}
      <Modal show={showOtpModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="text-center fs-4 letter-spacing-wide"
            />
          </Form.Group>
          <Button variant="link" onClick={resendOtp}>
            Resend OTP
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleOtpVerification} disabled={otp.length !== 6}>
            Verify Email
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center">
          <i className="bi bi-check-circle-fill text-success display-1 mb-3"></i>
          <h4>Registration Successful!</h4>
          <p>You will be redirected shortly.</p>
          <div className="spinner-border text-success" />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Register;
