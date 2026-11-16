import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProposalsPage: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default ProposalsPage;
