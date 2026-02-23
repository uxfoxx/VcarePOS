import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const Section = ({ icon: Icon, color, title, children }) => (
    <div className="mb-10">
        <div className={`flex items-center gap-3 mb-4`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="ml-12">{children}</div>
    </div>
);

// eslint-disable-next-line no-unused-vars
const BulletList = ({ items, icon: Icon = CheckCircle2, iconClass = 'text-primary-500' }) => (
    <ul className="space-y-2">
        {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm leading-relaxed">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconClass}`} />
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <RotateCcw className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black mb-3 tracking-tight">Refund & Return Policy</h1>
                    <p className="text-primary-100 text-base font-medium">V Care Services (Private) Limited · www.vcaresl.com</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

                {/* Intro */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 leading-relaxed">
                        All products sold by V Care Services are <strong>considered final upon confirmation of order and successful payment.</strong> Please review this policy carefully before making a purchase.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">

                    <Section icon={XCircle} color="bg-red-500" title="We Do Not Accept Returns For">
                        <BulletList
                            icon={XCircle}
                            iconClass="text-red-400"
                            items={[
                                'Change of mind after purchase',
                                'Incorrect selection of product, size, or colour by the customer',
                                'Cancellation of order after confirmation',
                                'Delays caused due to customer unavailability at the time of delivery',
                            ]}
                        />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={CheckCircle2} color="bg-green-500" title="Exceptions — When We Accept Returns">
                        <p className="text-sm text-gray-500 mb-3">Refunds or replacements will only be considered under the following conditions:</p>
                        <BulletList
                            items={[
                                'The product delivered is damaged at the time of delivery',
                                'The product delivered is defective due to a manufacturing fault',
                                'An incorrect item has been delivered by V Care Services',
                            ]}
                        />
                        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                            <strong>Important:</strong> Any damages or defects must be reported within <strong>24 hours of delivery</strong> along with photographic evidence.
                        </div>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={ShieldCheck} color="bg-primary-600" title="What Happens After a Verified Claim">
                        <p className="text-sm text-gray-500 mb-3">If the claim is verified by our team, we will proceed with either:</p>
                        <BulletList
                            items={[
                                'A replacement of the product, or',
                                'A full refund (if replacement is not possible)',
                            ]}
                        />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Clock} color="bg-purple-500" title="Refund Processing">
                        <BulletList
                            items={[
                                'Full refunds (where applicable) will be processed through the original payment method via the PayHere payment gateway.',
                                'Partial refunds, if approved under exceptional circumstances, will be processed manually via bank transfer in accordance with PayHere policies.',
                                'Refunds may take 7–14 working days to reflect depending on your bank.',
                            ]}
                        />
                    </Section>

                    <div className="mt-2 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                        By making a purchase through our website, you agree to this Refund & Return Policy.
                    </div>
                </div>

                {/* Footer nav */}
                <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
                    <Link to="/privacy-policy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/terms" className="text-primary-600 hover:underline font-medium">Terms & Conditions</Link>
                    <span className="text-gray-300">|</span>
                    <Link to="/" className="text-gray-500 hover:text-gray-900 font-medium">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
