import React from 'react';
import { AlertCircle, XCircle, ShieldCheck, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { PolicySection, PolicyBulletList } from './PolicyShared';

const RefundPolicyContent = ({ isModal = false }) => {
    return (
        <div className="space-y-6">
            <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3 ${isModal ? "mb-6" : "mb-10"}`}>
                <AlertCircle className={`flex-shrink-0 text-amber-600 ${isModal ? "w-4 h-4 mt-0.5" : "w-5 h-5 mt-0.5"}`} />
                <div className={`${isModal ? "text-[11px]" : "text-sm"} text-amber-800 leading-relaxed`}>
                    <p className="mb-2">Thank you for shopping at <strong>Vcare</strong>. We appreciate your trust in our products and are committed to delivering high-quality office furniture and ergonomic solutions.</p>
                    <p>Please read our return policy carefully before making a purchase.</p>
                </div>
            </div>

            <PolicySection icon={XCircle} color="bg-red-500" title="Returns" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-gray-600 text-sm"} mb-4 italic`}>We do not accept returns for change of mind, wrong selection, or personal preference once the order has been confirmed and delivered.</p>
                <p className={`${isModal ? "text-xs" : "text-gray-500 text-sm"} mb-3 font-semibold`}>Returns are accepted only under reasonable and valid circumstances, such as:</p>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'Manufacturing defects',
                        'Warranty claims',
                        'Damaged items received at delivery',
                        'Incorrect product delivered',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={ShieldCheck} color="bg-primary-600" title={isModal ? "Eligibility" : "Eligibility for Return"} isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-gray-500 text-sm"} mb-3`}>To be eligible for a return, the item must be:</p>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'Reported within 24 hours of delivery',
                        'Unused and in original condition',
                        'In original packaging',
                        'Supported with photos/videos as proof',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={Clock} color="bg-purple-500" title="Refunds" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-gray-600 text-sm"} mb-3`}>Once we receive and inspect the returned item, we will notify you regarding the approval status.</p>
                <p className={`${isModal ? "text-xs" : "text-gray-600 text-sm"} mb-3`}>If approved, refunds will be processed to the original payment method within <strong>7–14 working days.</strong></p>
                <div className={`mt-4 bg-gray-50 rounded-xl p-4`}>
                    <p className={`${isModal ? "text-[10px]" : "text-xs"} text-gray-500 font-bold uppercase tracking-wider mb-2`}>Please note:</p>
                    <PolicyBulletList
                        isModal={isModal}
                        items={[
                            'Delivery charges are non-refundable',
                            'Installation/service charges (if any) are non-refundable',
                        ]}
                    />
                </div>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={CheckCircle2} color="bg-green-500" title={isModal ? "Exchanges" : "Exchanges / Replacements"} isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-gray-600 text-sm font-medium mb-4 italic"} ${!isModal && "italic"}`}>We do not offer exchanges for change of mind or product upgrades.</p>
                <p className={`${isModal ? "text-xs" : "text-gray-500 text-sm"} mb-3 font-semibold`}>Exchanges are only applicable if:</p>
                <PolicyBulletList
                    isModal={isModal}
                    items={[
                        'The product has a manufacturing defect',
                        'The wrong item was delivered',
                        'The item was damaged during delivery',
                    ]}
                />
                <p className={`${isModal ? "text-xs" : "text-gray-600 text-sm"} mt-4`}>In such cases, we will arrange a repair or replacement based on warranty terms.</p>
            </PolicySection>

            <hr className="border-gray-100" />

            <PolicySection icon={AlertCircle} color="bg-gray-700" title={isModal ? "Non-Returnable" : "Non-Returnable Items"} isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-gray-500 text-sm"} mb-3`}>The following items are strictly non-returnable:</p>
                <PolicyBulletList
                    isModal={isModal}
                    icon={XCircle}
                    iconClass="text-red-400"
                    items={[
                        'Customized or made-to-order furniture',
                        'Used products',
                        'Products damaged due to misuse',
                        'Clearance / promotional items',
                    ]}
                />
            </PolicySection>

            <hr className="border-gray-100 mb-10" />

            <PolicySection icon={ShieldCheck} color="bg-blue-600" title="Warranty Returns" isModal={isModal}>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 mb-3 leading-relaxed`}>Electric components (such as smart desk motors, control panels, and mechanisms) are covered under the product warranty period specified at purchase.</p>
                <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600`}>Warranty claims will be handled via <strong>repair or part replacement</strong> — not cash refunds.</p>
            </PolicySection>

            <hr className="border-gray-100 mb-10" />

            <PolicySection icon={RotateCcw} color="bg-orange-600" title="Return Shipping & Processing" isModal={isModal}>
                <div className="space-y-4">
                    <div>
                        <h3 className={`${isModal ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-1`}>Shipping Costs</h3>
                        <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>If the return is due to our error or a verified defect, Vcare will bear the return logistics cost. If inspection finds no fault, return transport costs will be charged to the customer.</p>
                    </div>
                    <div>
                        <h3 className={`${isModal ? "text-xs" : "text-sm"} font-bold text-gray-900 mb-1`}>Processing Time</h3>
                        <p className={`${isModal ? "text-xs" : "text-sm"} text-gray-600 leading-relaxed`}>Return inspections and resolutions are completed within <strong>7–10 working days</strong> after product collection.</p>
                    </div>
                </div>
            </PolicySection>

            <div className="mt-12 pt-10 border-t border-gray-100">
                <div className={`grid grid-cols-1 ${isModal ? "" : "md:grid-cols-2"} gap-8`}>
                    <div>
                        <h3 className={`${isModal ? "text-sm" : "text-lg"} font-bold text-gray-900 mb-4`}>Contact Us</h3>
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
    );
};

export default RefundPolicyContent;
