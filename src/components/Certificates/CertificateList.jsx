import { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaFileDownload, FaFilter } from 'react-icons/fa';
import { getCertificates, getCertificatesByEmployee, getCertificatesByType, getExpiringCertificates, getExpiredCertificates, createCertificate, updateCertificate, deleteCertificate, getEmployees, getCertificateTypes } from '../../services/api';

function CertificateList() {
  const [certificates, setCertificates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    certificate_type_id: '',
    certificate_number: '',
    issued_by: '',
    issued_date: '',
    expiry_date: '',
    file: null,
    notes: ''
  });
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certsRes, empsRes, typesRes] = await Promise.all([
        filter === 'all' ? getCertificates() :
        filter === 'expiring' ? getExpiringCertificates() :
        filter === 'expired' ? getExpiredCertificates() :
        getCertificates({ status: filter }),
        getEmployees(),
        getCertificateTypes()
      ]);
      
      setCertificates(Array.isArray(certsRes.data) ? certsRes.data : certsRes.data.data || []);
      setEmployees(Array.isArray(empsRes.data) ? empsRes.data : empsRes.data.data || []);
      setCertificateTypes(Array.isArray(typesRes.data) ? typesRes.data : typesRes.data.data || []);
    } catch (err) {
      setError('Không thể tải dữ liệu: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (certificate = null) => {
    if (certificate) {
      setEditingCertificate(certificate);
      setFormData({
        employee_id: certificate.employee_id,
        certificate_type_id: certificate.certificate_type_id,
        certificate_number: certificate.certificate_number,
        issued_by: certificate.issued_by || '',
        issued_date: certificate.issued_date,
        expiry_date: certificate.expiry_date || '',
        file: null,
        notes: certificate.notes || ''
      });
    } else {
      setEditingCertificate(null);
      setFormData({
        employee_id: '',
        certificate_type_id: '',
        certificate_number: '',
        issued_by: '',
        issued_date: '',
        expiry_date: '',
        file: null,
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCertificate(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCertificate) {
        await updateCertificate(editingCertificate.id, formData);
      } else {
        await createCertificate(formData);
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      setError('Lỗi khi lưu chứng chỉ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa chứng chỉ này?')) {
      try {
        await deleteCertificate(id);
        fetchData();
      } catch (err) {
        setError('Lỗi khi xóa chứng chỉ: ' + err.message);
      }
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

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Quản lý Chứng chỉ</h5>
          <Button variant="danger" size="sm" onClick={() => handleShowModal()}>
            <FaPlus className="me-1" /> Thêm Chứng chỉ
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          
          {/* Filter Buttons */}
          <div className="mb-3">
            <Button 
              variant={filter === 'all' ? 'danger' : 'outline-secondary'} 
              size="sm" 
              className="me-2"
              onClick={() => setFilter('all')}
            >
              Tất cả
            </Button>
            <Button 
              variant={filter === 'Còn hạn' ? 'success' : 'outline-success'} 
              size="sm" 
              className="me-2"
              onClick={() => setFilter('Còn hạn')}
            >
              Còn hạn
            </Button>
            <Button 
              variant={filter === 'expiring' ? 'warning' : 'outline-warning'} 
              size="sm" 
              className="me-2"
              onClick={() => setFilter('expiring')}
            >
              Sắp hết hạn
            </Button>
            <Button 
              variant={filter === 'expired' ? 'danger' : 'outline-danger'} 
              size="sm"
              onClick={() => setFilter('expired')}
            >
              Hết hạn
            </Button>
          </div>

          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>STT</th>
                <th>Mã chứng chỉ</th>
                <th>Loại chứng chỉ</th>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Ngày cấp</th>
                <th>Ngày hết hạn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">Không có dữ liệu</td>
                </tr>
              ) : (
                certificates.map((cert, index) => (
                  <tr key={cert.id}>
                    <td>{index + 1}</td>
                    <td>{cert.certificate_number}</td>
                    <td>{cert.certificate_type?.name}</td>
                    <td>{cert.employee?.full_name}</td>
                    <td>{cert.employee?.department?.name}</td>
                    <td>{new Date(cert.issued_date).toLocaleDateString('vi-VN')}</td>
                    <td>{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString('vi-VN') : '-'}</td>
                    <td>{getStatusBadge(cert.status)}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleShowModal(cert)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(cert.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Add/Edit */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCertificate ? 'Sửa Chứng chỉ' : 'Thêm Chứng chỉ'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhân viên <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  >
                    <option value="">Chọn nhân viên</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.department?.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại chứng chỉ <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    required
                    value={formData.certificate_type_id}
                    onChange={(e) => setFormData({...formData, certificate_type_id: e.target.value})}
                  >
                    <option value="">Chọn loại chứng chỉ</option>
                    {certificateTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã chứng chỉ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={formData.certificate_number}
                    onChange={(e) => setFormData({...formData, certificate_number: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nơi cấp</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.issued_by}
                    onChange={(e) => setFormData({...formData, issued_by: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày cấp <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={formData.issued_date}
                    onChange={(e) => setFormData({...formData, issued_date: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày hết hạn</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>File chứng chỉ</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              />
              <Form.Text className="text-muted">
                Chấp nhận: PDF, JPG, PNG (Max: 5MB)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="danger" type="submit">
              {editingCertificate ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default CertificateList;
