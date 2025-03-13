import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// 资讯数据类型
interface NewsItem {
  id: number;
  title: string;
  content?: string;
}

const NewsList: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string>('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  // 获取资讯数据
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchNews = async () => {
      try {
        const response = await axios.get<NewsItem[]>('http://localhost:8080/api/news', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(response.data);
      } catch (err) {
        const error = err as AxiosError;
        setError('Failed to fetch news');
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      }
    };

    fetchNews();
  }, [token, navigate, logout]);

  return (
    <div className="container">
      <h2>News List</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {news.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default NewsList;