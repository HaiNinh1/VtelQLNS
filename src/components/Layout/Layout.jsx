import { useState } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaFileContract, FaProjectDiagram, FaCertificate, FaSearch, FaSignOutAlt, FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import sidebarBg from '../../assets/sidebar/sidebar-bg.png';
import footerLogo from '../../assets/footer/footer_sidebar.png';
import viettelTerm from '../../assets/footer/viettel-term.png';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F5F5', padding: '16px' }}>
      {/* Sidebar and Footer Column */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        marginRight: '16px',
        gap: '16px',
        height: 'calc(100vh - 32px)'
      }}>
        {/* Sidebar Container */}
        <div style={{ 
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          zIndex: 1000,
          flex: 1
        }}>
        <Sidebar
          collapsed={collapsed}
          width="280px"
          collapsedWidth="80px"
          backgroundColor="transparent"
          style={{
            height: '100%',
            position: 'relative',
            backgroundImage: `url(${sidebarBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden'
          }}
        >
          {/* Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 50%, rgba(255,182,193,0.3) 100%)',
            zIndex: 0
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo and User Info */}
            <div style={{ 
              padding: collapsed ? '12px' : '20px', 
              textAlign: 'center',
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: collapsed ? 'column' : 'row'
              }}>
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
                  marginRight: collapsed ? '0' : '10px',
                  marginBottom: collapsed ? '8px' : '0'
                }}>
                  VTK
                </div>
                {!collapsed && (
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
                      tech services
                    </div>
                  </div>
                )}
              </div>
              {user && !collapsed && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(224, 224, 224, 0.5)' }}>
                  <div style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>@{user.username}</div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <Menu
              menuItemStyles={{
                button: ({ active }) => ({
                  backgroundColor: active ? 'rgba(231, 29, 54, 0.1)' : 'transparent',
                  color: active ? 'var(--viettel-red)' : '#333',
                  borderLeft: collapsed ? 'none' : (active ? '4px solid var(--viettel-red)' : '4px solid transparent'),
                  padding: collapsed ? '12px' : '12px 20px',
                  margin: collapsed ? '4px 0' : '4px 0',
                  fontWeight: active ? '600' : '500',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  display: 'flex',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: 'rgba(231, 29, 54, 0.05)',
                    color: 'var(--viettel-red)',
                  },
                }),
              }}
              style={{ flex: 1, paddingTop: collapsed ? '8px' : '10px', paddingBottom: '80px' }}
            >
              <MenuItem 
                active={isActive('/contracts')}
                component={<Link to="/contracts" />}
                icon={<FaFileContract size={18} />}
              >
                {!collapsed && 'Hợp đồng kinh doanh'}
              </MenuItem>
              <MenuItem 
                active={isActive('/projects')}
                component={<Link to="/projects" />}
                icon={<FaProjectDiagram size={18} />}
              >
                {!collapsed && 'Hợp đồng đối tác'}
              </MenuItem>
              <MenuItem 
                active={isActive('/employees')}
                component={<Link to="/employees" />}
                icon={<FaUsers size={18} />}
              >
                {!collapsed && 'Chủ đầu tư/đối tác'}
              </MenuItem>
              <MenuItem 
                active={isActive('/certificates')}
                component={<Link to="/certificates" />}
                icon={<FaCertificate size={18} />}
              >
                {!collapsed && 'Thiết lập thông báo'}
              </MenuItem>
              <MenuItem 
                active={isActive('/certificates/search')}
                component={<Link to="/certificates/search" />}
                icon={<FaSearch size={18} />}
              >
                {!collapsed && 'Nhóm'}
              </MenuItem>
            </Menu>
          </div>
        </Sidebar>
        
        {/* Toggle Button - Positioned at bottom center of sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '40px',
            height: '40px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
            e.currentTarget.style.transform = 'translateX(-50%) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
          }}
        >
          {collapsed ? (
            <FaChevronRight size={16} color="#666" />
          ) : (
            <FaChevronLeft size={16} color="#666" />
          )}
        </button>
      </div>

      {/* Footer - Separate Container Below Sidebar */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '12px 16px',
        width: collapsed ? '80px' : '280px',
        transition: 'width 0.3s'
      }}>
        {collapsed ? (
          // Collapsed state - show only circular VTK logo
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
            fontSize: '14px',
            margin: '0 auto'
          }}>
            VTK
          </div>
        ) : (
          // Expanded state - show logo and copyright side by side
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <img 
              src={footerLogo} 
              alt="Viettel Tech Services" 
              style={{ 
                width: '80px',
                height: 'auto'
              }} 
            />
            <img 
              src={viettelTerm} 
              alt="Copyright 2024 Viettel VTK" 
              style={{ 
                width: '120px',
                height: 'auto'
              }} 
            />
          </div>
        )}
      </div>
    </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        background: 'white', 
        minHeight: 'calc(100vh - 32px)', 
        padding: '24px 32px',
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'auto'
      }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;
