import { Card, Typography, Row, Col } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '../common/Icon';
import { ALWAYS_ACCESSIBLE_MODULES } from '../../constants/permissions';

const { Title, Text } = Typography;

export function Dashboard({ onNavigate }) {
    const { hasPermission } = useAuth();

    const modules = [
        {
            key: 'pos',
            icon: 'restaurant',
            label: 'Point of Sale',
            module: 'pos',
            description: 'Manage sales and create fast transactions',
            color: '#0E72BD'
        },
        {
            key: 'products',
            icon: 'inventory_2',
            label: 'Products',
            module: 'products',
            description: 'Manage product catalog and pricing',
            color: '#52c41a'
        },
        {
            key: 'raw-materials',
            icon: 'category',
            label: 'Raw Materials',
            module: 'raw-materials',
            description: 'Track inventory and raw materials',
            color: '#fa8c16'
        },
        {
            key: 'transactions',
            icon: 'receipt_long',
            label: 'Orders',
            module: 'transactions',
            description: 'View transaction history and orders',
            color: '#722ed1'
        },
        {
            key: 'quotations',
            icon: 'request_quote',
            label: 'Quotations',
            module: 'quotations',
            description: 'Create and manage customer quotations',
            color: '#13c2c2'
        },
        {
            key: 'reports',
            icon: 'analytics',
            label: 'Reports',
            module: 'reports',
            description: 'View sales and inventory analytics',
            color: '#eb2f96'
        },
        {
            key: 'coupons',
            icon: 'local_offer',
            label: 'Coupons',
            module: 'coupons',
            description: 'Manage discount codes and coupons',
            color: '#f5222d'
        },
        {
            key: 'tax',
            icon: 'receipt',
            label: 'Tax Management',
            module: 'tax',
            description: 'Configure tax rates and rules',
            color: '#fa541c'
        },
        {
            key: 'purchase-orders',
            icon: 'receipt',
            label: 'Purchase Orders',
            module: 'purchase-orders',
            description: 'Manage incoming supply orders',
            color: '#a0d911'
        },
        {
            key: 'user-management',
            icon: 'people',
            label: 'User Management',
            module: 'user-management',
            description: 'Manage staff accounts and permissions',
            color: '#2f54eb'
        },
        {
            key: 'audit-trail',
            icon: 'history',
            label: 'Audit Trail',
            module: 'audit-trail',
            description: 'View system logs and user actions',
            color: '#595959'
        },
        {
            key: 'ecommerce-orders',
            icon: 'storefront',
            label: 'E-commerce Orders',
            module: 'ecommerce-orders',
            description: 'Manage online sales and fulfillment',
            color: '#1890ff'
        },
        {
            key: 'settings',
            icon: 'settings',
            label: 'Settings',
            module: 'settings',
            description: 'Configure system preferences',
            color: '#8c8c8c'
        },
    ];

    // Filter out modules the user doesn't have permission to view
    const accessibleModules = modules.filter(item =>
        ALWAYS_ACCESSIBLE_MODULES.includes(item.module) || hasPermission(item.module, 'view')
    );

    return (
        <div className="p-6">
            <div className="mb-8">
                <Title level={2} className="m-0">Welcome to VCare POS</Title>
                <Text type="secondary" className="text-lg">Select a module to get started</Text>
            </div>

            <Row gutter={[24, 24]}>
                {accessibleModules.map((item) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item.key}>
                        <Card
                            hoverable
                            className="h-full border-gray-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            style={{ borderRadius: '12px', overflow: 'hidden' }}
                            onClick={() => onNavigate(item.key)}
                        >
                            <div className="flex flex-col items-center text-center p-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white shadow-md transition-transform"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <Icon name={item.icon} className="text-3xl" />
                                </div>
                                <Title level={4} className="mb-2" style={{ color: '#1f2937' }}>{item.label}</Title>
                                <Text type="secondary" className="text-sm">
                                    {item.description}
                                </Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
