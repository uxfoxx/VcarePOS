import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import RefundPolicyContent from '../components/Ecommerce/Policies/RefundPolicyContent';

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
                    {/* <p className="text-primary-100 text-base font-medium">V Care Services (Private) Limited · www.vcaresl.com</p> */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">
                    <RefundPolicyContent isModal={false} />
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
