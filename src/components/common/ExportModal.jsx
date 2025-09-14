import { useState } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  Input,
  Typography, 
  Space, 
  Row,
  Col,
  Card,
  message
} from 'antd';
import { ActionButton } from './ActionButton';
import { Icon } from './Icon';
import { 
  exportProducts, 
  exportRawMaterials, 
  exportTransactions, 
  exportTransactionItems,
  exportCoupons, 
  exportUsers, 
  exportAuditTrail,
  exportComprehensiveReport,
  exportPurchaseOrders,
  exportVendors,
  exportTopSellingProducts
} from '../../utils/csvExport';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export function ExportModal({ 
  open, 
  onClose, 
  dataType = 'products',
  data = {},
  title: _title = 'Export Data'
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      
      // Validate data exists
      if (!data || Object.keys(data).length === 0) {
        message.error('No data available for export. Please ensure data is loaded first.');
        return;
      }
      
      // Prepare filters based on data type
      const filters = { ...values };
      
      // Validate date ranges
      if (filters.dateRange) {
        if (filters.dateRange.length !== 2) {
          message.error('Please select both start and end dates for the date range.');
          return;
        }
        const [startDate, endDate] = filters.dateRange;
        if (endDate.isBefore(startDate)) {
          message.error('End date cannot be before start date.');
          return;
        }
        // Convert date ranges to dayjs objects
        filters.dateRange = filters.dateRange.map(date => dayjs(date));
      }

      // Validate price ranges
      if (filters.priceRange && (filters.priceRange.min !== undefined || filters.priceRange.max !== undefined)) {
        if (filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
          if (filters.priceRange.min > filters.priceRange.max) {
            message.error('Minimum price cannot be greater than maximum price.');
            return;
          }
        }
        if (filters.priceRange.min !== undefined && filters.priceRange.min < 0) {
          message.error('Minimum price cannot be negative.');
          return;
        }
      }

      // Validate amount ranges
      if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
        if (filters.minAmount > filters.maxAmount) {
          message.error('Minimum amount cannot be greater than maximum amount.');
          return;
        }
      }

      console.log('Exporting with filters:', dataType, filters);
      
      switch (dataType) {
        case 'products':
          exportProducts(data.products || [], filters);
          break;
        case 'raw-materials':
          exportRawMaterials(data.rawMaterials || [], filters);
          break;
        case 'transactions':
          exportTransactions(data.transactions || [], filters);
          break;
        case 'transaction-items':
          exportTransactionItems(data.transactions || [], filters);
          break;
        case 'purchase-orders':
          exportPurchaseOrders(data.purchaseOrders || [], filters);
          break;
        case 'vendors':
          exportVendors(data.vendors || [], filters);
          break;
        case 'coupons':
          exportCoupons(data.coupons || [], filters);
          break;
        case 'users':
          exportUsers(data.users || [], filters);
          break;
        case 'audit-trail':
          exportAuditTrail(data.auditTrail || [], filters);
          break;
        case 'top-selling':
          exportTopSellingProducts(data.topSellingProducts || [], filters);
          break;
        case 'comprehensive':
          exportComprehensiveReport(data, filters);
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      message.success('Export completed successfully!');
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      
      // Provide specific error messages based on error type
      if (error.message.includes('No CSV content')) {
        message.error('No data available to export. Please check your filters and try again.');
      } else if (error.message.includes('Failed to convert data to CSV')) {
        message.error('Data formatting error. Some data may be corrupted. Please contact support.');
      } else if (error.message.includes('Failed to download file')) {
        message.error('Download failed. Please check your browser settings and try again.');
      } else if (error.message.includes('Unknown data type')) {
        message.error('Invalid export type selected. Please refresh the page and try again.');
      } else if (error.message.includes('File download is not supported')) {
        message.error('File downloads are not supported in your browser. Please use a modern browser.');
      } else if (error.message.includes('memory')) {
        message.error('Export size too large. Please apply more filters to reduce the data size.');
      } else {
        message.error(`Export failed: ${error.message || 'Please try again or contact support if the problem persists.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderProductFilters = () => (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="category" label="Category">
            <Select placeholder="All categories" allowClear>
              <Option value="all">All Categories</Option>
              {data.categories?.map(cat => (
                <Option key={cat.id} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="hasVariations" label="Product Type">
            <Select placeholder="All types" allowClear>
              <Option value={true}>Products with Variations</Option>
              <Option value={false}>Single Products</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="priceRange" label="Price Range">
            <Input.Group compact>
              <Form.Item name={['priceRange', 'min']} noStyle>
                <InputNumber placeholder="Min price" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item name={['priceRange', 'max']} noStyle>
                <InputNumber placeholder="Max price" style={{ width: '50%' }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Form.Item name="lowStock" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text>Low Stock Only (≤10 units)</Text>
            </div>
            <div className="flex items-center space-x-2">
              <Form.Item name="outOfStock" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
              <Text>Out of Stock Only</Text>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderRawMaterialFilters = () => (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="category" label="Category">
            <Select placeholder="All categories" allowClear>
              <Option value="all">All Categories</Option>
              <Option value="Wood">Wood</Option>
              <Option value="Hardware">Hardware</Option>
              <Option value="Upholstery">Upholstery</Option>
              <Option value="Finishing">Finishing</Option>
              <Option value="Metal">Metal</Option>
              <Option value="Fabric">Fabric</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="supplier" label="Supplier">
            <Input placeholder="Filter by supplier name" />
          </Form.Item>
        </Col>
      </Row>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Form.Item name="lowStock" valuePropName="checked" noStyle>
            <Switch size="small" />
          </Form.Item>
          <Text>Low Stock Only</Text>
        </div>
        <div className="flex items-center space-x-2">
          <Form.Item name="outOfStock" valuePropName="checked" noStyle>
            <Switch size="small" />
          </Form.Item>
          <Text>Out of Stock Only</Text>
        </div>
      </div>
    </div>
  );

  const renderTransactionFilters = () => (
    <div className="space-y-4">
      <Form.Item name="dateRange" label="Date Range">
        <RangePicker 
          className="w-full"
          format="YYYY-MM-DD"
          placeholder={['Start Date', 'End Date']}
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="paymentMethod" label="Payment Method">
            <Select placeholder="All methods" allowClear>
              <Option value="all">All Methods</Option>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="digital">Digital</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="status" label="Status">
            <Select placeholder="All statuses" allowClear>
              <Option value="all">All Statuses</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="cashier" label="Cashier">
            <Input placeholder="Filter by cashier" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="minAmount" label="Minimum Amount">
            <InputNumber 
              placeholder="0.00" 
              className="w-full"
              prefix="LKR"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="maxAmount" label="Maximum Amount">
            <InputNumber 
              placeholder="No limit" 
              className="w-full"
              prefix="LKR"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderTransactionItemFilters = () => (
    <div className="space-y-4">
      <Form.Item name="dateRange" label="Date Range">
        <RangePicker 
          className="w-full"
          format="YYYY-MM-DD"
          placeholder={['Start Date', 'End Date']}
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="productCategory" label="Product Category">
            <Select placeholder="All categories" allowClear>
              <Option value="all">All Categories</Option>
              {data.categories?.map(cat => (
                <Option key={cat.id} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="productName" label="Product Name">
            <Input placeholder="Filter by product name" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderCouponFilters = () => (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="discountType" label="Discount Type">
            <Select placeholder="All types" allowClear>
              <Option value="all">All Types</Option>
              <Option value="percentage">Percentage</Option>
              <Option value="fixed">Fixed Amount</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="isActive" label="Status">
            <Select placeholder="All statuses" allowClear>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Form.Item name="expired" valuePropName="checked" noStyle>
            <Switch size="small" />
          </Form.Item>
          <Text>Expired Coupons Only</Text>
        </div>
        <div className="flex items-center space-x-2">
          <Form.Item name="usedUp" valuePropName="checked" noStyle>
            <Switch size="small" />
          </Form.Item>
          <Text>Used Up Coupons Only</Text>
        </div>
      </div>
    </div>
  );

  const renderUserFilters = () => (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="role" label="Role">
            <Select placeholder="All roles" allowClear>
              <Option value="all">All Roles</Option>
              <Option value="admin">Administrator</Option>
              <Option value="manager">Manager</Option>
              <Option value="cashier">Cashier</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="isActive" label="Status">
            <Select placeholder="All statuses" allowClear>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <div className="flex items-center space-x-2">
        <Form.Item name="recentLogin" valuePropName="checked" noStyle>
          <Switch size="small" />
        </Form.Item>
        <Text>Users with Recent Login (Last 30 days)</Text>
      </div>
    </div>
  );

  const renderAuditFilters = () => (
    <div className="space-y-4">
      <Form.Item name="dateRange" label="Date Range">
        <RangePicker 
          className="w-full"
          format="YYYY-MM-DD"
          placeholder={['Start Date', 'End Date']}
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="action" label="Action">
            <Select placeholder="All actions" allowClear>
              <Option value="all">All Actions</Option>
              <Option value="CREATE">Create</Option>
              <Option value="UPDATE">Update</Option>
              <Option value="DELETE">Delete</Option>
              <Option value="LOGIN">Login</Option>
              <Option value="LOGOUT">Logout</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="module" label="Module">
            <Select placeholder="All modules" allowClear>
              <Option value="all">All Modules</Option>
              <Option value="products">Products</Option>
              <Option value="raw-materials">Raw Materials</Option>
              <Option value="transactions">Transactions</Option>
              <Option value="user-management">User Management</Option>
              <Option value="authentication">Authentication</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="userId" label="User ID">
            <Input placeholder="Filter by user ID" />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderPurchaseOrderFilters = () => (
    <div className="space-y-4">
      <Form.Item name="dateRange" label="Date Range">
        <RangePicker 
          className="w-full"
          format="YYYY-MM-DD"
          placeholder={['Start Date', 'End Date']}
        />
      </Form.Item>
      
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="status" label="Status">
            <Select placeholder="All statuses" allowClear>
              <Option value="all">All Statuses</Option>
              <Option value="pending">Pending</Option>
              <Option value="received">Received</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="vendorName" label="Vendor Name">
            <Input placeholder="Filter by vendor name" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="createdBy" label="Created By">
            <Input placeholder="Filter by creator" />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="minAmount" label="Minimum Amount">
            <InputNumber 
              placeholder="0.00" 
              className="w-full"
              prefix="LKR"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="maxAmount" label="Maximum Amount">
            <InputNumber 
              placeholder="No limit" 
              className="w-full"
              prefix="LKR"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderVendorFilters = () => (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="category" label="Category">
            <Select placeholder="All categories" allowClear>
              <Option value="all">All Categories</Option>
              <Option value="Wood">Wood</Option>
              <Option value="Hardware">Hardware</Option>
              <Option value="Upholstery">Upholstery</Option>
              <Option value="Finishing">Finishing</Option>
              <Option value="Metal">Metal</Option>
              <Option value="Fabric">Fabric</Option>
              <Option value="Materials">Materials</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="isActive" label="Status">
            <Select placeholder="All statuses" allowClear>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item name="name" label="Vendor Name">
        <Input placeholder="Filter by vendor name" />
      </Form.Item>
    </div>
  );

  const renderTopSellingFilters = () => (
    <div className="space-y-4">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="category" label="Category">
            <Select placeholder="All categories" allowClear>
              <Option value="all">All Categories</Option>
              {data.categories?.map(cat => (
                <Option key={cat.id} value={cat.name}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="minQuantity" label="Minimum Units Sold">
            <InputNumber 
              placeholder="0" 
              className="w-full"
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="minRevenue" label="Minimum Revenue">
            <InputNumber 
              placeholder="0.00" 
              className="w-full"
              prefix="LKR"
              min={0}
              step={0.01}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );

  const renderFilters = () => {
    switch (dataType) {
      case 'products':
        return renderProductFilters();
      case 'raw-materials':
        return renderRawMaterialFilters();
      case 'transactions':
        return renderTransactionFilters();
      case 'transaction-items':
        return renderTransactionItemFilters();
      case 'purchase-orders':
        return renderPurchaseOrderFilters();
      case 'vendors':
        return renderVendorFilters();
      case 'coupons':
        return renderCouponFilters();
      case 'users':
        return renderUserFilters();
      case 'audit-trail':
        return renderAuditFilters();
      case 'top-selling':
        return renderTopSellingFilters();
      case 'comprehensive':
        return (
          <div className="text-center py-8">
            <Icon name="analytics" className="text-4xl text-blue-600 mb-4" />
            <Title level={4}>Comprehensive Report</Title>
            <Text type="secondary">
              This will export a summary report with key metrics from all modules.
            </Text>
          </div>
        );
      default:
        return null;
    }
  };

  const getDataTypeTitle = () => {
    const titles = {
      'products': 'Products',
      'raw-materials': 'Raw Materials',
      'transactions': 'Transactions',
      'transaction-items': 'Transaction Items',
      'coupons': 'Coupons',
      'users': 'Users',
      'audit-trail': 'Audit Trail',
      'top-selling': 'Top Selling Products',
      'comprehensive': 'Comprehensive Report'
    };
    return titles[dataType] || 'Data';
  };

  const getRecordCount = () => {
    const counts = {
      'products': data.products?.length || 0,
      'raw-materials': data.rawMaterials?.length || 0,
      'transactions': data.transactions?.length || 0,
      'transaction-items': data.transactions?.reduce((sum, t) => sum + t.items.length, 0) || 0,
      'coupons': data.coupons?.length || 0,
      'users': data.users?.length || 0,
      'audit-trail': data.auditTrail?.length || 0,
      'top-selling': data.topSellingProducts?.length || 0,
      'comprehensive': 'All Data'
    };
    return counts[dataType] || 0;
  };

  return (
    <Modal
      title={
        <Space>
          <Icon name="download" className="text-blue-600" />
          <span>Export {getDataTypeTitle()}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <ActionButton key="cancel" onClick={onClose}>
          Cancel
        </ActionButton>,
        <ActionButton.Primary 
          key="export" 
          onClick={handleExport}
          loading={loading}
          icon="download"
        >
          Export CSV
        </ActionButton.Primary>
      ]}
      destroyOnClose
    >
      <div className="space-y-6">
        {/* Export Info */}
        <Card size="small" className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <Text strong>Export Type: {getDataTypeTitle()}</Text>
              <br />
              <Text type="secondary">
                Total Records: {getRecordCount()}
              </Text>
            </div>
            <Icon name="table_chart" className="text-blue-600 text-2xl" />
          </div>
        </Card>

        {/* Filters */}
        <div>
          <Title level={5} className="mb-4">Export Filters</Title>
          <Form
            form={form}
            layout="vertical"
            preserve={false}
          >
            {renderFilters()}
          </Form>
        </div>

        {/* Export Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Text className="text-sm">
            <Icon name="info" className="mr-2 text-blue-600" />
            <strong>Export Format:</strong> The data will be exported as a CSV file that can be opened in Excel, Google Sheets, or any spreadsheet application. 
            All filters will be applied to reduce the exported data to only what you need.
          </Text>
        </div>
      </div>
    </Modal>
  );
}