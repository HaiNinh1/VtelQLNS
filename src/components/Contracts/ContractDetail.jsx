import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Tab, Row, Col, Badge, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaFileContract, FaList, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import { getContract } from '../../services/api';

function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchContractDetail();
  }, [id]);

  const fetchContractDetail = async () => {
    try {
      setLoading(true);
      const response = await getContract(id);
      setContract(response.data);
    } catch (err) {
      console.error('Error fetching contract:', err);
      setError('Không thể tải thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2">Đang tải...</p>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container-fluid mt-4">
        <Alert variant="danger">{error || 'Không tìm thấy hợp đồng'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/contracts')}>
          <FaArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>
    );
  }

  const InfoRow = ({ label, value, isLink = false }) => (
    <Row className="mb-2">
      <Col md={4} className="text-muted">{label}</Col>
      <Col md={8}>
        {isLink ? (
          <a href="#" className="text-primary text-decoration-none">{value || '-'}</a>
        ) : (
          <strong>{value || '-'}</strong>
        )}
      </Col>
    </Row>
  );

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/contracts')}>
            <FaArrowLeft />
          </Button>
          <h4 className="mb-0">Chi tiết hợp đồng đối tác</h4>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" size="sm">
            Hủy
          </Button>
          <Button variant="danger" size="sm">
            <FaEdit className="me-1" />
            Cập nhật
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            {/* Tab 1: Thông tin hợp đồng */}
            <Tab 
              eventKey="info" 
              title={
                <span className="text-danger fw-bold">
                  <FaFileContract className="me-2" />
                  Hợp đồng
                </span>
              }
            >
              <div className="p-3">
                <h6 className="text-danger mb-3">
                  <FaFileContract className="me-2" />
                  Thông tin chung
                </h6>
                
                <Row>
                  <Col md={6}>
                    <InfoRow label="Số HĐ" value={contract.contract_number} />
                    <InfoRow label="Tên dự án" value={contract.project_name} />
                    <InfoRow label="Ngày hiệu lực" value={contract.start_date ? new Date(contract.start_date).toLocaleDateString('vi-VN') : '-'} />
                    <InfoRow label="Giá trị" value={contract.contract_value ? new Intl.NumberFormat('vi-VN').format(contract.contract_value) : '-'} />
                    <InfoRow label="Đối tác" value={contract.investor} />
                    <InfoRow label="Ngày tạo" value={contract.created_at ? new Date(contract.created_at).toLocaleDateString('vi-VN') : '-'} />
                    <InfoRow label="Bộ phận" value={contract.department || '-'} />
                  </Col>
                  
                  <Col md={6}>
                    <InfoRow label="HBKD" value={contract.contract_number} isLink />
                    <InfoRow label="Ngành nghề" value={contract.industry} />
                    <InfoRow label="Ngày ký" value={contract.signing_date ? new Date(contract.signing_date).toLocaleDateString('vi-VN') : '-'} />
                    <InfoRow label="Thời gian hiệu lực (Ngày)" value={contract.duration_days} />
                    <InfoRow label="Ngày kết thúc" value={contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : '-'} />
                    <InfoRow label="Giá trị sau thuế" value={contract.adjusted_value ? new Intl.NumberFormat('vi-VN').format(contract.adjusted_value) : '-'} />
                    <InfoRow label="Địa chỉ" value={contract.address || '-'} />
                  </Col>
                </Row>

                <hr className="my-4" />

                <Row>
                  <Col md={6}>
                    <InfoRow label="Người đại diện" value={contract.representative || 'Mai Thanh Tùng'} />
                    <InfoRow label="Ngày tạo" value={contract.created_at ? new Date(contract.created_at).toLocaleDateString('vi-VN') : '-'} />
                    <InfoRow label="Chức danh" value={contract.representative_title || 'Giám đốc'} />
                  </Col>
                  
                  <Col md={6}>
                    <InfoRow label="STK" value={contract.bank_account || '0241004040088'} />
                    <InfoRow label="Ngân hàng" value={contract.bank_name || 'Ngân hàng TMCP An Bình - CN Hà Nội - PGD Lê Trọng Tấn'} />
                    <InfoRow label="Chủ tài khoản" value={contract.account_holder || 'VPNET'} />
                  </Col>
                </Row>

                <hr className="my-4" />

                <Row>
                  <Col md={12}>
                    <InfoRow label="Trạng thái" value={
                      <Badge bg={contract.contract_status === 'Đã duyệt' ? 'success' : 'warning'}>
                        {contract.contract_status || 'Đang xử lý'}
                      </Badge>
                    } />
                    <InfoRow label="Tình trạng" value={
                      <Badge bg={contract.condition_status === 'Đúng tiến độ' ? 'success' : 'danger'}>
                        {contract.condition_status || 'Đúng tiến độ'}
                      </Badge>
                    } />
                  </Col>
                </Row>
              </div>
            </Tab>

            {/* Tab 2: Danh sách trạm */}
            <Tab 
              eventKey="stations" 
              title={
                <span>
                  <FaList className="me-2" />
                  Danh sách trạm
                </span>
              }
            >
              <div className="p-3">
                <Alert variant="info">
                  Chức năng danh sách trạm đang được phát triển
                </Alert>
                <Table striped bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Mã trạm</th>
                      <th>Tên trạm</th>
                      <th>Địa chỉ</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Tab 3: Thanh toán */}
            <Tab 
              eventKey="payments" 
              title={
                <span>
                  <FaMoneyBillWave className="me-2" />
                  Thanh toán
                </span>
              }
            >
              <div className="p-3">
                <h6 className="mb-3">Thông tin thanh toán</h6>
                <Row>
                  <Col md={6}>
                    <InfoRow label="Tạm ứng" value={
                      <Badge bg={contract.advance_payment === 'Có' ? 'success' : 'secondary'}>
                        {contract.advance_payment || 'Không'}
                      </Badge>
                    } />
                    <InfoRow label="Giá trị hợp đồng" value={contract.contract_value ? new Intl.NumberFormat('vi-VN').format(contract.contract_value) + ' VNĐ' : '-'} />
                    <InfoRow label="VAT (%)" value={contract.vat_rate || '10%'} />
                  </Col>
                  <Col md={6}>
                    <InfoRow label="Giá trị sau thuế" value={contract.adjusted_value ? new Intl.NumberFormat('vi-VN').format(contract.adjusted_value) + ' VNĐ' : '-'} />
                    <InfoRow label="Chênh lệch" value={contract.value_difference ? new Intl.NumberFormat('vi-VN').format(contract.value_difference) + ' VNĐ' : '-'} />
                    <InfoRow label="Trạng thái phê duyệt" value={contract.approval_status || '-'} />
                  </Col>
                </Row>

                <hr className="my-4" />

                <Alert variant="info">
                  Lịch sử thanh toán đang được phát triển
                </Alert>
              </div>
            </Tab>

            {/* Tab 4: Lịch sử cập nhật */}
            <Tab 
              eventKey="history" 
              title={
                <span>
                  <FaHistory className="me-2" />
                  Lịch sử cập nhật
                </span>
              }
            >
              <div className="p-3">
                <Table striped bordered hover size="sm">
                  <thead className="table-light">
                    <tr>
                      <th>STT</th>
                      <th>Thời gian</th>
                      <th>Người thực hiện</th>
                      <th>Hành động</th>
                      <th>Nội dung</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>{contract.created_at ? new Date(contract.created_at).toLocaleString('vi-VN') : '-'}</td>
                      <td>{contract.created_by || 'Admin'}</td>
                      <td><Badge bg="success">Tạo mới</Badge></td>
                      <td>Tạo hợp đồng {contract.contract_number}</td>
                    </tr>
                    {contract.updated_at && contract.updated_at !== contract.created_at && (
                      <tr>
                        <td>2</td>
                        <td>{new Date(contract.updated_at).toLocaleString('vi-VN')}</td>
                        <td>{contract.updated_by || 'Admin'}</td>
                        <td><Badge bg="info">Cập nhật</Badge></td>
                        <td>Cập nhật thông tin hợp đồng</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ContractDetail;
