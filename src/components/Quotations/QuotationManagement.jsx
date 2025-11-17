import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Tag, Space, Input, DatePicker, Select, message } from 'antd';
import { Icon } from '../common/Icon';
import { PageHeader } from '../common/PageHeader';
import { ActionButton } from '../common/ActionButton';
import { fetchQuotations, deleteQuotation, convertQuotation, setFilters, setPagination } from '../../features/quotations/quotationsSlice';
import dayjs from 'dayjs';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

export function QuotationManagement() {
  const dispatch = useDispatch();
  const { quotations, loading, pagination, filters } = useSelector(state => state.quotations);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  useEffect(() => {
    dispatch(fetchQuotations());
  }, [dispatch, filters, pagination.page]);

  const handleStatusChange = (value) => {
    dispatch(setFilters({ status: value }));
  };

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      dispatch(setFilters({
        startDate: dates[0].toISOString(),
        endDate: dates[1].toISOString()
      }));
    } else {
      dispatch(setFilters({ startDate: null, endDate: null }));
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteQuotation({
      id,
      onSuccess: () => {
        message.success('Quotation deleted successfully');
        dispatch(fetchQuotations());
      }
    }));
  };

  const handleConvert = (id) => {
    dispatch(convertQuotation({
      id,
      onSuccess: (data) => {
        message.success('Quotation loaded to POS');
      }
    }));
  };

  const columns = [
    {
      title: 'Quotation No',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      width: 150
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 200
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total) => `LKR ${total?.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          draft: 'default',
          sent: 'blue',
          accepted: 'green',
          rejected: 'red',
          expired: 'orange',
          converted: 'purple'
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Valid Until',
      dataIndex: 'valid_until',
      key: 'valid_until',
      width: 120,
      render: (date) => date ? dayjs(date).format('MM/DD/YYYY') : 'N/A'
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => dayjs(date).format('MM/DD/YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <ActionButton
            size="small"
            icon="visibility"
            onClick={() => setSelectedQuotation(record)}
          >
            View
          </ActionButton>
          {record.status !== 'converted' && (
            <ActionButton
              size="small"
              icon="shopping_cart"
              onClick={() => handleConvert(record.id)}
            >
              Load to POS
            </ActionButton>
          )}
          {record.status === 'draft' && (
            <ActionButton
              size="small"
              icon="delete"
              danger
              onClick={() => handleDelete(record.id)}
            >
              Delete
            </ActionButton>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Quotation Management"
        subtitle="Manage customer quotations"
        icon="request_quote"
      />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex gap-4">
          <Search
            placeholder="Search by quotation number, customer name or phone"
            onSearch={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            onChange={handleStatusChange}
            allowClear
          >
            <Option value="draft">Draft</Option>
            <Option value="sent">Sent</Option>
            <Option value="accepted">Accepted</Option>
            <Option value="rejected">Rejected</Option>
            <Option value="expired">Expired</Option>
            <Option value="converted">Converted</Option>
          </Select>
          <RangePicker onChange={handleDateRangeChange} />
        </div>

        <Table
          columns={columns}
          dataSource={quotations}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} quotations`,
            onChange: (page, pageSize) => {
              dispatch(setPagination({ page, limit: pageSize }));
            }
          }}
        />
      </div>
    </div>
  );
}
