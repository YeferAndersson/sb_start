import React from 'react';
import { Meta } from '../../@types/routes';
import { Routes, Route, Navigate } from 'react-router-dom';
import Support from '../Support';
import ArticleDetail from './ArticleDetail';

const SupportRouter = <T extends Meta>(props: T): React.ReactElement => {
  return (
    <Routes>
      <Route path="/" element={<Support {...props} />} />
      <Route path="/article/:id" element={<ArticleDetail />} />
      <Route path="*" element={<Navigate to="/support" replace />} />
    </Routes>
  );
};

export default SupportRouter;