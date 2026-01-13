import { useState, useEffect } from 'react';
import { Card, Table, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../services/api';

function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Đang thực hiện': 'primary',
      'Hoàn thành': 'success',
      'Tạm dừng': 'warning'
    };
    return <Badge bg={badges[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <div className="spinner-container"><Spinner animation="border" variant="danger" /></div>;

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Danh sách Dự án</h5>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>STT</th>
              <th>Mã dự án</th>
              <th>Tên dự án</th>
              <th>Khách hàng</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Số nhân sự</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <>
                <tr 
                  key={project.id}
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{index + 1}</td>
                  <td>{project.code}</td>
                  <td>{project.name}</td>
                  <td>{project.client || '-'}</td>
                  <td>{new Date(project.start_date).toLocaleDateString('vi-VN')}</td>
                  <td>{project.end_date ? new Date(project.end_date).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>
                    <Badge bg="info" style={{ cursor: 'pointer' }}>
                      {project.employees?.length || 0} nhân sự
                    </Badge>
                  </td>
                  <td>{getStatusBadge(project.status)}</td>
                </tr>
                {expandedProject === project.id && project.employees && project.employees.length > 0 && (
                  <tr>
                    <td colSpan="8" className="bg-light">
                      <div className="p-3">
                        <h6 className="mb-3">Danh sách Nhân sự trong dự án:</h6>
                        <Table size="sm" bordered>
                          <thead>
                            <tr>
                              <th>STT</th>
                              <th>Mã NV</th>
                              <th>Họ tên</th>
                              <th>Phòng ban</th>
                              <th>Vai trò</th>
                              <th>Ngày tham gia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.employees.map((emp, empIndex) => (
                              <tr key={emp.id}>
                                <td>{empIndex + 1}</td>
                                <td>{emp.employee_code}</td>
                                <td>
                                  <a 
                                    href="#" 
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(`/employees/${emp.id}`);
                                    }}
                                    className="text-decoration-none text-danger fw-bold"
                                  >
                                    {emp.full_name}
                                  </a>
                                </td>
                                <td>{emp.department?.name}</td>
                                <td>{emp.pivot?.role || '-'}</td>
                                <td>
                                  {emp.pivot?.joined_date 
                                    ? new Date(emp.pivot.joined_date).toLocaleDateString('vi-VN') 
                                    : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </Table>
        <small className="text-muted">💡 Click vào dòng dự án để xem danh sách nhân sự</small>
      </Card.Body>
    </Card>
  );
}

export default ProjectList;
