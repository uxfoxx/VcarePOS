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
                    <div className="text-sm text-amber-800 leading-relaxed">
                        <p className="mb-2">Thank you for shopping at <strong>Vcare</strong>. We appreciate your trust in our products and are committed to delivering high-quality office furniture and ergonomic solutions.</p>
                        <p>Please read our return policy carefully before making a purchase.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">

                    <Section icon={XCircle} color="bg-red-500" title="Returns">
                        <p className="text-sm text-gray-600 mb-4 italic">We do not accept returns for change of mind, wrong selection, or personal preference once the order has been confirmed and delivered.</p>
                        <p className="text-sm text-gray-500 mb-3 font-semibold">Returns are accepted only under reasonable and valid circumstances, such as:</p>
                        <BulletList
                            items={[
                                'Manufacturing defects',
                                'Warranty claims',
                                'Damaged items received at delivery',
                                'Incorrect product delivered',
                            ]}
                        />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={ShieldCheck} color="bg-primary-600" title="Eligibility for Return">
                        <p className="text-sm text-gray-500 mb-3">To be eligible for a return, the item must be:</p>
                        <BulletList
                            items={[
                                'Reported within 24 hours of delivery',
                                'Unused and in original condition',
                                'In original packaging',
                                'Supported with photos/videos as proof',
                            ]}
                        />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={Clock} color="bg-purple-500" title="Refunds">
                        <p className="text-sm text-gray-600 mb-3">Once we receive and inspect the returned item, we will notify you regarding the approval status.</p>
                        <p className="text-sm text-gray-600 mb-3">If approved, refunds will be processed to the original payment method within <strong>7–14 working days.</strong></p>
                        <div className="mt-4 bg-gray-50 rounded-xl p-4">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Please note:</p>
                            <BulletList
                                items={[
                                    'Delivery charges are non-refundable',
                                    'Installation/service charges (if any) are non-refundable',
                                ]}
                            />
                        </div>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={CheckCircle2} color="bg-green-500" title="Exchanges / Replacements">
                        <p className="text-sm text-gray-600 mb-4 italic">We do not offer exchanges for change of mind or product upgrades.</p>
                        <p className="text-sm text-gray-500 mb-3 font-semibold">Exchanges are only applicable if:</p>
                        <BulletList
                            items={[
                                'The product has a manufacturing defect',
                                'The wrong item was delivered',
                                'The item was damaged during delivery',
                            ]}
                        />
                        <p className="text-sm text-gray-600 mt-4">In such cases, we will arrange a repair or replacement based on warranty terms.</p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={AlertCircle} color="bg-gray-700" title="Non-Returnable Items">
                        <p className="text-sm text-gray-500 mb-3">The following items are strictly non-returnable:</p>
                        <BulletList
                            icon={XCircle}
                            iconClass="text-red-400"
                            items={[
                                'Customized or made-to-order furniture',
                                'Used products',
                                'Products damaged due to misuse',
                                'Clearance / promotional items',
                            ]}
                        />
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={ShieldCheck} color="bg-blue-600" title="Warranty Returns">
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">Electric components (such as smart desk motors, control panels, and mechanisms) are covered under the product warranty period specified at purchase.</p>
                        <p className="text-sm text-gray-600">Warranty claims will be handled via <strong>repair or part replacement</strong> — not cash refunds.</p>
                    </Section>

                    <hr className="border-gray-100 mb-10" />

                    <Section icon={RotateCcw} color="bg-orange-600" title="Return Shipping & Processing">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Shipping Costs</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">If the return is due to our error or a verified defect, Vcare will bear the return logistics cost. If inspection finds no fault, return transport costs will be charged to the customer.</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-1">Processing Time</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">Return inspections and resolutions are completed within <strong>7–10 working days</strong> after product collection.</p>
                            </div>
                        </div>
                    </Section>

                    <div className="mt-12 pt-10 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
                                <p className="text-sm text-gray-600 mb-4">For return or warranty requests:</p>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex gap-2"><strong>Phone / WhatsApp:</strong> +94 76 76 75 044</li>
                                    <li className="flex gap-2"><strong>Email:</strong> info@vcaresl.com</li>
                                    <li className="flex gap-2"><strong>Website:</strong> www.vcaresl.com</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-center text-center">
                                <p className="text-xs text-gray-400 mb-1">By making a purchase through our website,</p>
                                <p className="text-xs text-gray-400 italic">you agree to this Refund & Return Policy.</p>
                            </div>
                        </div>
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
