import React, { useEffect, useState } from 'react';
import './App.css';
import Basic from './Basic';
import Tabs, { Tab, TabList, TabPanel } from '@atlaskit/tabs';
import AIPicker from './AI-picker';

function App() {

  return (
    <div className="App">
      <Tabs onChange={(index) => console.log('Selected Tab', index + 1)} id="default">
        <TabList>
          <Tab>Basic</Tab>
          <Tab>Next-Gen</Tab>
        </TabList>
        <TabPanel>
          <Basic />
        </TabPanel>
        <TabPanel>
          <AIPicker />
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default App;
