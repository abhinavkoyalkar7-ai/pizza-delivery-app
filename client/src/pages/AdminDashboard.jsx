
import React, { useEffect, useState } from 'react';
import API from '../services/api';

const STATUS_OPTIONS = [
  'Order Received',
  'In Kitchen',
  'Sent to Delivery',
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch both live orders and ingredients
  const fetchData = async () => {
    try {
      const [ordersRes, ingredientsRes] = await Promise.all([
        API.get('/orders/admin/orders'),
        API.get('/ingredients'),
      ]);

      setOrders(ordersRes.data);
      setIngredients(ingredientsRes.data);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to load admin data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh orders every 6 seconds
    const interval = setInterval(fetchData, 6000);

    return () => clearInterval(interval);
  }, []);

  // Update order delivery status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, orderStatus: newStatus }
            : o
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to update order status'
      );
    }
  };

  // Update ingredient stock
  const updateStock = async (id, stock) => {
    try {
      await API.put(`/ingredients/${id}/stock`, {
        stock: Number(stock),
      });

      alert('Stock updated successfully!');
      fetchData();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Failed to update stock'
      );
    }
  };

  if (loading) {
    return (
      <p className="text-center py-10 font-bold text-gray-500">
        Loading admin panel...
      </p>
    );
  }

  if (errorMsg) {
    return (
      <p className="text-center py-10 text-red-500 font-bold">
        {errorMsg}
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500">
            Manage incoming orders and ingredient inventory
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
              activeTab === 'orders'
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
              activeTab === 'inventory'
                ? 'bg-red-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ingredient Stock ({ingredients.length})
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' ? (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              No orders placed yet.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">
                      ID: {order._id}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-gray-800">
                    Customer: {order.user?.name || 'Customer'} (
                    {order.user?.email || 'N/A'})
                  </p>

                  <p className="text-xs text-gray-500">
                    Total Amount:{' '}
                    <strong className="text-gray-900">
                      ₹{order.totalAmount}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-600">
                    Update Status:
                  </label>

                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value
                      )
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 bg-white focus:outline-none focus:border-red-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Inventory Tab */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-800">
              Ingredient Inventory
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-700 font-bold text-sm">
                <tr>
                  <th className="p-4">Ingredient</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 text-sm">
                {ingredients.map((ingredient) => (
                  <tr
                    key={ingredient._id}
                    className="hover:bg-gray-50"
                  >
                    {/* Ingredient Name and Image */}
                    <td className="p-4 font-semibold text-gray-800">
                      <div className="flex items-center gap-3">
                        {ingredient.image && (
                          <img
                            src={ingredient.image}
                            alt={ingredient.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        )}

                        <span>{ingredient.name}</span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600 capitalize">
                      {ingredient.category}
                    </td>

                    <td className="p-4 text-gray-600">
                      ₹{ingredient.price}
                    </td>

                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        defaultValue={ingredient.stock}
                        id={`stock-${ingredient._id}`}
                        className="w-24 border border-gray-300 rounded-lg p-2 font-semibold"
                      />
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => {
                          const stockValue =
                            document.getElementById(
                              `stock-${ingredient._id}`
                            ).value;

                          updateStock(
                            ingredient._id,
                            stockValue
                          );
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}