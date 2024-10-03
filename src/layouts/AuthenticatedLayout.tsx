import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';

const AuthenticatedLayout: React.FC = () => {
  return (
    <div className="flex flex-col">
      <HeaderBar />
      <div className="flex-grow overflow-hidden mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthenticatedLayout;