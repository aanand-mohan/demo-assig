export default function Header({ cartCount, onCartClick }) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🛍</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">E-Store</h1>
        </div>
        
        <button
          onClick={onCartClick}
          className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
        >
          <span className="text-xl">🛒</span>
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center transform translate-x-2 -translate-y-2">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
