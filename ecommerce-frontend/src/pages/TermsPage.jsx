import { Link } from 'react-router-dom';
import { FileText, PackageCheck, Truck, AlertTriangle, Globe, Copyright, CheckCircle2, RotateCcw } from 'lucide-react';

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
                    Welcome to <strong>Vcare</strong>. By accessing our website and purchasing our products, you agree to the following terms.
                </p>

                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">

                    <Section icon={Globe} color="bg-primary-600" title="Website Usage">
                        <BulletList items={[
                            'You must be at least 18 years old to make purchases.',
                            'You agree to provide accurate billing & delivery details.',
                            'Unauthorized or fraudulent use of the website is prohibited.',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={CheckCircle2 || PackageCheck} color="bg-blue-500" title="Product Information">
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            We strive to ensure all product details, images, and specifications are accurate. However, minor variations may occur due to screen display, materials, or manufacturing updates.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed font-semibold">
                            Prices are subject to change without prior notice.
                        </p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={FileText} color="bg-green-600" title="Orders & Payments">
                        <BulletList items={[
                            'Orders are confirmed only after payment verification.',
                            'We reserve the right to cancel orders due to stock issues, pricing errors, or suspected fraud.',
                            'Payments are processed via secure third-party gateways.',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Truck} color="bg-amber-600" title="Shipping & Delivery">
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Delivery timelines vary based on product availability and location.
                        </p>
                        <p className="text-sm text-gray-400 italic">
                            Delays caused by courier partners, weather, or external factors are beyond our control.
                        </p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={RotateCcw || FileText} color="bg-purple-600" title="Returns & Warranty">
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            All returns are governed by our <strong>Refund & Return Policy</strong>.
                        </p>
                        <BulletList items={[
                            'We do not accept returns for change of mind.',
                            'Warranty covers manufacturing defects only.',
                        ]} />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Copyright} color="bg-orange-600" title="Intellectual Property">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            All website content — including logos, images, designs, and text — belongs to <strong>Vcare</strong> and may not be reused without permission.
                        </p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={AlertTriangle} color="bg-red-600" title="Other Terms">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Limitation of Liability</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">Vcare is not liable for indirect or consequential damages arising from product use, delays, or service interruptions.</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2">Amendments</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">We reserve the right to update these Terms at any time. Continued website use implies acceptance.</p>
                            </div>
                        </div>
                    </Section>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400 italic">
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
