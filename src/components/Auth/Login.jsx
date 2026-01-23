import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import loginBg from '../../assets/vtk2-loginbg.png';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <Card style={{ 
              borderRadius: '12px', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              border: 'none'
            }}>
              <Card.Body className="p-5">
                {/* Logo */}
                <div className="text-center mb-4">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'var(--viettel-red)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '24px'
                    }}>
                      VTK
                    </div>
                  </div>
                  <h4 style={{ color: '#333', fontWeight: '600', marginBottom: '8px' }}>
                    Hệ thống Quản lý Nhân sự
                  </h4>
                  
                </div>

                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', color: '#333' }}>
                      Tên đăng nhập
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập tên đăng nhập"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      autoFocus
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px',
                        borderRadius: '8px'
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '500', color: '#333' }}>
                      Mật khẩu
                    </Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      style={{ 
                        padding: '12px 16px',
                        fontSize: '14px',
                        borderRadius: '8px'
                      }}
                    />
                  </Form.Group>

                  <Button
                    variant="danger"
                    type="submit"
                    disabled={loading}
                    className="w-100 btn-viettel"
                    style={{
                      padding: '12px',
                      fontSize: '15px',
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </Button>
                </Form>

                {/* Demo accounts info */}
                
              </Card.Body>
            </Card>

           
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
