import { useState, useEffect } from 'react';
import { Card, Table, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getContracts } from '../../services/api';

function ContractList() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getContracts();
      setContracts(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner-container"><Spinner animation="border" variant="danger" /></div>;

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Danh sách Hợp đồng</h5>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>STT</th>
              <th>Số hợp đồng</th>
              <th>Nhân viên</th>
              <th>Loại hợp đồng</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Lương</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((contract, index) => (
              <tr key={contract.id}>
                <td>{index + 1}</td>
                <td>{contract.contract_number}</td>
                <td>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/employees/${contract.employee_id}`);
                    }}
                    className="text-decoration-none text-danger fw-bold"
                  >
                    {contract.employee?.full_name}
                  </a>
                </td>
                <td>{contract.contract_type}</td>
                <td>{new Date(contract.start_date).toLocaleDateString('vi-VN')}</td>
                <td>{contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : '-'}</td>
                <td>{contract.salary ? new Intl.NumberFormat('vi-VN').format(contract.salary) + ' VNĐ' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default ContractList;
