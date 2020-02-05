import React from "react";
import "./App.css";
import List from "./components/List";
import ListViewToggle from "./components/ListViewToggle";

function App() {
  return (
  <div>
    <ListViewToggle />
    <List></List>;
  </div>
  )
  
}

export default App;
