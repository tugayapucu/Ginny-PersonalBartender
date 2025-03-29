import React, { useEffect, useState } from 'react';
import { fetchCocktails } from '../api';

const CocktailList = () => {
  const [cocktails, setCocktails] = useState([]);

  useEffect(() => {
    fetchCocktails()
      .then((response) => {
        console.log("Fetched cocktails:", response.data);
        setCocktails(response.data);
      })
      .catch((error) => console.error("Error fetching cocktails:", error));
  }, []);

  return (
    <div>
      <h2>Cocktail List</h2>
      <ul>
        {cocktails.map((cocktail) => (
          <li key={cocktail.id}>
            {cocktail.strDrink} - {cocktail.strCategory}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CocktailList;
