import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Subscription: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/payment/create',
        {
          amount: 0.01,
          paymentMethod: 'alipay'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 创建临时容器渲染表单并自动提交
      const paymentForm = response.data;
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = paymentForm;
      document.body.appendChild(tempDiv);
      const form = tempDiv.querySelector('form') as HTMLFormElement;
      if (form) {
        form.submit(); // 自动提交表单，跳转到支付宝
      } else {
        setMessage('Failed to load payment form');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  return (
    <div className="container">
      <h2>Subscribe</h2>
      <p>Unlock premium content for $0.01/month.</p>
      <button onClick={handleSubscribe}>Subscribe Now</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Subscription;