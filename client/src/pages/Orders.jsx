
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';

const STATUS_STEPS = [
  'Order Received',
  'In Kitchen',
  'Sent to Delivery',
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's orders
  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-poll every 5 seconds
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get current progress step
  const getStepIndex = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500 font-bold">
        Loading your orders...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          My Pizza Orders
        </h1>

        <Link
          to="/"
          className="text-sm font-semibold text-red-600 hover:underline"
        >
          + Build Another Pizza
        </Link>
      </div>

      {/* Empty Orders State */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <p className="text-gray-500 mb-4">
            You have not placed any orders yet.
          </p>

          <Link
            to="/"
            className="inline-block bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold"
          >
            Order Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStep = getStepIndex(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                {/* Pizza Banner */}
                <img
                  src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80"
                  alt="Fresh Custom Pizza"
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />

                {/* Order Header */}
                <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6 gap-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Order ID
                    </span>

                    <p className="font-mono text-sm font-semibold text-gray-700">
                      {order._id}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-400">
                      Total Paid
                    </span>

                    <p className="text-lg font-black text-red-600">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="mb-6">
                  <div className="flex items-center justify-between relative">
                    {/* Background Progress Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />

                    {/* Completed Progress Line */}
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                      style={{
                        width: `${
                          (currentStep / (STATUS_STEPS.length - 1)) * 100
                        }%`,
                      }}
                    />

                    {STATUS_STEPS.map((step, idx) => {
                      const isComplete = idx <= currentStep;

                      return (
                        <div
                          key={step}
                          className="relative z-10 flex flex-col items-center"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isComplete
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <span
                            className={`text-xs mt-2 font-medium text-center ${
                              isComplete
                                ? 'text-gray-800 font-bold'
                                : 'text-gray-400'
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pizza Details */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <div className="font-semibold text-gray-700 mb-1">
                    Custom Pizza Selection:
                  </div>

                  {order.items?.map((item, i) => (
                    <div key={i} className="text-xs space-y-1">
                      <p>
                        • <strong>Crust:</strong>{' '}
                        {item.base?.name || 'Base'}
                      </p>

                      <p>
                        • <strong>Sauce:</strong>{' '}
                        {item.sauce?.name || 'Sauce'}
                      </p>

                      <p>
                        • <strong>Cheese:</strong>{' '}
                        {item.cheese?.name || 'Cheese'}
                      </p>

                      {item.veggies && item.veggies.length > 0 && (
                        <p>
                          • <strong>Toppings:</strong>{' '}
                          {item.veggies
                            .map((v) => v.name)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}