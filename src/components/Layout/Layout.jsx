import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaFileContract, FaProjectDiagram, FaCertificate, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col md={2} className="sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
          <div className="logo-container text-center">
            <div className="d-flex align-items-center justify-content-center">
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--viettel-red)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '18px',
                marginRight: '10px'
              }}>
                VTK
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ 
                  color: 'var(--viettel-red)', 
                  fontWeight: 'bold',
                  fontSize: '16px',
                  lineHeight: '1.2'
                }}>
                  viettel
                </div>
                <div style={{ 
                  color: '#666',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  VTK
                </div>
              </div>
            </div>
            {user && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E0E0E0' }}>
                <div style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: '#999' }}>@{user.username}</div>
              </div>
            )}
          </div>
          
          <Nav className="flex-column mt-3" style={{ flex: 1 }}>
            <Nav.Link 
              as={Link} 
              to="/contracts" 
              className={isActive('/contracts') ? 'active' : ''}
            >
              <FaFileContract className="me-2" />
              Hợp đồng
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/projects" 
              className={isActive('/projects') ? 'active' : ''}
            >
              <FaProjectDiagram className="me-2" />
              Dự án
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/employees" 
              className={isActive('/employees') ? 'active' : ''}
            >
              <FaUsers className="me-2" />
              Danh sách Nhân sự
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/certificates" 
              className={isActive('/certificates') ? 'active' : ''}
            >
              <FaCertificate className="me-2" />
              Quản lý Chứng chỉ
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/certificates/search" 
              className={isActive('/certificates/search') ? 'active' : ''}
            >
              <FaSearch className="me-2" />
              Tra cứu Thông tin
            </Nav.Link>
          </Nav>
          
          {/* Logout button at bottom */}
          <div style={{ padding: '20px 24px', marginTop: 'auto' }}>
            <Button 
              variant="outline-danger" 
              className="w-100"
              onClick={handleLogout}
              style={{ borderRadius: '8px', fontSize: '14px', padding: '10px' }}
            >
              <FaSignOutAlt className="me-2" />
              Đăng xuất
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} style={{ background: '#F5F5F5', minHeight: '100vh', padding: '24px 32px' }}>
          {children}
        </Col>
      </Row>
    </Container>
  );
}

export default Layout;
