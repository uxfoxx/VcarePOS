import React from 'react';
import { ShieldCheck, Database, Lock, Users, Eye } from 'lucide-react';
import { PolicySection, PolicyBulletList } from './PolicyShared';

const PrivacyPolicyContent = ({ isModal = false }) => {
    return (
        <div className="space-y-6">
            <div className="text-center mb-10 max-w-2xl mx-auto space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                    At <strong>Vcare</strong>, we are committed to protecting your privacy and safeguarding your personal information.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                    This policy explains how we collect, use, and protect your data when you use our website or make purchases.
                </p>
            </div>

            <PolicySection icon={Database} color="bg-blue-500" title="Information We Collect" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-500 mb-3`}>We may collect the following information:</p>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'Name',
                        'Phone number',
                        'Email address',
                        'Billing & delivery address',
                        'Payment details (processed securely via gateway providers)',
                        'IP address & device information',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={Eye} color="bg-purple-500" title="How We Use Data" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-500 mb-3`}>Your information is used to:</p>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'Process and deliver orders',
                        'Provide customer support',
                        'Send order updates',
                        'Improve our products & services',
                        'Prevent fraud and unauthorized transactions',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={Users} color="bg-orange-500" title="Information Sharing" isModal={isModal}>
                <div className="space-y-4">
                    <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed italic`}>
                        We do not sell or trade your personal data.
                    </p>
                    <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-500 mb-1`}>Information may only be shared with:</p>
                    <PolicyBulletList
                        isModal={isModal}
                        items={[
                            'Courier & logistics partners',
                            'Payment gateway providers',
                            'IT & website service providers',
                        ]}
                    />
                </div>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={Lock} color="bg-green-500" title="Payment Security" isModal={isModal}>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800 leading-relaxed">
                    <p className={isModal ? "text-xs" : "text-sm"}>
                        Online payments are processed via secure, encrypted third-party payment gateways. <strong>Vcare does not store full card or banking details.</strong>
                    </p>
                </div>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={ShieldCheck} color="bg-slate-700" title="Cookies & Updates" isModal={isModal}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className={`${isModal ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-2`}>Cookies</h3>
                        <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>Our website may use cookies to enhance browsing experience and analyze traffic. Users may disable cookies via browser settings.</p>
                    </div>
                    <div>
                        <h3 className={`${isModal ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-2`}>Updates</h3>
                        <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>We may update this policy periodically. Changes will be published on this page.</p>
                    </div>
                </div>
            </PolicySection>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center italic">At Vcare, we are committed to protecting your privacy.</p>
            </div>
        </div>
    );
};

export default PrivacyPolicyContent;
