import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  premium: boolean; // 与后端一致
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const subResponse = await axios.get<boolean>('http://localhost:8080/api/subscription/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSubscribed(subResponse.data);

        const newsResponse = await axios.get<NewsItem[]>('http://localhost:8080/api/news', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(newsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [token, navigate, logout]);

  return (
    <div className="container">
      <h2>News List</h2>
      {error && <p className="error">{error}</p>}
      {!isSubscribed && (
        <p>
          You are not subscribed. <Link to="/subscribe">Subscribe now</Link> to unlock premium content!
        </p>
      )}
      <ul>
        {news.map((item) => (
          <li key={item.id}>
            {item.title} {item.premium && '(Premium)'}
          </li>
        ))}
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default NewsList;