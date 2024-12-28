import React from 'react';
import PuzzleForm from '@/components/admin/PuzzleForm';
import PuzzleList from '@/components/admin/PuzzleList';

const AdminPanel = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage daily jumble puzzles</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <PuzzleForm />
        </div>
        <div>
          <PuzzleList />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;