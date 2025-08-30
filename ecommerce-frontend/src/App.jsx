import React from 'react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Layout/Header'
import { Footer } from './components/Layout/Footer'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { OrdersPage } from './pages/OrdersPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { loginSuccess } from './features/auth/authSlice'

function App() {
  const dispatch = useDispatch()

  // Check for existing customer session on app load
  useEffect(() => {
    const savedCustomer = localStorage.getItem('ecommerce_customer')
    if (savedCustomer) {
      try {
        const customer = JSON.parse(savedCustomer)
        dispatch(loginSuccess({ customer }))
      } catch (error) {
        console.error('Error parsing saved customer data:', error)
        localStorage.removeItem('ecommerce_customer')
      }
    }
  }, [dispatch])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App