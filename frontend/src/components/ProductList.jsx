export default function ProductList({ products, onAddToCart }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Products</h2>
      {products.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-6xl">{product.icon}</span>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center space-x-1"
                  >
                    <span>➕</span>
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
