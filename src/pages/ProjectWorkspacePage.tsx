import React from 'react';
import { Navigate } from 'react-router-dom';

export const ProjectWorkspacePage: React.FC = () => {
  return <Navigate to="/dashboard" replace />;
};

export default ProjectWorkspacePage;
