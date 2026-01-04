import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const Favorites = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })
  const [cocktails, setCocktails] = useState([])

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const cocktailPromises = favorites.map((id) =>
          axios.get(`http://127.0.0.1:8000/cocktails/${id}`)
        )
        const responses = await Promise.all(cocktailPromises)
        const data = responses.map((res) => res.data)
        setCocktails(data)
      } catch (err) {
        console.error('Failed to load favorite cocktails', err)
      }
    }

    if (favorites.length > 0) fetchFavs()
  }, [favorites])

  const removeFavorite = (id) => {
    const updated = favorites.filter((favId) => favId !== id)
    setFavorites(updated)
    localStorage.setItem('favorites', JSON.stringify(updated))
    setCocktails(cocktails.filter((c) => c.id !== id))
  }

  return (
    <div className="px-6 py-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8">❤️ My Favorite Cocktails</h2>
      {cocktails.length === 0 ? (
        <p className="text-center text-gray-500">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cocktails.map((cocktail) => (
            <div key={cocktail.id} className="border rounded-xl shadow p-4 text-center relative">
              <Link to={`/cocktails/${cocktail.id}`}>
                <img
                  src={cocktail.thumb_url}
                  alt={cocktail.name}
                  className="w-full h-48 object-cover rounded"
                />
                <h3 className="text-lg font-bold mt-2">{cocktail.name}</h3>
              </Link>
              <button
                onClick={() => removeFavorite(cocktail.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
