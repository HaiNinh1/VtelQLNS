import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaCertificate, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEmployees, getDepartments, createEmployee, updateEmployee, deleteEmployee } from '../../services/api';

function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    employee_code: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empsRes, deptsRes] = await Promise.all([
        getEmployees(),
        getDepartments()
      ]);
      setEmployees(empsRes.data.data || empsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        full_name: employee.full_name,
        employee_code: employee.employee_code,
        email: employee.email,
        phone: employee.phone || '',
        department_id: employee.department_id,
        position: employee.position || '',
        status: employee.status
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        full_name: '',
        employee_code: '',
        email: '',
        phone: '',
        department_id: '',
        position: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        await deleteEmployee(id);
        fetchData();
      } catch (err) {
        alert('Lỗi khi xóa');
      }
    }
  };

  if (loading) return <div className="spinner-container"><Spinner animation="border" variant="danger" /></div>;

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Danh sách Nhân sự</h5>
          <Button variant="danger" size="sm" onClick={() => handleShowModal()}>
            <FaPlus className="me-1" /> Thêm Nhân viên
          </Button>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Mã NV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Phòng ban</th>
                <th>Chức vụ</th>
                <th>Số chứng chỉ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => (
                <tr key={emp.id}>
                  <td>{index + 1}</td>
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
                  <td>{emp.email}</td>
                  <td>{emp.department?.name}</td>
                  <td>{emp.position || '-'}</td>
                  <td>
                    <Badge bg="info">{emp.certificates?.length || 0}</Badge>
                  </td>
                  <td>
                    <Badge bg={emp.status === 'active' ? 'success' : 'secondary'}>
                      {emp.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm" 
                      className="me-1"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </Button>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleShowModal(emp)}>
                      <FaEdit />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(emp.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingEmployee ? 'Sửa Nhân viên' : 'Thêm Nhân viên'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã NV <span className="text-danger">*</span></Form.Label>
                  <Form.Control required value={formData.employee_code} onChange={(e) => setFormData({...formData, employee_code: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phòng ban <span className="text-danger">*</span></Form.Label>
                  <Form.Select required value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})}>
                    <option value="">Chọn phòng ban</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Chức vụ</Form.Label>
                  <Form.Control value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit">{editingEmployee ? 'Cập nhật' : 'Thêm mới'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default EmployeeList;
