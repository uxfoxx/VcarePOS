import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Switch,
  InputNumber,
  Divider,
  Space,
  Typography,
  Slider,
  message,
  Spin,
  Alert,
} from 'antd';
import {
  fetchDeliverySettingsRequest,
  updateFreeDeliveryRequest,
  updateInsideColomboRequest,
  updateOutOfColomboRequest,
} from '../../features/deliveryCharges/deliveryChargesSlice';
import { calculateDeliveryCharge, formatCurrency } from '../../utils/deliveryCalculator';

const { Title, Text } = Typography;

export function DeliveryChargesSettings() {
  const dispatch = useDispatch();
  const { settings, loading, error } = useSelector(state => state.deliveryCharges);
  const [testWeight, setTestWeight] = useState(6);
  const prevLoadingRef = React.useRef(loading);

  useEffect(() => {
    dispatch(fetchDeliverySettingsRequest({}));
  }, [dispatch]);

  useEffect(() => {
    if (prevLoadingRef.current && !loading && !error) {
      message.success('Delivery settings updated successfully');
    }
    if (prevLoadingRef.current && !loading && error) {
      message.error(error);
    }
    prevLoadingRef.current = loading;
  }, [loading, error]);

  const handleFreeDeliveryChange = (field, value) => {
    const updatedSettings = {
      ...settings.freeDelivery,
      [field]: value
    };
    dispatch(updateFreeDeliveryRequest(updatedSettings));
  };

  const handleInsideColomboChange = (field, value) => {
    const updatedSettings = {
      ...settings.insideColombo,
      [field]: value
    };
    dispatch(updateInsideColomboRequest(updatedSettings));
  };

  const handleOutOfColomboChange = (field, value) => {
    const updatedSettings = {
      ...settings.outOfColombo,
      [field]: value
    };
    dispatch(updateOutOfColomboRequest(updatedSettings));
  };

  const renderCalculationExample = () => {
    if (!settings.outOfColombo) return null;

    const result = calculateDeliveryCharge(testWeight, 'out_of_colombo', settings.outOfColombo);
    const { breakdown } = result;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <div className="mb-3">
          <Text strong>Live Calculation Example</Text>
          <div className="mt-2">
            <Text type="secondary">Test Weight: {testWeight}kg</Text>
            <Slider
              min={0.5}
              max={20}
              step={0.5}
              value={testWeight}
              onChange={setTestWeight}
              marks={{
                0.5: '0.5kg',
                5: '5kg',
                10: '10kg',
                20: '20kg'
              }}
            />
          </div>
        </div>

        <Divider className="my-3" />

        <div className="space-y-2">
          {breakdown.baseWeight && (
            <>
              <div className="flex justify-between">
                <Text>Base charge (up to {breakdown.baseWeight}kg):</Text>
                <Text strong>{formatCurrency(breakdown.baseAmount)}</Text>
              </div>
              {breakdown.additionalWeight > 0 && (
                <>
                  <div className="flex justify-between">
                    <Text>Additional weight ({breakdown.additionalWeight.toFixed(2)}kg @ {formatCurrency(breakdown.perKgAmount)}/kg):</Text>
                    <Text strong>{formatCurrency(breakdown.additionalCharge)}</Text>
                  </div>
                  <Divider className="my-2" />
                </>
              )}
              <div className="flex justify-between">
                <Text strong className="text-lg">Total Delivery Charge:</Text>
                <Text strong className="text-lg text-blue-600">{formatCurrency(result.deliveryCharge)}</Text>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (!settings.freeDelivery || !settings.insideColombo || !settings.outOfColombo) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Title level={4}>Delivery Charges</Title>
        <Text type="secondary">
          Configure delivery options with weight-based calculations
        </Text>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          className="mb-4"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Free Delivery"
          className="shadow-sm"
          extra={
            <Switch
              checked={settings.freeDelivery.is_active}
              loading={loading}
              onChange={(checked) => handleFreeDeliveryChange('is_active', checked)}
            />
          }
        >
          <Space direction="vertical" className="w-full" size="middle">
            <div>
              <Text type="secondary">Enable this option to offer free delivery</Text>
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between">
              <Text>Enable for POS:</Text>
              <Switch
                checked={settings.freeDelivery.enabled_for_pos}
                disabled={!settings.freeDelivery.is_active}
                loading={loading}
                onChange={(checked) => handleFreeDeliveryChange('enabled_for_pos', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Text>Enable for E-commerce:</Text>
              <Switch
                checked={settings.freeDelivery.enabled_for_ecommerce}
                disabled={!settings.freeDelivery.is_active}
                loading={loading}
                onChange={(checked) => handleFreeDeliveryChange('enabled_for_ecommerce', checked)}
              />
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded">
              <Text strong className="text-green-700">Delivery Charge: Rs. 0</Text>
            </div>
          </Space>
        </Card>

        <Card
          title="Inside Colombo"
          className="shadow-sm"
          extra={
            <Switch
              checked={settings.insideColombo.is_active}
              loading={loading}
              onChange={(checked) => handleInsideColomboChange('is_active', checked)}
            />
          }
        >
          <Space direction="vertical" className="w-full" size="middle">
            <div>
              <Text type="secondary">Flat rate delivery charge for Inside Colombo</Text>
            </div>

            <div>
              <Text strong>Flat Rate Amount (Rs.):</Text>
              <InputNumber
                className="w-full mt-2"
                min={0}
                step={50}
                precision={2}
                value={settings.insideColombo.inside_colombo_amount}
                disabled={!settings.insideColombo.is_active || loading}
                onChange={(value) => handleInsideColomboChange('inside_colombo_amount', value)}
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between">
              <Text>Enable for POS:</Text>
              <Switch
                checked={settings.insideColombo.enabled_for_pos}
                disabled={!settings.insideColombo.is_active}
                loading={loading}
                onChange={(checked) => handleInsideColomboChange('enabled_for_pos', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Text>Enable for E-commerce:</Text>
              <Switch
                checked={settings.insideColombo.enabled_for_ecommerce}
                disabled={!settings.insideColombo.is_active}
                loading={loading}
                onChange={(checked) => handleInsideColomboChange('enabled_for_ecommerce', checked)}
              />
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <Text strong className="text-blue-700">
                Delivery Charge: {formatCurrency(settings.insideColombo.inside_colombo_amount)}
              </Text>
            </div>
          </Space>
        </Card>

        <Card
          title="Out of Colombo"
          className="shadow-sm"
          extra={
            <Switch
              checked={settings.outOfColombo.is_active}
              loading={loading}
              onChange={(checked) => handleOutOfColomboChange('is_active', checked)}
            />
          }
        >
          <Space direction="vertical" className="w-full" size="middle">
            <div>
              <Text type="secondary">Weight-based delivery charge calculation</Text>
            </div>

            <div>
              <Text strong>Base Weight (kg):</Text>
              <InputNumber
                className="w-full mt-2"
                min={0}
                step={0.5}
                precision={1}
                value={settings.outOfColombo.out_of_colombo_base_weight}
                disabled={!settings.outOfColombo.is_active || loading}
                onChange={(value) => handleOutOfColomboChange('out_of_colombo_base_weight', value)}
              />
            </div>

            <div>
              <Text strong>Base Amount (Rs.):</Text>
              <InputNumber
                className="w-full mt-2"
                min={0}
                step={50}
                precision={2}
                value={settings.outOfColombo.out_of_colombo_base_amount}
                disabled={!settings.outOfColombo.is_active || loading}
                onChange={(value) => handleOutOfColomboChange('out_of_colombo_base_amount', value)}
              />
            </div>

            <div>
              <Text strong>Per Kg Amount (Rs.):</Text>
              <InputNumber
                className="w-full mt-2"
                min={0}
                step={10}
                precision={2}
                value={settings.outOfColombo.out_of_colombo_per_kg_amount}
                disabled={!settings.outOfColombo.is_active || loading}
                onChange={(value) => handleOutOfColomboChange('out_of_colombo_per_kg_amount', value)}
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center justify-between">
              <Text>Enable for POS:</Text>
              <Switch
                checked={settings.outOfColombo.enabled_for_pos}
                disabled={!settings.outOfColombo.is_active}
                loading={loading}
                onChange={(checked) => handleOutOfColomboChange('enabled_for_pos', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Text>Enable for E-commerce:</Text>
              <Switch
                checked={settings.outOfColombo.enabled_for_ecommerce}
                disabled={!settings.outOfColombo.is_active}
                loading={loading}
                onChange={(checked) => handleOutOfColomboChange('enabled_for_ecommerce', checked)}
              />
            </div>

            {settings.outOfColombo.is_active && renderCalculationExample()}
          </Space>
        </Card>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <Text strong>How weight-based calculation works:</Text>
        <ul className="mt-2 ml-4 space-y-1">
          <li>
            <Text>If total weight is up to the base weight, the base amount is charged</Text>
          </li>
          <li>
            <Text>If total weight exceeds the base weight, additional charges apply per kg</Text>
          </li>
          <li>
            <Text>Example: 6kg order with 5kg base @ Rs.600 + 1kg @ Rs.100/kg = Rs.700 total</Text>
          </li>
        </ul>
      </div>
    </div>
  );
}
