import React from 'react';
import UsersMarket from '../Components/UsersMarket';
import './UsersMarketPage.css'; 

const UsersMarketPage = () => {
  return (
    <div className="container min-h-screen h-screen overflow-auto pb-24 px-6"> 
      <UsersMarket />
    </div>
  );
}

export default UsersMarketPage;
