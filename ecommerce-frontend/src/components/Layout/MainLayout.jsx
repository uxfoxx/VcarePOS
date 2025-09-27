import React, { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useLocation } from 'react-router-dom'

const MainLayout = ({ children }) => {
    const locataion = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [locataion.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            {children}
            <Footer />
        </div>
    )
}

export default MainLayout