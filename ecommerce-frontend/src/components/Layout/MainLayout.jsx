import React, { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { syncUserCart } from '../../store/slices/cartSlice'

const MainLayout = ({ children }) => {
    const locataion = useLocation();
    const dispatch = useDispatch();
    const { customer } = useSelector(state => state.auth);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [locataion.pathname]);

    // Sync cart when user changes (login/logout)
    useEffect(() => {
        dispatch(syncUserCart(customer?.id || null));
    }, [customer?.id, dispatch]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Header />
            {children}
            <Footer />
        </div>
    )
}

export default MainLayout