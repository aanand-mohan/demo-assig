import React from 'react'

const PaymentSuccess = ({ onContinue }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg
                    className="w-10 h-10 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                    ></path>
                </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-8 text-lg">
                Thank you for your order. We've received your payment.
            </p>

            <button
                onClick={onContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
            >
                Continue Shopping
            </button>
        </div>
    )
}

export default PaymentSuccess
