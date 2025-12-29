export default function Cart({ items, onRemove, onQuantityChange, onCheckout }) {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h2>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <p className="text-gray-500">Start shopping to add items to your cart!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-600 text-sm">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 font-semibold min-w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-24">
                      <p className="font-semibold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded transition"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition mb-3"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
