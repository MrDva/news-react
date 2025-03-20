import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import DOMPurify from 'dompurify'; // 需要安装dompurify

Modal.setAppElement('#root');

const Subscription: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [paymentForm, setPaymentForm] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  // 清理Blob URL
  useEffect(() => {
    return () => {
      if (iframeUrl) {
        URL.revokeObjectURL(iframeUrl);
      }
    };
  }, [iframeUrl]);

  const checkSubscriptionStatus = useCallback(
    async (silent: boolean = false) => {
      try {
        const response = await axios.get('http://localhost:8080/api/subscription/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.subscribed) {
          setIsSubscribed(true);
          setPaymentForm(null);
          if (iframeUrl) {
            URL.revokeObjectURL(iframeUrl);
            setIframeUrl(null);
          }
          if (!silent) {
            setMessage('Subscription successful!');
            setTimeout(() => navigate('/news'), 2000);
          }
        } else if (!silent) {
          setMessage('Payment pending...');
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        !silent && setMessage('Error verifying subscription');
      }
    },
    [token, navigate, iframeUrl]
  );

  useEffect(() => {
    checkSubscriptionStatus(true);
  }, [checkSubscriptionStatus]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (paymentForm) {
      pollInterval = setInterval(() => checkSubscriptionStatus(true), 2000);
    }
    return () => pollInterval && clearInterval(pollInterval);
  }, [paymentForm, checkSubscriptionStatus]);

  const processPaymentForm = (html: string): string => {
    // 消毒HTML并保留form和script
    const cleanHTML = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['form', 'input', 'script'],
      ALLOWED_ATTR: ['name', 'method', 'action', 'type', 'value', 'style'],
      ADD_TAGS: ['input'],
      ADD_ATTR: ['style']
    });

    // 创建完整HTML文档
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </head>
        <body style="margin:0">
          ${cleanHTML}
        </body>
      </html>
    `;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  };

  const handleSubscribe = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/payment/create',
        { amount: 0.01, paymentMethod: 'alipay' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const url = processPaymentForm(response.data);
      setIframeUrl(url);
      setPaymentForm(response.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Payment initiation failed');
    }
  };

  return (
    <div className="container">
      <h2>Subscribe</h2>
      <p>Unlock premium content for $0.01/month.</p>
      <button 
        onClick={handleSubscribe} 
        disabled={isSubscribed || !!paymentForm}
      >
        {isSubscribed ? 'Subscribed' : 'Subscribe Now'}
      </button>
      {message && <p className="message">{message}</p>}

      <Modal
        isOpen={!!paymentForm}
        onRequestClose={() => {
          setPaymentForm(null);
          iframeUrl && URL.revokeObjectURL(iframeUrl);
          setIframeUrl(null);
        }}
        style={{
          content: {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '70vh',
            padding: '0',
            border: 'none',
            borderRadius: '8px'
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }
        }}
      >
        {iframeUrl && (
          <iframe
            title="payment-iframe"
            src={iframeUrl}
            sandbox="allow-forms allow-scripts allow-same-origin"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              overflow: 'hidden'
            }}
            onLoad={() => setMessage('Redirecting to payment...')}
          />
        )}
        <button
          onClick={() => {
            setPaymentForm(null);
            iframeUrl && URL.revokeObjectURL(iframeUrl);
            setIframeUrl(null);
          }}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default Subscription;