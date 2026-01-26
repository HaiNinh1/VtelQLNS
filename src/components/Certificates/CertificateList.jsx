import { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Collapse, Modal, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaUser, FaCalendar } from 'react-icons/fa';
import { getCertificateTypes, getCertificatesByType, createCertificateType, updateCertificateType, deleteCertificateType, createCertificate, updateCertificate, deleteCertificate, getEmployees } from '../../services/api';

function CertificateList() {
  const [certificateTypes, setCertificateTypes] = useState([]);
  const [expandedType, setExpandedType] = useState(null);
  const [certificatesByType, setCertificatesByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCerts, setLoadingCerts] = useState({});
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editingCert, setEditingCert] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  // Form data
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    description: '',
    validity_period: ''
  });
  
  const [certFormData, setCertFormData] = useState({
    employee_id: '',
    certificate_type_id: '',
    certificate_number: '',
    issued_by: '',
    issued_date: '',
    expiry_date: '',
    file: null,
    notes: ''
  });

  useEffect(() => {
    fetchCertificateTypes();
    fetchEmployees();
  }, []);

  const fetchCertificateTypes = async () => {
    try {
      setLoading(true);
      const response = await getCertificateTypes();
      setCertificateTypes(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError('Không thể tải danh sách loại chứng chỉ: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchCertificatesByTypeId = async (typeId) => {
    try {
      setLoadingCerts(prev => ({ ...prev, [typeId]: true }));
      const response = await getCertificatesByType(typeId);
      const certs = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCertificatesByType(prev => ({ ...prev, [typeId]: certs }));
    } catch (err) {
      setError('Không thể tải danh sách chứng chỉ: ' + err.message);
      console.error('Fetch certificates error:', err);
    } finally {
      setLoadingCerts(prev => ({ ...prev, [typeId]: false }));
    }
  };

  const handleTypeClick = async (typeId) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      if (!certificatesByType[typeId]) {
        await fetchCertificatesByTypeId(typeId);
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

  const getFilteredCertificates = (certificates) => {
    if (!certificates) return [];
    if (statusFilter === 'all') return certificates;
    return certificates.filter(cert => {
      if (statusFilter === 'expiring') return cert.status === 'Sắp hết hạn';
      return cert.status === statusFilter;
    });
  };

  const getCertificateStats = (typeId) => {
    const certs = certificatesByType[typeId] || [];
    return {
      total: certs.length,
      valid: certs.filter(c => c.status === 'Còn hạn').length,
      expiring: certs.filter(c => c.status === 'Sắp hết hạn').length,
      expired: certs.filter(c => c.status === 'Hết hạn').length
    };
  };

  // Certificate Type CRUD
  const handleShowTypeModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setTypeFormData({
        name: type.name,
        description: type.description || '',
        validity_period: type.validity_period || ''
      });
    } else {
      setEditingType(null);
      setTypeFormData({ name: '', description: '', validity_period: '' });
    }
    setShowTypeModal(true);
  };

  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await updateCertificateType(editingType.id, typeFormData);
      } else {
        await createCertificateType(typeFormData);
      }
      setShowTypeModal(false);
      fetchCertificateTypes();
    } catch (err) {
      setError('Lỗi khi lưu loại chứng chỉ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteType = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa loại chứng chỉ này?')) {
      try {
        await deleteCertificateType(id);
        fetchCertificateTypes();
      } catch (err) {
        setError('Lỗi khi xóa loại chứng chỉ: ' + err.message);
      }
    }
  };

  // Certificate CRUD
  const handleShowCertModal = (typeId, cert = null) => {
    setSelectedTypeId(typeId);
    if (cert) {
      setEditingCert(cert);
      setCertFormData({
        employee_id: cert.employee_id,
        certificate_type_id: cert.certificate_type_id,
        certificate_number: cert.certificate_number,
        issued_by: cert.issued_by || '',
        issued_date: cert.issued_date,
        expiry_date: cert.expiry_date || '',
        file: null,
        notes: cert.notes || ''
      });
    } else {
      setEditingCert(null);
      setCertFormData({
        employee_id: '',
        certificate_type_id: typeId,
        certificate_number: '',
        issued_by: '',
        issued_date: '',
        expiry_date: '',
        file: null,
        notes: ''
      });
    }
    setShowCertModal(true);
  };

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCert) {
        await updateCertificate(editingCert.id, certFormData);
      } else {
        await createCertificate(certFormData);
      }
      setShowCertModal(false);
      await fetchCertificatesByTypeId(selectedTypeId);
    } catch (err) {
      setError('Lỗi khi lưu chứng chỉ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCert = async (certId, typeId) => {
    if (window.confirm('Bạn có chắc muốn xóa chứng chỉ này?')) {
      try {
        await deleteCertificate(certId);
        await fetchCertificatesByTypeId(typeId);
      } catch (err) {
        setError('Lỗi khi xóa chứng chỉ: ' + err.message);
      }
    }
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
          <Button variant="danger" size="sm" onClick={() => handleShowTypeModal()}>
            <FaPlus className="me-1" /> Thêm Loại Chứng chỉ
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
          
          {/* Status Filter */}
          <div className="mb-3">
            <Button 
              variant={statusFilter === 'all' ? 'danger' : 'outline-secondary'} 
              size="sm" 
              className="me-2"
              onClick={() => setStatusFilter('all')}
            >
              Tất cả
            </Button>
            <Button 
              variant={statusFilter === 'Còn hạn' ? 'success' : 'outline-success'} 
              size="sm" 
              className="me-2"
              onClick={() => setStatusFilter('Còn hạn')}
            >
              Còn hạn
            </Button>
            <Button 
              variant={statusFilter === 'expiring' ? 'warning' : 'outline-warning'} 
              size="sm" 
              className="me-2"
              onClick={() => setStatusFilter('expiring')}
            >
              Sắp hết hạn
            </Button>
            <Button 
              variant={statusFilter === 'Hết hạn' ? 'danger' : 'outline-danger'} 
              size="sm"
              onClick={() => setStatusFilter('Hết hạn')}
            >
              Hết hạn
            </Button>
          </div>

          {/* Certificate Types Table */}
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th style={{ width: '50px' }}>STT</th>
                <th>Loại Chứng chỉ</th>
                <th>Mô tả</th>
                <th style={{ width: '120px' }}>Thời hạn</th>
                <th style={{ width: '300px' }}>Thống kê</th>
                <th style={{ width: '150px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {certificateTypes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">Chưa có loại chứng chỉ nào</td>
                </tr>
              ) : (
                certificateTypes.map((type, index) => {
                  const stats = getCertificateStats(type.id);
                  const isExpanded = expandedType === type.id;
                  const filteredCerts = getFilteredCertificates(certificatesByType[type.id]);

                  return (
                    <>
                      <tr 
                        key={type.id}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: isExpanded ? '#fff5f5' : 'transparent'
                        }}
                      >
                        <td onClick={() => handleTypeClick(type.id)}>{index + 1}</td>
                        <td onClick={() => handleTypeClick(type.id)}>
                          <strong style={{ color: 'var(--viettel-red)' }}>
                            {isExpanded ? <FaChevronUp className="me-2" /> : <FaChevronDown className="me-2" />}
                            {type.name}
                          </strong>
                        </td>
                        <td onClick={() => handleTypeClick(type.id)}>
                          <small className="text-muted">{type.description || '-'}</small>
                        </td>
                        <td onClick={() => handleTypeClick(type.id)}>
                          {type.validity_period ? `${type.validity_period} tháng` : '-'}
                        </td>
                        <td onClick={() => handleTypeClick(type.id)}>
                          <div className="d-flex gap-2 flex-wrap">
                            <Badge bg="primary">{stats.total} tổng</Badge>
                            <Badge bg="success">{stats.valid} còn hạn</Badge>
                            <Badge bg="warning">{stats.expiring} sắp hết</Badge>
                            <Badge bg="danger">{stats.expired} hết hạn</Badge>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleShowCertModal(type.id)}
                              title="Thêm chứng chỉ"
                            >
                              <FaPlus />
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleShowTypeModal(type)}
                              title="Sửa loại chứng chỉ"
                            >
                              <FaEdit />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteType(type.id)}
                              title="Xóa loại chứng chỉ"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row - Employee Certificates */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" style={{ padding: 0, backgroundColor: '#f8f9fa' }}>
                            <Collapse in={isExpanded}>
                              <div style={{ padding: '15px' }}>
                                {loadingCerts[type.id] ? (
                                  <div className="text-center py-3">
                                    <Spinner animation="border" size="sm" variant="danger" />
                                  </div>
                                ) : filteredCerts.length === 0 ? (
                                  <Alert variant="info" className="mb-0">
                                    {statusFilter === 'all' 
                                      ? 'Chưa có nhân viên nào có chứng chỉ này' 
                                      : `Không có chứng chỉ ${statusFilter === 'expiring' ? 'sắp hết hạn' : statusFilter.toLowerCase()}`}
                                  </Alert>
                                ) : (
                                  <Table size="sm" bordered hover className="mb-0">
                                    <thead style={{ backgroundColor: '#fff' }}>
                                      <tr>
                                        <th style={{ width: '50px' }}>STT</th>
                                        <th>Nhân viên</th>
                                        <th>Phòng ban</th>
                                        <th>Số chứng chỉ</th>
                                        <th>Nơi cấp</th>
                                        <th>Ngày cấp</th>
                                        <th>Ngày hết hạn</th>
                                        <th>Trạng thái</th>
                                        <th style={{ width: '100px' }}>Thao tác</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredCerts.map((cert, idx) => (
                                        <tr key={cert.id}>
                                          <td>{idx + 1}</td>
                                          <td>
                                            <FaUser className="me-1" style={{ fontSize: '12px', color: '#666' }} />
                                            {cert.employee?.full_name}
                                          </td>
                                          <td>{cert.employee?.department?.name || '-'}</td>
                                          <td>{cert.certificate_number}</td>
                                          <td>{cert.issued_by || '-'}</td>
                                          <td>
                                            <FaCalendar className="me-1" style={{ fontSize: '11px', color: '#666' }} />
                                            {new Date(cert.issued_date).toLocaleDateString('vi-VN')}
                                          </td>
                                          <td>
                                            {cert.expiry_date ? (
                                              <>
                                                <FaCalendar className="me-1" style={{ fontSize: '11px', color: '#666' }} />
                                                {new Date(cert.expiry_date).toLocaleDateString('vi-VN')}
                                              </>
                                            ) : '-'}
                                          </td>
                                          <td>{getStatusBadge(cert.status)}</td>
                                          <td>
                                            <div className="d-flex gap-1">
                                              <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => handleShowCertModal(type.id, cert)}
                                              >
                                                <FaEdit />
                                              </Button>
                                              <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => handleDeleteCert(cert.id, type.id)}
                                              >
                                                <FaTrash />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                )}
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Certificate Type Modal */}
      <Modal show={showTypeModal} onHide={() => setShowTypeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingType ? 'Sửa Loại Chứng chỉ' : 'Thêm Loại Chứng chỉ'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleTypeSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên loại chứng chỉ <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                required
                value={typeFormData.name}
                onChange={(e) => setTypeFormData({...typeFormData, name: e.target.value})}
                placeholder="Ví dụ: PMP, AWS, CCNA..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={typeFormData.description}
                onChange={(e) => setTypeFormData({...typeFormData, description: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thời hạn (tháng)</Form.Label>
              <Form.Control
                type="number"
                value={typeFormData.validity_period}
                onChange={(e) => setTypeFormData({...typeFormData, validity_period: e.target.value})}
                placeholder="Ví dụ: 24, 36..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTypeModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit">
              {editingType ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Certificate Modal */}
      <Modal show={showCertModal} onHide={() => setShowCertModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCert ? 'Sửa Chứng chỉ' : 'Thêm Chứng chỉ'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCertSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhân viên <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    required
                    value={certFormData.employee_id}
                    onChange={(e) => setCertFormData({...certFormData, employee_id: e.target.value})}
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
                  <Form.Label>Mã chứng chỉ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    required
                    value={certFormData.certificate_number}
                    onChange={(e) => setCertFormData({...certFormData, certificate_number: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nơi cấp</Form.Label>
                  <Form.Control
                    type="text"
                    value={certFormData.issued_by}
                    onChange={(e) => setCertFormData({...certFormData, issued_by: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày cấp <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    required
                    value={certFormData.issued_date}
                    onChange={(e) => setCertFormData({...certFormData, issued_date: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày hết hạn</Form.Label>
                  <Form.Control
                    type="date"
                    value={certFormData.expiry_date}
                    onChange={(e) => setCertFormData({...certFormData, expiry_date: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>File chứng chỉ</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setCertFormData({...certFormData, file: e.target.files[0]})}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={certFormData.notes}
                onChange={(e) => setCertFormData({...certFormData, notes: e.target.value})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCertModal(false)}>Hủy</Button>
            <Button variant="danger" type="submit">
              {editingCert ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default CertificateList;
