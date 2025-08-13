'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const USERNAME = 'kedondong';
const PASSWORD = 'kedondong12345';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Pastikan input dirender hanya setelah client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/barang');
    } else {
      setError('Username atau password salah');
    }
  };

  if (!mounted) return null; // Hindari hydration mismatch

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login Admin</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username" className="login-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />

          <label htmlFor="password" className="login-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Login
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="back-button"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}
