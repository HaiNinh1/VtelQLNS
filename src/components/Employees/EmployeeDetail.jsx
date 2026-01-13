import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Table, Button, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaCertificate, FaProjectDiagram, FaFileContract, FaDownload } from 'react-icons/fa';
import { getEmployee } from '../../services/api';

function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await getEmployee(id);
      setEmployee(response.data);
    } catch (err) {
      setError('Không thể tải thông tin nhân viên: ' + err.message);
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

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  if (error || !employee) {
    return <Alert variant="danger">{error || 'Không tìm thấy nhân viên'}</Alert>;
  }

  return (
    <>
      <Button variant="outline-secondary" className="mb-3" onClick={() => navigate(-1)}>
        <FaArrowLeft className="me-2" />
        Quay lại
      </Button>

      {/* Thông tin Nhân sự */}
      <Card className="mb-4">
        <Card.Header className="bg-viettel text-white">
          <h5 className="mb-0">
            <FaUser className="me-2" />
            Thông tin Nhân sự
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td width="150"><strong>Họ tên:</strong></td>
                    <td>{employee.full_name}</td>
                  </tr>
                  <tr>
                    <td><strong>Mã nhân viên:</strong></td>
                    <td>{employee.employee_code}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{employee.email}</td>
                  </tr>
                  <tr>
                    <td><strong>Số điện thoại:</strong></td>
                    <td>{employee.phone || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col md={6}>
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td width="150"><strong>Phòng ban:</strong></td>
                    <td><Badge bg="info">{employee.department?.name}</Badge></td>
                  </tr>
                  <tr>
                    <td><strong>Chức vụ:</strong></td>
                    <td>{employee.position || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Trạng thái:</strong></td>
                    <td>
                      <Badge bg={employee.status === 'active' ? 'success' : 'secondary'}>
                        {employee.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Địa chỉ:</strong></td>
                    <td>{employee.address || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs: Chứng chỉ, Dự án, Hợp đồng */}
      <Card>
        <Card.Body>
          <Tabs defaultActiveKey="certificates" className="mb-3">
            {/* Tab Chứng chỉ */}
            <Tab 
              eventKey="certificates" 
              title={
                <>
                  <FaCertificate className="me-2" />
                  Quản lý Chứng chỉ ({employee.certificates?.length || 0})
                </>
              }
            >
              {employee.certificates && employee.certificates.length > 0 ? (
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
                      <th>File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.certificates.map((cert, index) => (
                      <tr key={cert.id}>
                        <td>{index + 1}</td>
                        <td>{cert.certificate_type?.name}</td>
                        <td>{cert.certificate_number}</td>
                        <td>{cert.issued_by || '-'}</td>
                        <td>{new Date(cert.issued_date).toLocaleDateString('vi-VN')}</td>
                        <td>{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('vi-VN') : '-'}</td>
                        <td>{getStatusBadge(cert.status)}</td>
                        <td>
                          {cert.file_path ? (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              href={`http://localhost:8000/storage/${cert.file_path}`}
                              target="_blank"
                            >
                              <FaDownload className="me-1" />
                              Tải xuống
                            </Button>
                          ) : (
                            <span className="text-muted">Không có file</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nhân viên này chưa có chứng chỉ nào</Alert>
              )}
            </Tab>

            {/* Tab Dự án */}
            <Tab 
              eventKey="projects" 
              title={
                <>
                  <FaProjectDiagram className="me-2" />
                  Dự án tham gia ({employee.projects?.length || 0})
                </>
              }
            >
              {employee.projects && employee.projects.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Mã dự án</th>
                      <th>Tên dự án</th>
                      <th>Khách hàng</th>
                      <th>Vai trò</th>
                      <th>Ngày tham gia</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.projects.map((project, index) => (
                      <tr key={project.id}>
                        <td>{index + 1}</td>
                        <td>{project.code}</td>
                        <td>{project.name}</td>
                        <td>{project.client || '-'}</td>
                        <td>{project.pivot?.role || '-'}</td>
                        <td>
                          {project.pivot?.joined_date 
                            ? new Date(project.pivot.joined_date).toLocaleDateString('vi-VN') 
                            : '-'}
                        </td>
                        <td>{getProjectStatusBadge(project.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nhân viên này chưa tham gia dự án nào</Alert>
              )}
            </Tab>

            {/* Tab Hợp đồng */}
            <Tab 
              eventKey="contracts" 
              title={
                <>
                  <FaFileContract className="me-2" />
                  Hợp đồng ({employee.contracts?.length || 0})
                </>
              }
            >
              {employee.contracts && employee.contracts.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Số hợp đồng</th>
                      <th>Loại hợp đồng</th>
                      <th>Ngày bắt đầu</th>
                      <th>Ngày kết thúc</th>
                      <th>Lương</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.contracts.map((contract, index) => (
                      <tr key={contract.id}>
                        <td>{index + 1}</td>
                        <td>{contract.contract_number}</td>
                        <td>{contract.contract_type}</td>
                        <td>{new Date(contract.start_date).toLocaleDateString('vi-VN')}</td>
                        <td>
                          {contract.end_date 
                            ? new Date(contract.end_date).toLocaleDateString('vi-VN') 
                            : '-'}
                        </td>
                        <td>
                          {contract.salary 
                            ? new Intl.NumberFormat('vi-VN').format(contract.salary) + ' VNĐ' 
                            : '-'}
                        </td>
                        <td>
                          <Badge bg={contract.status === 'active' ? 'success' : 'secondary'}>
                            {contract.status === 'active' ? 'Còn hiệu lực' : 'Hết hiệu lực'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nhân viên này chưa có hợp đồng nào</Alert>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </>
  );
}

export default EmployeeDetail;
