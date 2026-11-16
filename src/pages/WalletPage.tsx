import React from 'react';
import { Navigate } from 'react-router-dom';

export const WalletPage: React.FC = () => {
  return <Navigate to="/credits" replace />;
};

export default WalletPage;
