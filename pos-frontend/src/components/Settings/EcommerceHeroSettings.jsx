import { useState, useEffect, useCallback } from 'react';
import {
    Form,
    Input,
    Typography,
    Row,
    Col,
    message,
    Divider,
    Card,
    Switch,
    Upload,
    Button,
    Space,
    Radio
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    LinkOutlined,
    DeleteOutlined,
    SaveOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { ActionButton } from '../common/ActionButton';
import { settingsApi } from '../../api/apiClient';

const { Title, Text } = Typography;
const { TextArea } = Input;

export function EcommerceHeroSettings() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isSlider, setIsSlider] = useState(false);
    const [sliderError, setSliderError] = useState('');

    const loadHeroSettings = useCallback(async () => {
        try {
            setFetching(true);
            const content = await settingsApi.getSiteContent();

            let heroSlides = [];
            let heroIsSlider = false;

            if (Array.isArray(content)) {
                const slidesItem = content.find(item => item.key === 'hero_slides');
                const isSliderItem = content.find(item => item.key === 'hero_is_slider');

                if (slidesItem && slidesItem.value) {
                    try {
                        heroSlides = JSON.parse(slidesItem.value);
                    } catch (_e) {
                        console.error('Failed to parse hero_slides', _e);
                    }
                }

                if (isSliderItem) {
                    heroIsSlider = isSliderItem.value === 'true' || isSliderItem.value === true;
                }

                if (heroSlides.length === 0) {
                    heroSlides = [{
                        media_type: 'video',
                        media_url: '',
                        title: '',
                        description: '',
                        cta_type: 'button',
                        button_text: '',
                        button_link: ''
                    }];
                } else {
                    // Ensure every slide has a cta_type
                    heroSlides = heroSlides.map(s => ({
                        ...s,
                        cta_type: s.cta_type || (s.button_text ? 'button' : 'none')
                    }));
                }
            }

            setIsSlider(heroIsSlider);
            form.setFieldsValue({
                hero_is_slider: heroIsSlider,
                hero_slides: heroSlides
            });
        } catch (error) {
            console.error('Failed to load hero settings:', error);
            message.error('Failed to load hero settings');
        } finally {
            setFetching(false);
        }
    }, [form]);

    useEffect(() => {
        loadHeroSettings();
    }, [loadHeroSettings]);

    const handleSave = async (values) => {
        try {
            setLoading(true);

            // Clean up CTA fields based on selection before saving
            const sanitizedSlides = values.hero_slides.map(slide => {
                const cleaned = { ...slide };
                if (slide.cta_type === 'none') {
                    delete cleaned.button_text;
                    delete cleaned.button_link;
                }
                return cleaned;
            });

            const settingsArray = [
                { key: 'hero_is_slider', value: values.hero_is_slider },
                { key: 'hero_slides', value: JSON.stringify(sanitizedSlides) }
            ];

            await settingsApi.updateSiteContent(settingsArray);
            message.success('Hero section settings saved successfully');
        } catch (error) {
            console.error('Failed to save hero settings:', error);
            message.error('Failed to save hero settings');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file, slideIndex) => {
        try {
            const result = await settingsApi.uploadHeroMedia(file);
            if (result.success) {
                const currentSlides = form.getFieldValue('hero_slides');
                currentSlides[slideIndex].media_url = result.filePath;
                if (result.mimetype.startsWith('video/')) {
                    currentSlides[slideIndex].media_type = 'video';
                } else if (result.mimetype.startsWith('image/')) {
                    currentSlides[slideIndex].media_type = 'image';
                }
                form.setFieldsValue({ hero_slides: [...currentSlides] });
                message.success('Media uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            message.error('Failed to upload media');
        }
        return false;
    };

    const handleSliderToggle = (checked) => {
        const slides = form.getFieldValue('hero_slides') || [];
        if (!checked && slides.length > 1) {
            setSliderError('Cannot disable slider mode while multiple slides exist. Please remove extra slides first.');
            // Do not update the switch state in the form yet
            return;
        }
        setSliderError('');
        setIsSlider(checked);
        form.setFieldsValue({ hero_is_slider: checked });
    };

    if (fetching) {
        return <div className="p-8 text-center text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div>
                    <Title level={4} className="mb-1">Ecommerce Hero Section</Title>
                    <Text type="secondary">
                        Manage your homepage banners and promotional slides.
                    </Text>
                    {sliderError && (
                        <div className="mt-2 flex items-center gap-2 text-red-500 animate-pulse">
                            <InfoCircleOutlined />
                            <Text type="danger" strong>{sliderError}</Text>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 bg-white p-3 px-5 rounded-lg shadow-sm border border-gray-100">
                    <Text strong>Slider Mode</Text>
                    <Switch
                        checked={isSlider}
                        onChange={handleSliderToggle}
                        className={isSlider ? 'bg-primary-600' : ''}
                    />
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                requiredMark={false}
                initialValues={{ hero_is_slider: isSlider, hero_slides: [{ media_type: 'video', cta_type: 'button' }] }}
            >
                <Form.Item name="hero_is_slider" valuePropName="checked" hidden>
                    <Input />
                </Form.Item>

                <Form.List name="hero_slides">
                    {(fields, { add, remove }) => (
                        <div className="space-y-8">
                            {fields.map(({ key, name, ...restField }, index) => (
                                <Card
                                    key={key}
                                    title={
                                        <Space size="middle">
                                            <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-bold border border-primary-100">
                                                {index + 1}
                                            </div>
                                            <Text strong className="text-lg">Hero Slide {fields.length > 1 ? index + 1 : ''}</Text>
                                        </Space>
                                    }
                                    extra={
                                        fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                className="hover:bg-red-50 flex items-center gap-2"
                                                icon={<DeleteOutlined />}
                                                onClick={() => {
                                                    remove(name);
                                                    // Re-check validation error if we are down to 1 slide
                                                    if (fields.length <= 2) setSliderError('');
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        )
                                    }
                                    className="shadow-md border-0 rounded-2xl overflow-hidden"
                                    styles={{ body: { padding: '24px' }, header: { background: '#fafafa', borderBottom: '1px solid #f0f0f0' } }}
                                >
                                    <Row gutter={32}>
                                        <Col span={24} lg={12}>
                                            <Title level={5} className="mb-4">Background Media</Title>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'media_type']}
                                                label="Media Type"
                                                rules={[{ required: true }]}
                                            >
                                                <Radio.Group className="w-full">
                                                    <Radio.Button value="video" className="w-1/3 text-center">Video</Radio.Button>
                                                    <Radio.Button value="image" className="w-1/3 text-center">Image</Radio.Button>
                                                    <Radio.Button value="youtube" className="w-1/3 text-center">YouTube</Radio.Button>
                                                </Radio.Group>
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'media_url']}
                                                label="Media Source"
                                                rules={[{ required: true, message: 'Please provide media source' }]}
                                                className="mb-0"
                                            >
                                                <Input
                                                    placeholder="URL (Direct or YouTube) or Upload File"
                                                    prefix={<LinkOutlined />}
                                                    suffix={
                                                        <Upload
                                                            beforeUpload={(file) => handleFileUpload(file, name)}
                                                            showUploadList={false}
                                                            accept={form.getFieldValue(['hero_slides', name, 'media_type']) === 'video' ? 'video/*' : 'image/*'}
                                                            disabled={form.getFieldValue(['hero_slides', name, 'media_type']) === 'youtube'}
                                                        >
                                                            <Button
                                                                type="link"
                                                                size="small"
                                                                icon={<UploadOutlined />}
                                                                disabled={form.getFieldValue(['hero_slides', name, 'media_type']) === 'youtube'}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </Upload>
                                                    }
                                                />
                                            </Form.Item>
                                            <Text type="secondary" size="small" className="mt-1 block">
                                                Supports MP4, WebM, YouTube links or common image formats.
                                            </Text>
                                        </Col>

                                        <Col span={24} lg={12}>
                                            <Title level={5} className="mb-4">Content Overlay</Title>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'title']}
                                                label="Main Heading"
                                                rules={[{ required: true, message: 'Heading is required' }]}
                                            >
                                                <Input placeholder="e.g. Premium Ergonomic Chairs" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'description']}
                                                label="Sub-heading (Optional)"
                                            >
                                                <TextArea rows={2} placeholder="Brief description to display below title" />
                                            </Form.Item>
                                        </Col>

                                        <Col span={24}>
                                            <Divider className="my-6" />
                                            <div className="flex items-center justify-between mb-4">
                                                <Title level={5} className="mb-0">Call to Action (CTA)</Title>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'cta_type']}
                                                    noStyle
                                                >
                                                    <Radio.Group size="small">
                                                        <Radio.Button value="none">None</Radio.Button>
                                                        <Radio.Button value="button">Button</Radio.Button>
                                                        <Radio.Button value="link">Link</Radio.Button>
                                                    </Radio.Group>
                                                </Form.Item>
                                            </div>

                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(prev, curr) =>
                                                    prev.hero_slides?.[name]?.cta_type !== curr.hero_slides?.[name]?.cta_type
                                                }
                                            >
                                                {({ getFieldValue }) => {
                                                    const ctaType = getFieldValue(['hero_slides', name, 'cta_type']);
                                                    if (ctaType === 'none') return null;

                                                    return (
                                                        <div className="bg-primary-50/30 p-6 rounded-xl border border-primary-100/50">
                                                            <Row gutter={24}>
                                                                <Col span={24} md={12}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'button_text']}
                                                                        label={ctaType === 'button' ? "Button Text" : "Link Name"}
                                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                                    >
                                                                        <Input placeholder={ctaType === 'button' ? "e.g. Shop Now" : "e.g. Learn More"} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={24} md={12}>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'button_link']}
                                                                        label={ctaType === 'button' ? "Button Link" : "Redirect URL"}
                                                                        rules={[
                                                                            { required: true, message: 'URL is required' },
                                                                            {
                                                                                validator: (_, value) => {
                                                                                    if (!value) return Promise.resolve();
                                                                                    if (value.startsWith('/')) return Promise.resolve();
                                                                                    try {
                                                                                        new URL(value.startsWith('http') ? value : `https://${value}`);
                                                                                        return Promise.resolve();
                                                                                    } catch (_e) {
                                                                                        return Promise.reject('Please enter a valid URL or relative path');
                                                                                    }
                                                                                }
                                                                            }
                                                                        ]}
                                                                    >
                                                                        <Input placeholder="/products or https://..." prefix={<LinkOutlined />} />
                                                                    </Form.Item>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    );
                                                }}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}

                            {isSlider && (
                                <Button
                                    type="dashed"
                                    onClick={() => add({ media_type: 'video', cta_type: 'button' })}
                                    block
                                    icon={<PlusOutlined />}
                                    className="h-16 border-2 border-dashed border-primary-200 hover:border-primary-400 hover:text-primary-600 rounded-2xl flex items-center justify-center text-lg bg-primary-50/5"
                                >
                                    Add Another Promotional Slide
                                </Button>
                            )}
                        </div>
                    )}
                </Form.List>

                <div className="mt-12 flex justify-end sticky bottom-0 bg-white/95 backdrop-blur-md py-6 border-t z-10 -mx-8 px-8">
                    <ActionButton.Primary
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                        className="w-full md:w-80 h-12 text-lg shadow-lg shadow-primary-200"
                    >
                        Save All Changes
                    </ActionButton.Primary>
                </div>
            </Form>
        </div>
    );
}
