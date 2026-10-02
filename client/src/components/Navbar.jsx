import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Pizza, ShoppingBag, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-red-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-wide">
          <Pizza className="w-8 h-8" />
          <span>PizzaCraft</span>
        </Link>

        <div className="flex items-center gap-6 font-medium">
          <Link to="/" className="hover:text-red-100 transition">Build Pizza</Link>

          {user ? (
            <>
              <Link to="/orders" className="flex items-center gap-1 hover:text-red-100 transition">
                <ShoppingBag className="w-4 h-4" />
                <span>Orders</span>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-md font-semibold text-sm hover:bg-yellow-300 transition">
                  Admin Dashboard
                </Link>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-red-400">
                <span className="text-sm font-semibold flex items-center gap-1">
                  <UserIcon className="w-4 h-4" /> {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-700 hover:bg-red-800 p-2 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-red-100 transition">Login</Link>
              <Link to="/register" className="bg-white text-red-600 px-4 py-1.5 rounded-full font-bold hover:bg-gray-100 transition">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}