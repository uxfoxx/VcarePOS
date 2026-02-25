import React from 'react';
import { FileText, Truck, AlertTriangle, Globe, Copyright, PackageCheck, RotateCcw } from 'lucide-react';
import { PolicySection, PolicyBulletList } from './PolicyShared';

const TermsContent = ({ isModal = false }) => {
    return (
        <div className="space-y-6">
            <p className="text-gray-500 text-sm leading-relaxed text-center mb-10 max-w-2xl mx-auto">
                Welcome to <strong>Vcare</strong>. By accessing our website and purchasing our products, you agree to the following terms.
            </p>

            <PolicySection icon={Globe} color="bg-primary-600" title="Website Usage" isModal={isModal}>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'You must be at least 18 years old to make purchases.',
                        'You agree to provide accurate billing & delivery details.',
                        'Unauthorized or fraudulent use of the website is prohibited.',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={PackageCheck} color="bg-blue-500" title="Product Information" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed mb-3`}>
                    We strive to ensure all product details, images, and specifications are accurate. However, minor variations may occur due to screen display, materials, or manufacturing updates.
                </p>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed font-semibold`}>
                    Prices are subject to change without prior notice.
                </p>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={FileText} color="bg-green-600" title="Orders & Payments" isModal={isModal}>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'Orders are confirmed only after payment verification.',
                        'We reserve the right to cancel orders due to stock issues, pricing errors, or suspected fraud.',
                        'Payments are processed via secure third-party gateways.',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={Truck} color="bg-amber-600" title="Shipping & Delivery" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed mb-3`}>
                    Delivery timelines vary based on product availability and location.
                </p>
                <p className={`${isModal ? "text-xs" : "text-gray-400"} italic`}>
                    Delays caused by courier partners, weather, or external factors are beyond our control.
                </p>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={RotateCcw} color="bg-purple-600" title="Returns & Warranty" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed mb-3`}>
                    All returns are governed by our <strong>Refund & Return Policy</strong>.
                </p>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'We do not accept returns for change of mind.',
                        'Warranty covers manufacturing defects only.',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={Copyright} color="bg-orange-600" title="Intellectual Property" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>
                    All website content — including logos, images, designs, and text — belongs to <strong>Vcare</strong> and may not be reused without permission.
                </p>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={AlertTriangle} color="bg-red-600" title="Other Terms" isModal={isModal}>
                <div className="space-y-6">
                    <div>
                        <h3 className={`${isModal ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-2`}>Limitation of Liability</h3>
                        <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>Vcare is not liable for indirect or consequential damages arising from product use, delays, or service interruptions.</p>
                    </div>
                    <div>
                        <h3 className={`${isModal ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-2`}>Amendments</h3>
                        <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>We reserve the right to update these Terms at any time. Continued website use implies acceptance.</p>
                    </div>
                </div>
            </PolicySection>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center italic">By purchasing, you agree to these Terms & Conditions.</p>
            </div>
        </div>
    );
};

export default TermsContent;
