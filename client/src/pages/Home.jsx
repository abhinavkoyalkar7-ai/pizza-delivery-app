import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [ingredients, setIngredients] = useState([]);
  const [preMadePizzas, setPreMadePizzas] = useState([]);
  const [base, setBase] = useState(null);
  const [sauce, setSauce] = useState(null);
  const [cheese, setCheese] = useState(null);
  const [veggies, setVeggies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [testModalData, setTestModalData] = useState(null);
  const [activePayAmount, setActivePayAmount] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch ingredients and pre-made signature pizzas
  useEffect(() => {
    Promise.all([API.get('/ingredients'), API.get('/pizzas').catch(() => ({ data: [] }))])
      .then(([{ data: ingData }, { data: pizzaData }]) => {
        setIngredients(ingData);
        setPreMadePizzas(pizzaData);

        const bases = ingData.filter((i) => i.category === 'base');
        const sauces = ingData.filter((i) => i.category === 'sauce');
        const cheeses = ingData.filter((i) => i.category === 'cheese');

        if (bases.length > 0) setBase(bases[0]);
        if (sauces.length > 0) setSauce(sauces[0]);
        if (cheeses.length > 0) setCheese(cheeses[0]);
      })
      .catch((err) => {
        console.error('API Error:', err);
        setErrorMsg(err.response?.data?.message || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Add or remove vegetables
  const toggleVeggie = (v) => {
    if (veggies.find((item) => item._id === v._id)) {
      setVeggies(veggies.filter((item) => item._id !== v._id));
    } else {
      setVeggies([...veggies, v]);
    }
  };

  // Calculate custom pizza total price
  const totalPrice =
    (base?.price || 0) +
    (sauce?.price || 0) +
    (cheese?.price || 0) +
    veggies.reduce((sum, v) => sum + v.price, 0);

  // Handle custom pizza checkout
  const handleCheckout = async () => {
    if (!user) return navigate('/login');

    try {
      const { data } = await API.post('/orders/checkout', {
        items: [
          {
            base: base?._id,
            sauce: sauce?._id,
            cheese: cheese?._id,
            veggies: veggies.map((v) => v._id),
            itemPrice: totalPrice,
            price: totalPrice,
          },
        ],
        totalAmount: totalPrice,
      });

      setActivePayAmount(totalPrice);
      setTestModalData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing order');
    }
  };

  // Quick Order for Ready-Made Signature Pizzas
  const handlePreMadeOrder = async (pizza) => {
    if (!user) return navigate('/login');

    try {
      // Find fallback base, sauce, cheese so inventory decrements properly
      const defaultBase = ingredients.find((i) => i.category === 'base');
      const defaultSauce = ingredients.find((i) => i.category === 'sauce');
      const defaultCheese = ingredients.find((i) => i.category === 'cheese');

      const { data } = await API.post('/orders/checkout', {
        items: [
          {
            base: defaultBase?._id,
            sauce: defaultSauce?._id,
            cheese: defaultCheese?._id,
            veggies: [],
            itemPrice: pizza.price,
            price: pizza.price,
          },
        ],
        totalAmount: pizza.price,
      });

      setActivePayAmount(pizza.price);
      setTestModalData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing signature pizza order');
    }
  };

  // Handle payment resolution modal
  const handlePaymentResolution = async (isSuccess) => {
    if (!testModalData) return;

    if (!isSuccess) {
      alert('Payment cancelled by user');
      setTestModalData(null);
      return;
    }

    try {
      await API.post('/orders/verify-payment', {
        orderId: testModalData.order._id,
        razorpay_order_id: testModalData.razorpayOrder.id,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'simulated_test_signature',
      });

      setTestModalData(null);
      alert('Payment Successful! Your pizza is being prepared.');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Payment verification failed');
    }
  };

  if (loading) {
    return (
      <p className="text-center py-16 font-bold text-gray-500 animate-pulse">
        Loading fresh ingredients & pizzas...
      </p>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-bold">Failed to load ingredients: {errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* --- 1. READY-MADE PIZZAS SECTION --- */}
      {preMadePizzas.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                🍕 Chef's Signature Pizzas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Order our classic hand-tossed recipes in one click
              </p>
            </div>
            <span className="hidden sm:inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
              Ready to Bake
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {preMadePizzas.map((pizza) => (
              <div
                key={pizza._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                    {pizza.badge}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-red-600 transition">
                    {pizza.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex-grow line-clamp-2 leading-relaxed">
                    {pizza.description}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-lg font-black text-gray-900">₹{pizza.price}</span>
                    <button
                      onClick={() => handlePreMadeOrder(pizza)}
                      className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- 2. CUSTOM PIZZA BUILDER HEADER --- */}
      <div className="border-t border-gray-200 pt-8 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
          🛠️ Craft Your Own Custom Pizza
        </h1>
        <p className="text-gray-500 text-sm">
          Customize crust, sauce, cheese, and your favorite toppings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Single-Choice Ingredients (Base, Sauce, Cheese) */}
        <div className="lg:col-span-2 space-y-6">
          {['base', 'sauce', 'cheese'].map((cat) => (
            <div key={cat} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="capitalize font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                Choose {cat}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ingredients
                  .filter((i) => i.category === cat)
                  .map((item) => {
                    const isSelected =
                      (cat === 'base'
                        ? base
                        : cat === 'sauce'
                        ? sauce
                        : cheese)?._id === item._id;

                    return (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() =>
                          cat === 'base'
                            ? setBase(item)
                            : cat === 'sauce'
                            ? setSauce(item)
                            : setCheese(item)
                        }
                        className={`p-3 rounded-2xl border-2 text-left flex flex-col items-center text-center transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-50/60 shadow-md scale-102 ring-2 ring-red-100'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <img
                          src={
                            item.image ||
                            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80'
                          }
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl mb-3 shadow-inner bg-gray-50"
                        />
                        <span className="font-bold text-gray-800 text-sm">{item.name}</span>
                        <span className="text-xs font-semibold text-red-600 mt-1">
                          +₹{item.price}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Multi-Choice Veggies Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
              Choose Veggies & Toppings
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ingredients
                .filter((i) => i.category === 'veggie' || i.category === 'veggies')
                .map((item) => {
                  const isSelected = veggies.some((v) => v._id === item._id);

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => toggleVeggie(item)}
                      className={`p-3 rounded-2xl border-2 text-left flex flex-col items-center text-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-md scale-102 ring-2 ring-emerald-100'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&auto=format&fit=crop&q=80'
                        }
                        alt={item.name}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl mb-2 shadow-inner bg-gray-50"
                      />
                      <span className="font-bold text-gray-800 text-xs">{item.name}</span>
                      <span className="text-xs font-semibold text-emerald-700 mt-1">
                        +₹{item.price}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Section: Order Summary Panel */}
        <div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 sticky top-4 shadow-sm">
            <h2 className="font-bold text-xl text-gray-900 border-b pb-3 mb-4 flex items-center justify-between">
              <span>Your Custom Pizza</span>
              <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                Live Total
              </span>
            </h2>

            <ul className="space-y-3 text-sm text-gray-600 mb-6">
              <li className="flex justify-between items-center">
                <span>Crust: <strong className="text-gray-900">{base?.name || 'None'}</strong></span>
                <span className="font-semibold text-gray-800">₹{base?.price || 0}</span>
              </li>

              <li className="flex justify-between items-center">
                <span>Sauce: <strong className="text-gray-900">{sauce?.name || 'None'}</strong></span>
                <span className="font-semibold text-gray-800">₹{sauce?.price || 0}</span>
              </li>

              <li className="flex justify-between items-center">
                <span>Cheese: <strong className="text-gray-900">{cheese?.name || 'None'}</strong></span>
                <span className="font-semibold text-gray-800">₹{cheese?.price || 0}</span>
              </li>

              {veggies.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <span className="text-xs uppercase font-bold text-gray-400">Toppings</span>
                  {veggies.map((v) => (
                    <li
                      key={v._id}
                      className="flex justify-between pl-2 border-l-2 border-emerald-500 text-xs"
                    >
                      <span>+ {v.name}</span>
                      <span className="font-semibold text-gray-800">₹{v.price}</span>
                    </li>
                  ))}
                </div>
              )}
            </ul>

            <div className="border-t pt-4 flex justify-between items-center mb-6">
              <span className="font-bold text-lg text-gray-800">Total Amount</span>
              <span className="font-black text-2xl text-red-600">₹{totalPrice}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Order & Pay Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Razorpay Test Mode Simulation Modal */}
      {testModalData && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                TEST MODE
              </span>
              <h3 className="font-bold text-gray-900 text-lg">Razorpay Checkout</h3>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Payable:{' '}
              <strong className="text-gray-900 text-base">₹{activePayAmount}</strong>
            </p>

            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg mb-5 text-left leading-relaxed">
              Simulating Razorpay Test Gateway. Click <strong>Success</strong> to authorize the
              order and decrement stock.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handlePaymentResolution(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition text-sm"
              >
                Failure
              </button>

              <button
                onClick={() => handlePaymentResolution(true)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow transition text-sm"
              >
                Success
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}