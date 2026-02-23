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
                <p className="text-gray-500 text-sm leading-relaxed text-center mb-10 max-w-2xl mx-auto">
                    V Care Services (Private) Limited is committed to protecting the privacy of customers who access our website <strong className="text-gray-700">www.vcaresl.com</strong>.
                </p>

                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">

                    <Section icon={Database} color="bg-blue-500" title="Information We Collect">
                        <p className="text-sm text-gray-500 mb-3">When placing an order through our website, we may collect personal information including:</p>
                        <BulletList items={[
                            'Name',
                            'Contact number',
                            'Delivery address',
                            'Email address',
                            'Payment details required to complete transactions',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Lock} color="bg-green-500" title="Payment Security">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800 leading-relaxed">
                            All online payments made through our website are securely processed via the <strong>PayHere payment gateway</strong>. V Care Services does <strong>not store or have access</strong> to your credit or debit card details.
                        </div>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Eye} color="bg-purple-500" title="How We Use Your Information">
                        <p className="text-sm text-gray-500 mb-3">Customer information is collected solely for:</p>
                        <BulletList items={[
                            'Order processing',
                            'Delivery coordination',
                            'Customer support',
                            'Internal record keeping',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Users} color="bg-orange-500" title="Information Sharing">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We <strong>do not sell or share customer information</strong> with third parties except where required by law or for delivery and logistics purposes. Appropriate security measures are implemented to protect customer data from unauthorized access or misuse.
                        </p>
                    </Section>

                    <div className="mt-2 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                        By using our website and making purchases, you consent to the collection and use of your information in accordance with this Privacy Policy.
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
