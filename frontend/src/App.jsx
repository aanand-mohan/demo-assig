import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/Header'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import Checkout from './pages/Checkout'
import PaymentSuccess from './components/PaymentSuccess'
import { BASE_URL } from './config/app'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/products`)
        setProducts(response.data)
        setError(null)
      } catch (err) {
        setError('Failed to load products')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ))
    }
  }

  const handleCheckout = () => {
    setShowCart(false)
    setShowCheckout(true)
  }

  const handleBackToShop = () => {
    setShowCart(false)
    setShowCheckout(false)
    setShowSuccess(false)
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  // Check for payment success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      setCart([])
      localStorage.removeItem('cart')
      setShowSuccess(true)
      // Clean up URL without reload immediately or keep it for the state?
      // We keep the state 'showSuccess' so UI renders. Cleaning URL is done in handleBackToShop or we can do it here silently.
    }
  }, [])

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={0} onCartClick={() => setShowCart(!showCart)} />
        <div className="container mx-auto px-4 py-8">
          <PaymentSuccess onContinue={handleBackToShop} />
        </div>
      </div>
    )
  }

  if (showCheckout) {
    return <Checkout cart={cart} onBack={handleBackToShop} setCart={setCart} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cart.length} onCartClick={() => setShowCart(!showCart)} />

      {showCart ? (
        <Cart
          items={cart}
          onRemove={removeFromCart}
          onQuantityChange={updateQuantity}
          onCheckout={handleCheckout}
        />
      ) : (
        <main className="container mx-auto px-4 py-8">
          {loading && (
            <div className="flex justify-center items-center min-h-screen">
              <div className="text-xl text-gray-600">Loading products...</div>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {!loading && !error && (
            <ProductList products={products} onAddToCart={addToCart} />
          )}
        </main>
      )}
    </div>
  )
}

export default App
