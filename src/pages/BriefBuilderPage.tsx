import React from 'react';
import { Navigate } from 'react-router-dom';

export const BriefBuilderPage: React.FC = () => {
  return <Navigate to="/submit-request" replace />;
};

export default BriefBuilderPage;
