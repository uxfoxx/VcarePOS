import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import TermsContent from '../components/Ecommerce/Policies/TermsContent';

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
                    {/* <p className="text-gray-400 text-base font-medium">V Care Services (Private) Limited · www.vcaresl.com</p> */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-12">
                    <TermsContent isModal={false} />
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
