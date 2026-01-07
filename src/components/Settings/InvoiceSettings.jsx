import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  message,
  Tabs,
  Switch,
  Table,
  Modal,
  Popconfirm,
  Select,
  InputNumber
} from 'antd';
import { Icon } from '../common/Icon';
import { ActionButton } from '../common/ActionButton';
import apiClient from '../../api/apiClient';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export function InvoiceSettings() {
  const [form] = Form.useForm();
  const [bankForm] = Form.useForm();
  const [notesForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [notesTemplates, setNotesTemplates] = useState([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);

  useEffect(() => {
    loadInvoiceSettings();
    loadBankAccounts();
    loadNotesTemplates();
  }, []);

  const loadInvoiceSettings = async () => {
    try {
      const response = await apiClient.get('/invoice-settings');
      if (response.data) {
        form.setFieldsValue({
          businessName: response.data.business_name,
          businessAddress: response.data.business_address,
          phoneNumber: response.data.phone_number,
          emailAddress: response.data.email_address,
          website: response.data.website,
          currency: response.data.currency || 'LKR',
          taxRate: response.data.tax_rate || 8
        });
      }
    } catch (error) {
      console.error('Error loading invoice settings:', error);
    }
  };

  const loadBankAccounts = async () => {
    try {
      const response = await apiClient.get('/invoice-settings/bank-accounts');
      setBankAccounts(response.data || []);
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    }
  };

  const loadNotesTemplates = async () => {
    try {
      const response = await apiClient.get('/invoice-settings/notes-templates');
      setNotesTemplates(response.data || []);
    } catch (error) {
      console.error('Error loading notes templates:', error);
    }
  };

  const handleSaveSettings = async (values) => {
    setLoading(true);
    try {
      await apiClient.put('/invoice-settings', values);
      message.success('Invoice settings saved successfully');
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      message.error('Failed to save invoice settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = () => {
    setEditingBank(null);
    bankForm.resetFields();
    setShowBankModal(true);
  };

  const handleEditBankAccount = (record) => {
    setEditingBank(record);
    bankForm.setFieldsValue({
      accountHolderName: record.account_holder_name,
      accountNumber: record.account_number,
      bankName: record.bank_name,
      branchName: record.branch_name,
      isDefault: record.is_default
    });
    setShowBankModal(true);
  };

  const handleSaveBankAccount = async (values) => {
    setLoading(true);
    try {
      if (editingBank) {
        await apiClient.put(`/invoice-settings/bank-accounts/${editingBank.id}`, values);
        message.success('Bank account updated successfully');
      } else {
        await apiClient.post('/invoice-settings/bank-accounts', values);
        message.success('Bank account added successfully');
      }
      setShowBankModal(false);
      loadBankAccounts();
    } catch (error) {
      console.error('Error saving bank account:', error);
      message.error('Failed to save bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBankAccount = async (id) => {
    try {
      await apiClient.delete(`/invoice-settings/bank-accounts/${id}`);
      message.success('Bank account deleted successfully');
      loadBankAccounts();
    } catch (error) {
      console.error('Error deleting bank account:', error);
      message.error('Failed to delete bank account');
    }
  };

  const handleAddNotesTemplate = () => {
    setEditingNotes(null);
    notesForm.resetFields();
    setShowNotesModal(true);
  };

  const handleEditNotesTemplate = (record) => {
    setEditingNotes(record);
    notesForm.setFieldsValue({
      templateName: record.template_name,
      warrantyTerms: record.warranty_terms,
      quotationValidity: record.quotation_validity,
      customNotes: record.custom_notes,
      isDefault: record.is_default
    });
    setShowNotesModal(true);
  };

  const handleSaveNotesTemplate = async (values) => {
    setLoading(true);
    try {
      if (editingNotes) {
        await apiClient.put(`/invoice-settings/notes-templates/${editingNotes.id}`, values);
        message.success('Notes template updated successfully');
      } else {
        await apiClient.post('/invoice-settings/notes-templates', values);
        message.success('Notes template added successfully');
      }
      setShowNotesModal(false);
      loadNotesTemplates();
    } catch (error) {
      console.error('Error saving notes template:', error);
      message.error('Failed to save notes template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotesTemplate = async (id) => {
    try {
      await apiClient.delete(`/invoice-settings/notes-templates/${id}`);
      message.success('Notes template deleted successfully');
      loadNotesTemplates();
    } catch (error) {
      console.error('Error deleting notes template:', error);
      message.error('Failed to delete notes template');
    }
  };

  const bankColumns = [
    {
      title: 'Account Holder',
      dataIndex: 'account_holder_name',
      key: 'account_holder_name',
    },
    {
      title: 'Account Number',
      dataIndex: 'account_number',
      key: 'account_number',
    },
    {
      title: 'Bank Name',
      dataIndex: 'bank_name',
      key: 'bank_name',
    },
    {
      title: 'Branch',
      dataIndex: 'branch_name',
      key: 'branch_name',
    },
    {
      title: 'Default',
      dataIndex: 'is_default',
      key: 'is_default',
      render: (isDefault) => isDefault ? <Icon name="check_circle" className="text-green-600" /> : null
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <ActionButton.Text icon="edit" onClick={() => handleEditBankAccount(record)} />
          <Popconfirm
            title="Delete bank account?"
            onConfirm={() => handleDeleteBankAccount(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <ActionButton.Text icon="delete" className="text-red-600" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const notesColumns = [
    {
      title: 'Template Name',
      dataIndex: 'template_name',
      key: 'template_name',
    },
    {
      title: 'Default',
      dataIndex: 'is_default',
      key: 'is_default',
      render: (isDefault) => isDefault ? <Icon name="check_circle" className="text-green-600" /> : null
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <ActionButton.Text icon="edit" onClick={() => handleEditNotesTemplate(record)} />
          <Popconfirm
            title="Delete notes template?"
            onConfirm={() => handleDeleteNotesTemplate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <ActionButton.Text icon="delete" className="text-red-600" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const tabItems = [
    {
      key: 'general',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="business" />
          <span>General Settings</span>
        </span>
      ),
      children: (
        <Form form={form} layout="vertical" onFinish={handleSaveSettings}>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="businessName"
                label="Business Name"
                rules={[{ required: true, message: 'Please enter business name' }]}
              >
                <Input placeholder="Enter business name" />
              </Form.Item>

              <Form.Item
                name="businessAddress"
                label="Business Address"
                rules={[{ required: true, message: 'Please enter business address' }]}
              >
                <TextArea rows={3} placeholder="Enter business address" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item
                name="emailAddress"
                label="Email Address"
              >
                <Input placeholder="Enter email address" />
              </Form.Item>

              <Form.Item
                name="website"
                label="Website"
              >
                <Input placeholder="Enter website URL" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="currency"
                label="Currency"
                initialValue="LKR"
                rules={[{ required: true, message: 'Please select currency' }]}
              >
                <Select placeholder="Select currency">
                  <Option value="LKR">LKR (Rs)</Option>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                  <Option value="GBP">GBP (£)</Option>
                  <Option value="INR">INR (₹)</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="taxRate"
                label="Default Tax Rate (%)"
                initialValue={8}
                rules={[{ required: true, message: 'Please enter tax rate' }]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  className="w-full"
                  placeholder="Enter tax rate"
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <Text className="text-sm">
              <Icon name="info" className="mr-2 text-blue-600" />
              <strong>Note:</strong> Currency and tax rate settings will be used as defaults for all new invoices and quotations. You can override these values for individual transactions.
            </Text>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="primary" htmlType="submit" loading={loading} icon={<Icon name="save" />}>
              Save Settings
            </Button>
          </div>
        </Form>
      )
    },
    {
      key: 'bankAccounts',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="account_balance" />
          <span>Bank Accounts</span>
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text>Manage bank account details for invoices</Text>
            <Button type="primary" icon={<Icon name="add" />} onClick={handleAddBankAccount}>
              Add Bank Account
            </Button>
          </div>

          <Table
            columns={bankColumns}
            dataSource={bankAccounts}
            rowKey="id"
            pagination={false}
          />
        </div>
      )
    },
    {
      key: 'notesTemplates',
      label: (
        <span className="flex items-center space-x-2">
          <Icon name="note" />
          <span>Invoice Notes</span>
        </span>
      ),
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Text>Manage invoice notes and terms templates</Text>
            <Button type="primary" icon={<Icon name="add" />} onClick={handleAddNotesTemplate}>
              Add Notes Template
            </Button>
          </div>

          <Table
            columns={notesColumns}
            dataSource={notesTemplates}
            rowKey="id"
            pagination={false}
          />
        </div>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <Icon name="receipt" className="text-blue-600" />
          <Title level={4} className="m-0">Invoice Settings</Title>
        </Space>
      }
    >
      <Tabs items={tabItems} />

      {/* Bank Account Modal */}
      <Modal
        title={editingBank ? 'Edit Bank Account' : 'Add Bank Account'}
        open={showBankModal}
        onCancel={() => setShowBankModal(false)}
        footer={null}
      >
        <Form form={bankForm} layout="vertical" onFinish={handleSaveBankAccount}>
          <Form.Item
            name="accountHolderName"
            label="Account Holder Name"
            rules={[{ required: true, message: 'Please enter account holder name' }]}
          >
            <Input placeholder="Enter account holder name" />
          </Form.Item>

          <Form.Item
            name="accountNumber"
            label="Account Number"
            rules={[{ required: true, message: 'Please enter account number' }]}
          >
            <Input placeholder="Enter account number" />
          </Form.Item>

          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please enter bank name' }]}
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>

          <Form.Item
            name="branchName"
            label="Branch Name"
          >
            <Input placeholder="Enter branch name" />
          </Form.Item>

          <Form.Item
            name="isDefault"
            label="Set as Default"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowBankModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingBank ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Notes Template Modal */}
      <Modal
        title={editingNotes ? 'Edit Notes Template' : 'Add Notes Template'}
        open={showNotesModal}
        onCancel={() => setShowNotesModal(false)}
        footer={null}
        width={700}
      >
        <Form form={notesForm} layout="vertical" onFinish={handleSaveNotesTemplate}>
          <Form.Item
            name="templateName"
            label="Template Name"
            rules={[{ required: true, message: 'Please enter template name' }]}
          >
            <Input placeholder="Enter template name" />
          </Form.Item>

          <Form.Item
            name="warrantyTerms"
            label="Warranty Terms"
          >
            <TextArea
              rows={4}
              placeholder="Enter warranty terms and conditions"
            />
          </Form.Item>

          <Form.Item
            name="quotationValidity"
            label="Quotation Validity"
          >
            <TextArea
              rows={2}
              placeholder="Enter quotation validity information"
            />
          </Form.Item>

          <Form.Item
            name="customNotes"
            label="Custom Notes"
          >
            <TextArea
              rows={3}
              placeholder="Enter any custom notes"
            />
          </Form.Item>

          <Form.Item
            name="isDefault"
            label="Set as Default"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setShowNotesModal(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingNotes ? 'Update' : 'Add'}
            </Button>
          </div>
        </Form>
      </Modal>
    </Card>
  );
}
