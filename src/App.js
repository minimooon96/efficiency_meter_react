import { Container, Row, Col } from "react-bootstrap";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Analysis from "./components/Analysis";
import Countdown from "./components/Countdown";

function App() {
  return (
    <Container fluid style={{ minHeight: "100vh" }}>
      <Row style={{ minHeight: "100%" }}>
        <Col style={{ border: "1px solid #ddd", padding: "20px", height: "100%" }}>
          <UserAuthContextProvider>
            <Routes>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/Analysis" element={<Analysis />} />
              <Route path="/Countdown" element={<Countdown />} />
            </Routes>
          </UserAuthContextProvider>
        </Col>
      </Row>
    </Container>
  );
}

export default App;