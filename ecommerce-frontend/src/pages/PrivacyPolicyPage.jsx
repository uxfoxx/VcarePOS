import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Lock, Users, Eye } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const Section = ({ icon: Icon, color, title, children }) => (
    <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="ml-12">{children}</div>
    </div>
);

const BulletList = ({ items }) => (
    <ul className="space-y-2">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0 mt-2" />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-3 tracking-tight">Privacy Policy</h1>
                    <p className="text-slate-300 text-base font-medium">V Care Services (Private) Limited · www.vcaresl.com</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

                {/* Intro */}
                <div className="text-center mb-10 max-w-2xl mx-auto space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        At <strong>Vcare</strong>, we are committed to protecting your privacy and safeguarding your personal information.
                    </p>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        This policy explains how we collect, use, and protect your data when you use our website or make purchases.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">

                    <Section icon={Database} color="bg-blue-500" title="Information We Collect">
                        <p className="text-sm text-gray-500 mb-3">We may collect the following information:</p>
                        <BulletList items={[
                            'Name',
                            'Phone number',
                            'Email address',
                            'Billing & delivery address',
                            'Payment details (processed securely via gateway providers)',
                            'IP address & device information',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Eye} color="bg-purple-500" title="How We Use Your Information">
                        <p className="text-sm text-gray-500 mb-3">Your information is used to:</p>
                        <BulletList items={[
                            'Process and deliver orders',
                            'Provide customer support',
                            'Send order updates',
                            'Improve our products & services',
                            'Share promotional offers (if opted-in)',
                            'Prevent fraud and unauthorized transactions',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Users} color="bg-orange-500" title="Information Sharing">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed italic">
                                We do not sell or trade your personal data.
                            </p>
                            <p className="text-sm text-gray-500 mb-1">Information may only be shared with:</p>
                            <BulletList items={[
                                'Courier & logistics partners',
                                'Payment gateway providers',
                                'IT & website service providers',
                            ]} />
                            <p className="text-xs text-gray-400 mt-2">All partners are obligated to maintain confidentiality.</p>
                        </div>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Lock} color="bg-green-500" title="Payment Security">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800 leading-relaxed">
                            Online payments are processed via secure, encrypted third-party payment gateways. <strong>Vcare does not store full card or banking details.</strong>
                        </div>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={ShieldCheck} color="bg-slate-700" title="Cookies & Policy Updates">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Cookies</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">Our website may use cookies to enhance browsing experience and analyze traffic. Users may disable cookies via browser settings.</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Policy Updates</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">We may update this policy periodically. Changes will be published on this page.</p>
                            </div>
                        </div>
                    </Section>

                    <div className="mt-12 pt-10 border-t border-gray-100 text-center">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Contact</h3>
                        <p className="text-primary-600 font-medium">info@vcaresl.com</p>
                    </div>
                </div>

                {/* Footer nav */}
                <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
                    <Link to="/refund-policy" className="text-primary-600 hover:underline font-medium">Refund & Return Policy</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/terms" className="text-primary-600 hover:underline font-medium">Terms & Conditions</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/" className="text-gray-500 hover:text-gray-900 font-medium">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
