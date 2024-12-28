import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import JumblePuzzle from '../components/JumblePuzzle';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-jumble-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-jumble-text mb-6">Latest Daily Jumble Answers</h1>
            
            <JumblePuzzle 
              date="December 28 2024"
              words={[]}
              caption=""
              imageUrl="https://assets.amuniversal.com/786dc2f09ec0013d8360005056a9545d"
              isExpanded={true}
            />
            
            <JumblePuzzle 
              date="December 27 2024"
              words={[]}
              caption=""
              imageUrl="https://assets.amuniversal.com/75efe9c09ec0013d8360005056a9545d"
              isExpanded={false}
              onToggle={() => {}}
            />
          </div>
          
          <div className="md:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;