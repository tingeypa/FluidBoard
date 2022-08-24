import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";
import Board from "react-trello"
import logo from './logo.svg';
import './App.css';
import data from './data.json'

const clientProps = { connection: { port: 7070 } };
const client = new TinyliciousClient(clientProps);

const containerSchema = {
  initialObjects: { myMap: SharedMap }  
}; 

const timeKey = "time-key";
const nameKey = "name-key";


function App() {

  const getMyMap = async () => {
    let container;
    if (window.location.hash <= 1) {
        ({ container } = await client.createContainer(containerSchema));
        container.initialObjects.myMap.set(timeKey, Date.now().toString());
        const id = await container.attach();
        window.location.hash = id;
    } else {
        const id = window.location.hash.substring(1);
        ({ container } = await client.getContainer(id, containerSchema));
    }
    return container.initialObjects.myMap;
  }
  
  // Add to the top of our App
  const [fluidMap, setFluidMap] = React.useState(undefined);
  
  React.useEffect(() => {
      getMyMap().then(myMap => setFluidMap(myMap));
  }, []);
  
  // Add below the previous useEffect
  const [viewData, setViewData] = React.useState(undefined);
  const [name, setName] = React.useState(undefined);
  

  React.useEffect(() => {
    if (fluidMap !== undefined) {
        // sync Fluid data into view state
        const syncView = () => setViewData({ time: fluidMap.get(timeKey) });
        // ensure sync runs at least once
        syncView();
        // update state each time our map changes
        fluidMap.on("valueChanged", syncView);
        // turn off listener when component is unmounted
        return () => { fluidMap.off("valueChanged", syncView) }
    }
}, [fluidMap])  

React.useEffect(() => {
  if (fluidMap !== undefined) {
      // sync Fluid data into view state
      const syncName = () => setName({ text: fluidMap.get(nameKey) });
      // ensure sync runs at least once
      syncName();
      // update state each time our map changes
      fluidMap.on("valueChanged", syncName);
      // turn off listener when component is unmounted
      return () => { fluidMap.off("valueChanged", syncName) }
  }
}, [fluidMap])

  

    // update the App return
    if (!viewData) return <div />;

    // business logic could be passed into the view via context
    const setTime = () => fluidMap.set(timeKey, Date.now().toString());
    
    const setAName = () => fluidMap.set(nameKey, Date.now().toString());

    return (
        <div>
            <Board data={data} draggable/>
            Updated HERE

            <button onClick={setTime}> click </button>
            <span>{viewData.time}</span>
            <button onClick={setAName}> click Name</button>
            <span>NAME:{name.text}</span>
        </div>
    ) 
}

export default App;
