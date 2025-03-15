import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Subscription: React.FC = () => {
  const [message, setMessage] = useState<string>(''); // 订阅结果消息
  const { token } = useAuth(); // 获取当前用户的 JWT
  const navigate = useNavigate(); // 用于页面跳转

  // 处理订阅按钮点击
  const handleSubscribe = async () => {
    try {
      // 发送订阅请求到后端
      await axios.post('http://localhost:8080/api/subscription/subscribe', {}, {
        headers: { Authorization: `Bearer ${token}` }, // 携带 JWT
      });
      setMessage('Subscription successful!'); // 显示成功消息
      setTimeout(() => navigate('/news'), 2000); // 2秒后跳转到资讯页面
    } catch (err: any) {
      // 处理订阅失败
      setMessage(err.response?.data?.message || 'Subscription failed');
    }
  };

  return (
    <div className="container">
      <h2>Subscribe</h2>
      <p>Unlock premium content for $9.99/month.</p> {/* 订阅计划说明 */}
      <button onClick={handleSubscribe}>Subscribe Now</button> {/* 订阅按钮 */}
      {message && <p>{message}</p>} {/* 显示订阅结果 */}
    </div>
  );
};

export default Subscription;