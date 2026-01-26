import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaFileExcel, FaPlus, FaSearch, FaCalendar, FaCopy } from 'react-icons/fa';
import { getContracts, exportContracts, importContracts } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ContractList() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    contractNumber: '',
    industry: '',
    projectName: '',
    startDateFrom: null,
    startDateTo: null,
    endDateFrom: null,
    endDateTo: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getContracts({ page });
      
      // Handle paginated response
      if (res.data.data && Array.isArray(res.data.data)) {
        setContracts(res.data.data);
        setPagination({
          current_page: res.data.current_page || 1,
          last_page: res.data.last_page || 1,
          per_page: res.data.per_page || 20,
          total: res.data.total || res.data.data.length
        });
      } else {
        setContracts(res.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await exportContracts();
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hop_dong_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setSuccess('Xuất file Excel thành công!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
      let errorMsg = 'Không thể xuất file Excel';
      
      if (err.response?.status === 401) {
        errorMsg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await importContracts(file);
      setSuccess('Import file Excel thành công!');
      setTimeout(() => setSuccess(null), 3000);
      fetchData(); // Reload data
    } catch (err) {
      console.error('Import error:', err);
      
      // Handle different error types
      let errorMsg = 'Không thể import file Excel';
      
      if (err.response?.status === 401) {
        errorMsg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (err.response?.data?.errors) {
        // Validation errors
        const errors = err.response.data.errors;
        if (Array.isArray(errors)) {
          errorMsg = `Lỗi import:\n${errors.map(e => `- Dòng ${e.row}: ${e.errors.join(', ')}`).join('\n')}`;
        } else {
          errorMsg = Object.values(errors).flat().join(', ');
        }
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      setTimeout(() => setError(null), 10000);
    } finally {
      setLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Đã sao chép!');
    setTimeout(() => setSuccess(null), 1500);
  };

  // Filter contracts based on search criteria
  const filteredContracts = contracts.filter(contract => {
    if (filters.contractNumber && !contract.contract_number?.toLowerCase().includes(filters.contractNumber.toLowerCase())) {
      return false;
    }
    if (filters.industry && !contract.industry?.toLowerCase().includes(filters.industry.toLowerCase())) {
      return false;
    }
    if (filters.projectName && !contract.project_name?.toLowerCase().includes(filters.projectName.toLowerCase())) {
      return false;
    }
    if (filters.startDateFrom && new Date(contract.start_date) < filters.startDateFrom) {
      return false;
    }
    if (filters.startDateTo && new Date(contract.start_date) > filters.startDateTo) {
      return false;
    }
    if (filters.endDateFrom && contract.end_date && new Date(contract.end_date) < filters.endDateFrom) {
      return false;
    }
    if (filters.endDateTo && contract.end_date && new Date(contract.end_date) > filters.endDateTo) {
      return false;
    }
    return true;
  });

  if (loading && contracts.length === 0) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="danger" />
        <p className="mt-2">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-danger fw-bold">Danh sách Hợp đồng</h2>
        <div className="d-flex gap-2">
          <Button 
            variant="danger" 
            onClick={handleExport}
            disabled={loading}
          >
            <FaFileExcel className="me-2" />
            Xuất file
          </Button>
          <label className="btn btn-success">
            <FaFileExcel className="me-2" />
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
          <Button 
            variant="danger"
            onClick={() => navigate('/contracts/new')}
          >
            <FaPlus className="me-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      {/* Search Filters */}
      <div className="bg-light p-3 rounded mb-3">
        <Row className="g-2">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold">Số hợp đồng</Form.Label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><FaSearch /></span>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={filters.contractNumber}
                  onChange={(e) => handleFilterChange('contractNumber', e.target.value)}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold">Ngành nghề</Form.Label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><FaSearch /></span>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold">Tên dự án</Form.Label>
              <div className="input-group input-group-sm">
                <span className="input-group-text"><FaSearch /></span>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={filters.projectName}
                  onChange={(e) => handleFilterChange('projectName', e.target.value)}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold">Ngày hiệu lực (Từ - Đến)</Form.Label>
              <div className="d-flex gap-1">
                <div className="input-group input-group-sm">
                  <span className="input-group-text"><FaCalendar /></span>
                  <DatePicker
                    selected={filters.startDateFrom}
                    onChange={(date) => handleFilterChange('startDateFrom', date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Từ ngày"
                    className="form-control form-control-sm"
                  />
                </div>
                <div className="input-group input-group-sm">
                  <span className="input-group-text"><FaCalendar /></span>
                  <DatePicker
                    selected={filters.startDateTo}
                    onChange={(date) => handleFilterChange('startDateTo', date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Đến ngày"
                    className="form-control form-control-sm"
                  />
                </div>
              </div>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Contracts Table with Fixed Height Container */}
      <div style={{ 
        height: 'calc(100vh - 350px)', 
        minHeight: '400px',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        overflow: 'auto',
        backgroundColor: '#fff'
      }}>
        <Table striped bordered hover className="align-middle mb-0" style={{ minWidth: '3000px' }}>
          <thead className="table-danger" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <tr>
              <th className="text-center" style={{ minWidth: '50px', position: 'sticky', left: 0, backgroundColor: '#f8d7da', zIndex: 101 }}>STT</th>
              <th style={{ minWidth: '120px', position: 'sticky', left: '50px', backgroundColor: '#f8d7da', zIndex: 101 }}>Phân loại</th>
              <th style={{ minWidth: '150px', position: 'sticky', left: '170px', backgroundColor: '#f8d7da', zIndex: 101 }}>Số hợp đồng</th>
              <th style={{ minWidth: '150px' }}>Ngành nghề</th>
              <th style={{ minWidth: '200px' }}>Tên dự án</th>
              <th style={{ minWidth: '120px' }}>Ngày ký</th>
              <th style={{ minWidth: '120px' }}>Ngày hiệu lực</th>
              <th style={{ minWidth: '120px' }}>Ngày kết thúc</th>
              <th style={{ minWidth: '120px' }}>Ngày gia hạn</th>
              <th style={{ minWidth: '100px' }}>Thời gian</th>
              <th style={{ minWidth: '250px' }}>Nội dung hợp</th>
              <th style={{ minWidth: '150px' }}>Giá trị hợp</th>
              <th style={{ minWidth: '150px' }}>Giá trị sau</th>
              <th style={{ minWidth: '120px' }}>Phê duyệt</th>
              <th style={{ minWidth: '120px' }}>Chênh lệch</th>
              <th style={{ minWidth: '150px' }}>Chủ đầu tư</th>
              <th style={{ minWidth: '120px' }}>Trạng thái</th>
              <th style={{ minWidth: '120px' }}>Tình trạng</th>
              <th style={{ minWidth: '150px' }}>Pháp nhân</th>
              <th style={{ minWidth: '100px' }}>Tạm ứng</th>
              <th style={{ minWidth: '200px' }}>Ghi chú</th>
              <th style={{ minWidth: '120px' }}>Số phụ lục</th>
              <th style={{ minWidth: '80px' }}>Số lần</th>
              <th style={{ minWidth: '100px' }}>Số lần gia</th>
              <th style={{ minWidth: '120px' }}>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan="25" className="text-center text-muted">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract, index) => (
                <tr key={contract.id}>
                  <td className="text-center" style={{ position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 9 }}>
                    {(pagination.current_page - 1) * pagination.per_page + index + 1}
                  </td>
                  <td style={{ position: 'sticky', left: '50px', backgroundColor: 'white', zIndex: 9 }}>{contract.classification || '-'}</td>
                  <td style={{ position: 'sticky', left: '170px', backgroundColor: 'white', zIndex: 9 }}>
                    <span className="text-primary fw-bold">{contract.contract_number}</span>
                  </td>
                  <td>{contract.industry || '-'}</td>
                  <td>{contract.project_name || '-'}</td>
                  <td>
                    {contract.signing_date ? (
                      <div className="d-flex align-items-center gap-1">
                        {new Date(contract.signing_date).toLocaleDateString('vi-VN')}
                        <FaCopy 
                          className="text-muted cursor-pointer" 
                          size={12}
                          onClick={() => copyToClipboard(new Date(contract.signing_date).toLocaleDateString('vi-VN'))}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {contract.start_date ? (
                      <div className="d-flex align-items-center gap-1">
                        {new Date(contract.start_date).toLocaleDateString('vi-VN')}
                        <FaCopy 
                          className="text-muted cursor-pointer" 
                          size={12}
                          onClick={() => copyToClipboard(new Date(contract.start_date).toLocaleDateString('vi-VN'))}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {contract.end_date ? (
                      <div className="d-flex align-items-center gap-1">
                        {new Date(contract.end_date).toLocaleDateString('vi-VN')}
                        <FaCopy 
                          className="text-muted cursor-pointer" 
                          size={12}
                          onClick={() => copyToClipboard(new Date(contract.end_date).toLocaleDateString('vi-VN'))}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {contract.extension_date ? (
                      <div className="d-flex align-items-center gap-1">
                        {new Date(contract.extension_date).toLocaleDateString('vi-VN')}
                        <FaCopy 
                          className="text-muted cursor-pointer" 
                          size={12}
                          onClick={() => copyToClipboard(new Date(contract.extension_date).toLocaleDateString('vi-VN'))}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ) : '-'}
                  </td>
                  <td className="text-center">{contract.duration_days ? `${contract.duration_days} ngày` : '-'}</td>
                  <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={contract.contract_content}>
                    {contract.contract_content || '-'}
                  </td>
                  <td className="text-end">
                    {contract.contract_value ? 
                      new Intl.NumberFormat('vi-VN').format(contract.contract_value) + ' VNĐ' 
                      : '-'}
                  </td>
                  <td className="text-end">
                    {contract.adjusted_value ? 
                      new Intl.NumberFormat('vi-VN').format(contract.adjusted_value) + ' VNĐ' 
                      : '-'}
                  </td>
                  <td>{contract.approval_status || '-'}</td>
                  <td className="text-end">
                    {contract.value_difference ? 
                      new Intl.NumberFormat('vi-VN').format(contract.value_difference) + ' VNĐ' 
                      : '-'}
                  </td>
                  <td>{contract.investor || '-'}</td>
                  <td>
                    <span className={`badge ${
                      contract.contract_status === 'Chờ tiếp nhận' ? 'bg-warning' :
                      contract.contract_status === 'Đã duyệt' ? 'bg-success' :
                      'bg-secondary'
                    }`}>
                      {contract.contract_status || contract.status || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      contract.condition_status === 'Đúng tiến độ' ? 'bg-success' :
                      contract.condition_status === 'Trễ tiến độ' ? 'bg-danger' :
                      'bg-secondary'
                    }`}>
                      {contract.condition_status || '-'}
                    </span>
                  </td>
                  <td>{contract.legal_entity || '-'}</td>
                  <td className="text-center">
                    <span className={`badge ${contract.advance_payment === 'Có' ? 'bg-success' : 'bg-secondary'}`}>
                      {contract.advance_payment || 'Không'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={contract.notes}>
                    {contract.notes || '-'}
                  </td>
                  <td>{contract.appendix_number || '-'}</td>
                  <td className="text-center">{contract.revision_count || 0}</td>
                  <td className="text-center">{contract.extension_count || 0}</td>
                  <td>
                    {contract.created_at ? (
                      <div className="d-flex align-items-center gap-1">
                        {new Date(contract.created_at).toLocaleDateString('vi-VN')}
                        <FaCopy 
                          className="text-muted cursor-pointer" 
                          size={12}
                          onClick={() => copyToClipboard(new Date(contract.created_at).toLocaleDateString('vi-VN'))}
                          style={{ cursor: 'pointer' }}
                        />
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">
          Hiển thị {contracts.length} / {pagination.total} hợp đồng
        </div>
        
        {pagination.last_page > 1 && (
          <nav>
            <ul className="pagination pagination-sm mb-0" style={{ gap: '4px' }}>
              {/* Previous Button */}
              <li className="page-item">
                <button 
                  className="page-link border-0 bg-transparent"
                  onClick={() => pagination.current_page > 1 && fetchData(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  style={{ 
                    color: pagination.current_page === 1 ? '#ccc' : '#666',
                    cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  &lt;
                </button>
              </li>
              
              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const current = pagination.current_page;
                const total = pagination.last_page;
                
                // Always show page 1
                pages.push(
                  <li key={1} className="page-item">
                    <button 
                      className="page-link"
                      onClick={() => fetchData(1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: current === 1 ? '#dc3545' : 'transparent',
                        color: current === 1 ? '#fff' : '#666',
                        fontWeight: current === 1 ? 'bold' : 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      1
                    </button>
                  </li>
                );
                
                // Show left ellipsis if current page is far from start
                if (current > 3) {
                  pages.push(
                    <li key="ellipsis-left" className="page-item">
                      <span className="page-link border-0 bg-transparent" style={{ color: '#666' }}>...</span>
                    </li>
                  );
                }
                
                // Show pages around current page
                let startPage = Math.max(2, current - 1);
                let endPage = Math.min(total - 1, current + 1);
                
                // Adjust if we're near the start
                if (current <= 3) {
                  endPage = Math.min(5, total - 1);
                }
                
                // Adjust if we're near the end
                if (current >= total - 2) {
                  startPage = Math.max(2, total - 4);
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <li key={i} className="page-item">
                      <button 
                        className="page-link"
                        onClick={() => fetchData(i)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: current === i ? '#dc3545' : 'transparent',
                          color: current === i ? '#fff' : '#666',
                          fontWeight: current === i ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        {i}
                      </button>
                    </li>
                  );
                }
                
                // Show right ellipsis if current page is far from end
                if (current < total - 2) {
                  pages.push(
                    <li key="ellipsis-right" className="page-item">
                      <span className="page-link border-0 bg-transparent" style={{ color: '#666' }}>...</span>
                    </li>
                  );
                }
                
                // Always show last page if there's more than 1 page
                if (total > 1) {
                  pages.push(
                    <li key={total} className="page-item">
                      <button 
                        className="page-link"
                        onClick={() => fetchData(total)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: current === total ? '#dc3545' : 'transparent',
                          color: current === total ? '#fff' : '#666',
                          fontWeight: current === total ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                      >
                        {total}
                      </button>
                    </li>
                  );
                }
                
                return pages;
              })()}
              
              {/* Next Button */}
              <li className="page-item">
                <button 
                  className="page-link border-0 bg-transparent"
                  onClick={() => pagination.current_page < pagination.last_page && fetchData(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  style={{ 
                    color: pagination.current_page === pagination.last_page ? '#ccc' : '#666',
                    cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer'
                  }}
                >
                  &gt;
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

export default ContractList;
