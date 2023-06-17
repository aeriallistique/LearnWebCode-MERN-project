import React, {useState, useEffect} from "react"
import {createRoot} from "react-dom/client";
import Axios from "axios";
import AnimalCard from "./components/AnimalCard";
import CreateNewForm from "./components/CreateNewForm";

function App(){
  const [animals, setAnimals] = useState([])

  useEffect(()=>{
    async function go(){
      const response = await Axios.get("/api/animals")
      setAnimals(response.data)
    }
    go()
  }, []) 

  return(
   <div className="container">
     <p>
       <a href="/">&laquo; Back to public homepage</a>
     </p>
     <CreateNewForm setAnimals={setAnimals} />
     <div className="animal-grid">
      {animals.map(function (animal){
       return <AnimalCard key={animal.id} name={animal.name} photo={animal.photo} id={animal.id} species={animal.species} setAnimals={setAnimals} />
      })}
     </div>
   </div>
  )
}




const root = createRoot(document.querySelector('#app'));
root.render(<App />)