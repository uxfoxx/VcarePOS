import { Link } from 'react-router-dom';
import { FileText, PackageCheck, Truck, AlertTriangle, Globe, Copyright } from 'lucide-react';

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

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-950 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-3 tracking-tight">Terms & Conditions</h1>
                    <p className="text-gray-400 text-base font-medium">V Care Services (Private) Limited · www.vcaresl.com</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

                {/* Intro */}
                <p className="text-gray-500 text-sm leading-relaxed text-center mb-10 max-w-2xl mx-auto">
                    Welcome to <strong className="text-gray-700">www.vcaresl.com</strong> operated by V Care Services (Private) Limited. By accessing this website and purchasing products through our platform, you agree to be bound by the following Terms & Conditions.
                </p>

                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">

                    <Section icon={PackageCheck} color="bg-primary-600" title="Orders & Availability">
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            All product orders are subject to availability and confirmation.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Customers are responsible for ensuring that the delivery details provided at the time of purchase are <strong>accurate and complete</strong>. Delivery timelines provided are estimates and may vary depending on location, availability, and logistical factors.
                        </p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={AlertTriangle} color="bg-amber-500" title="Limitation of Liability">
                        <p className="text-sm text-gray-500 mb-3">V Care Services shall not be held responsible for:</p>
                        <BulletList items={[
                            'Delays due to unforeseen logistical issues',
                            'Customer absence during delivery',
                            'Damages caused after successful delivery and acceptance of the product',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Truck} color="bg-green-500" title="Ownership & Delivery">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Ownership and risk of the product shall pass to the customer upon <strong>delivery and acceptance</strong>. V Care Services reserves the right to refuse or cancel any order due to pricing errors, stock limitations, or unforeseen circumstances.
                        </p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Copyright} color="bg-purple-500" title="Intellectual Property">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            All content on this website including images, product descriptions, and branding remains the <strong>property of V Care Services</strong> and may not be reproduced without prior written consent.
                        </p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Globe} color="bg-slate-600" title="Governing Law">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Use of this website and any disputes arising from it shall be governed by the laws of the <strong>Democratic Socialist Republic of Sri Lanka</strong>.
                        </p>
                    </Section>

                    <div className="mt-2 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                        By accessing and purchasing from this website, you agree to these Terms & Conditions.
                    </div>
                </div>

                {/* Footer nav */}
                <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
                    <Link to="/refund-policy" className="text-primary-600 hover:underline font-medium">Refund & Return Policy</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/privacy-policy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/" className="text-gray-500 hover:text-gray-900 font-medium">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
