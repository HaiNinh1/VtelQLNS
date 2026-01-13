import { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table, Badge, Alert, Tabs, Tab } from 'react-bootstrap';
import { FaSearch, FaCertificate, FaUser, FaProjectDiagram } from 'react-icons/fa';
import { getCertificatesByEmployee, getCertificatesByType, getEmployees, getCertificateTypes, getProject } from '../../services/api';

function CertificateSearch() {
  const [activeTab, setActiveTab] = useState('certificate');
  
  // Certificate Search State
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [selectedCertType, setSelectedCertType] = useState('');
  const [certResults, setCertResults] = useState([]);
  
  // Employee Search State
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [empCertResults, setEmpCertResults] = useState([]);
  const [empProjectResults, setEmpProjectResults] = useState([]);
  
  // Project Search State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [projectResults, setProjectResults] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { getProjects } = await import('../../services/api');
      const [empsRes, typesRes, projRes] = await Promise.all([
        getEmployees(),
        getCertificateTypes(),
        getProjects()
      ]);
      setEmployees(Array.isArray(empsRes.data) ? empsRes.data : empsRes.data.data || []);
      setCertificateTypes(Array.isArray(typesRes.data) ? typesRes.data : typesRes.data.data || []);
      setProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data.data || []);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error('Fetch error:', err);
    }
  };

  // Search by Certificate Type
  const handleCertSearch = async () => {
    if (!selectedCertType) {
      setError('Vui lòng chọn loại chứng chỉ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getCertificatesByType(selectedCertType);
      setCertResults(response.data || []);
    } catch (err) {
      setError('Lỗi khi tra cứu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search by Employee
  const handleEmployeeSearch = async () => {
    if (!selectedEmployee) {
      setError('Vui lòng chọn nhân viên');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const certResponse = await getCertificatesByEmployee(selectedEmployee);
      setEmpCertResults(certResponse.data || []);
      
      // Get employee's projects
      const employee = employees.find(e => e.id === parseInt(selectedEmployee));
      if (employee && employee.projects) {
        setEmpProjectResults(employee.projects);
      } else {
        setEmpProjectResults([]);
      }
    } catch (err) {
      setError('Lỗi khi tra cứu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Search by Project
  const handleProjectSearch = async () => {
    if (!selectedProject) {
      setError('Vui lòng chọn dự án');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getProject(selectedProject);
      setProjectResults(response.data);
    } catch (err) {
      setError('Lỗi khi tra cứu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Còn hạn': 'success',
      'Sắp hết hạn': 'warning',
      'Hết hạn': 'danger'
    };
    return <Badge bg={badges[status] || 'secondary'}>{status}</Badge>;
  };

  const getProjectStatusBadge = (status) => {
    const badges = {
      'Đang thực hiện': 'primary',
      'Hoàn thành': 'success',
      'Tạm dừng': 'warning'
    };
    return <Badge bg={badges[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Tra cứu Thông tin</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          {/* Tab 1: Tra cứu theo Chứng chỉ */}
          <Tab eventKey="certificate" title={<><FaCertificate className="me-2" />Tra cứu Chứng chỉ</>}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-danger mb-3">Ai đã có chứng chỉ này?</h6>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Chọn loại chứng chỉ</Form.Label>
                      <Form.Select 
                        value={selectedCertType} 
                        onChange={(e) => {
                          setSelectedCertType(e.target.value);
                          setCertResults([]);
                        }}
                      >
                        <option value="">-- Chọn loại chứng chỉ --</option>
                        {certificateTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name} ({type.code})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      variant="danger" 
                      onClick={handleCertSearch}
                      disabled={loading}
                      className="w-100"
                    >
                      <FaSearch className="me-1" />
                      {loading ? 'Đang tìm...' : 'Tra cứu'}
                    </Button>
                  </Col>
                </Row>

                {certResults.length > 0 && (
                  <>
                    <Alert variant="info">
                      <strong>Kết quả:</strong> Có {certResults.length} nhân viên sở hữu chứng chỉ <strong>{certResults[0]?.certificate_type?.name}</strong>
                    </Alert>
                    <Table striped bordered hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>STT</th>
                          <th>Nhân viên</th>
                          <th>Phòng ban</th>
                          <th>Mã chứng chỉ</th>
                          <th>Ngày cấp</th>
                          <th>Ngày hết hạn</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certResults.map((cert, index) => (
                          <tr key={cert.id}>
                            <td>{index + 1}</td>
                            <td>{cert.employee?.full_name}</td>
                            <td>{cert.employee?.department?.name}</td>
                            <td>{cert.certificate_number}</td>
                            <td>{new Date(cert.issued_date).toLocaleDateString('vi-VN')}</td>
                            <td>{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('vi-VN') : '-'}</td>
                            <td>{getStatusBadge(cert.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
                {certResults.length === 0 && selectedCertType && !loading && (
                  <Alert variant="warning">Không có nhân viên nào sở hữu chứng chỉ này</Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* Tab 2: Tra cứu theo Nhân sự */}
          <Tab eventKey="employee" title={<><FaUser className="me-2" />Tra cứu Nhân sự</>}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-danger mb-3">Nhân sự này có chứng chỉ gì? Tham gia dự án nào?</h6>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Chọn nhân viên</Form.Label>
                      <Form.Select 
                        value={selectedEmployee} 
                        onChange={(e) => {
                          setSelectedEmployee(e.target.value);
                          setEmpCertResults([]);
                          setEmpProjectResults([]);
                        }}
                      >
                        <option value="">-- Chọn nhân viên --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name} - {emp.employee_code} ({emp.department?.name})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      variant="danger" 
                      onClick={handleEmployeeSearch}
                      disabled={loading}
                      className="w-100"
                    >
                      <FaSearch className="me-1" />
                      {loading ? 'Đang tìm...' : 'Tra cứu'}
                    </Button>
                  </Col>
                </Row>

                {selectedEmployee && !loading && (
                  <>
                    {/* Certificates Section */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2 mb-3">
                        <FaCertificate className="me-2 text-danger" />
                        Danh sách Chứng chỉ ({empCertResults.length})
                      </h6>
                      {empCertResults.length > 0 ? (
                        <Table striped bordered hover responsive>
                          <thead className="table-light">
                            <tr>
                              <th>STT</th>
                              <th>Loại chứng chỉ</th>
                              <th>Mã chứng chỉ</th>
                              <th>Nơi cấp</th>
                              <th>Ngày cấp</th>
                              <th>Ngày hết hạn</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {empCertResults.map((cert, index) => (
                              <tr key={cert.id}>
                                <td>{index + 1}</td>
                                <td>{cert.certificate_type?.name}</td>
                                <td>{cert.certificate_number}</td>
                                <td>{cert.issued_by || '-'}</td>
                                <td>{new Date(cert.issued_date).toLocaleDateString('vi-VN')}</td>
                                <td>{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('vi-VN') : '-'}</td>
                                <td>{getStatusBadge(cert.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">Nhân viên này chưa có chứng chỉ nào</Alert>
                      )}
                    </div>

                    {/* Projects Section */}
                    <div>
                      <h6 className="border-bottom pb-2 mb-3">
                        <FaProjectDiagram className="me-2 text-danger" />
                        Dự án tham gia ({empProjectResults.length})
                      </h6>
                      {empProjectResults.length > 0 ? (
                        <Table striped bordered hover responsive>
                          <thead className="table-light">
                            <tr>
                              <th>STT</th>
                              <th>Mã dự án</th>
                              <th>Tên dự án</th>
                              <th>Vai trò</th>
                              <th>Ngày tham gia</th>
                              <th>Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {empProjectResults.map((project, index) => (
                              <tr key={project.id}>
                                <td>{index + 1}</td>
                                <td>{project.code}</td>
                                <td>{project.name}</td>
                                <td>{project.pivot?.role || '-'}</td>
                                <td>{project.pivot?.joined_date ? new Date(project.pivot.joined_date).toLocaleDateString('vi-VN') : '-'}</td>
                                <td>{getProjectStatusBadge(project.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      ) : (
                        <Alert variant="info">Nhân viên này chưa tham gia dự án nào</Alert>
                      )}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* Tab 3: Tra cứu theo Dự án */}
          <Tab eventKey="project" title={<><FaProjectDiagram className="me-2" />Tra cứu Dự án</>}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="text-danger mb-3">Dự án này có những nhân sự nào?</h6>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Chọn dự án</Form.Label>
                      <Form.Select 
                        value={selectedProject} 
                        onChange={(e) => {
                          setSelectedProject(e.target.value);
                          setProjectResults(null);
                        }}
                      >
                        <option value="">-- Chọn dự án --</option>
                        {projects.map(proj => (
                          <option key={proj.id} value={proj.id}>
                            {proj.code} - {proj.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button 
                      variant="danger" 
                      onClick={handleProjectSearch}
                      disabled={loading}
                      className="w-100"
                    >
                      <FaSearch className="me-1" />
                      {loading ? 'Đang tìm...' : 'Tra cứu'}
                    </Button>
                  </Col>
                </Row>

                {projectResults && (
                  <>
                    <Alert variant="info">
                      <strong>Dự án:</strong> {projectResults.name} ({projectResults.code})<br/>
                      <strong>Khách hàng:</strong> {projectResults.client || '-'}<br/>
                      <strong>Trạng thái:</strong> {getProjectStatusBadge(projectResults.status)}
                    </Alert>
                    
                    <h6 className="border-bottom pb-2 mb-3">
                      Danh sách Nhân sự ({projectResults.employees?.length || 0})
                    </h6>
                    {projectResults.employees && projectResults.employees.length > 0 ? (
                      <Table striped bordered hover responsive>
                        <thead className="table-light">
                          <tr>
                            <th>STT</th>
                            <th>Mã NV</th>
                            <th>Họ tên</th>
                            <th>Phòng ban</th>
                            <th>Vai trò</th>
                            <th>Ngày tham gia</th>
                            <th>Số chứng chỉ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectResults.employees.map((emp, index) => (
                            <tr key={emp.id}>
                              <td>{index + 1}</td>
                              <td>{emp.employee_code}</td>
                              <td>{emp.full_name}</td>
                              <td>{emp.department?.name}</td>
                              <td>{emp.pivot?.role || '-'}</td>
                              <td>{emp.pivot?.joined_date ? new Date(emp.pivot.joined_date).toLocaleDateString('vi-VN') : '-'}</td>
                              <td><Badge bg="info">{emp.certificates?.length || 0}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="warning">Dự án này chưa có nhân sự nào</Alert>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  );
}

export default CertificateSearch;
