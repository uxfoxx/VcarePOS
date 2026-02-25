import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const PolicySection = ({ icon: Icon, color, title, children, isModal = false }) => {
    return (
        <div className={isModal ? "mb-6" : "mb-10"}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="ml-12">{children}</div>
        </div>
    );
};

export const PolicyBulletList = ({ items, icon: Icon = CheckCircle2, iconClass = 'text-primary-500', isModal = false }) => {
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm leading-relaxed">
                    <Icon className={`flex-shrink-0 ${iconClass} ${isModal ? "w-3.5 h-3.5 mt-0.5" : "w-4 h-4 mt-0.5"}`} />
                    <span className={isModal ? "text-[11px]" : "text-sm"}>{item}</span>
                </li>
            ))}
        </ul>
    );
};
