import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCocktailOfTheDayRequest } from "../api";
import video from "../assets/videos/cocktail-video-3.mp4";
import howItWorksImg from "../assets/images/cocktail-img-1.jpg";

const Home = () => {
  const [cocktail, setCocktail] = useState(null);

  useEffect(() => {
    const loadCocktail = async () => {
      try {
        const res = await getCocktailOfTheDayRequest();
        setCocktail(res.data);
      } catch (err) {
        console.error("Failed to load cocktail of the day", err);
      }
    };
    loadCocktail();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <video
            src={video}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover object-[center_60%] brightness-[.5]"
            playsInline
          ></video>
        </div>

        <div className="z-10 flex flex-col items-center text-center text-white relative">
          <h1>Ginny</h1>
          <h2>Your Favourite Personal Bartender</h2>
          <p>
            Browse recipes, search by name or ingredient, and save your
            favourite cocktails.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/recipes" className="btn-primary">
              Search Recipes
            </Link>
            <Link to="/cocktail-of-the-day" className="btn-primary">
              Cocktail of the Day
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-white">
          <div className="flex flex-col items-center">
            <p>Scroll down to explore</p>
            <div className="text-3xl mb-2">↓</div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="bg-slate-50">
        <div className="section-pattern"></div>
        <div className="z-10 w-full max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12">
            <div className="md:w-1/2">
              <div className="aspect-[3/4] max-w-[500px] overflow-hidden rounded-2xl">
                <img
                  src={howItWorksImg}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 glass-card">
              <h2 className="mb-8">How It Works</h2>
              <p className="text-left mb-8">
                Ginny is a cocktail discovery tool that helps you find drinks
                you'll enjoy. Search by name or ingredient, see what you can
                make with what's already in your kitchen, and build a personal
                collection of favourites.
              </p>

              <ul className="text-xl text-left list-disc pl-5 space-y-4">
                <li>Search by cocktail name or ingredient</li>
                <li>Find drinks you can make right now</li>
                <li>Save your favourites and come back any time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cocktail of the day */}
      <section className="bg-slate-50">
        <div className="section-pattern"></div>
        <div className="z-10 w-full max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12">
            <div className="md:w-1/2">
              <div className="aspect-[3/4] max-w-[500px] overflow-hidden rounded-2xl">
                <img
                  src={cocktail?.thumb_url || howItWorksImg}
                  alt={cocktail?.name || "Cocktail of the Day"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 glass-card">
              <h2 className="mb-8">Cocktail of the Day</h2>
              {cocktail ? (
                <>
                  <p className="text-2xl font-semibold text-left mb-6">
                    {cocktail.name}
                  </p>
                  <h4 className="text-left font-bold mb-3">Ingredients</h4>
                  <ul className="text-lg text-left list-disc pl-5 space-y-2 mb-8">
                    {cocktail.ingredients?.slice(0, 6).map((item, idx) => (
                      <li key={idx}>
                        {[item.measure, item.ingredient]
                          .filter(Boolean)
                          .join(" ")}
                      </li>
                    ))}
                  </ul>
                  <Link to="/cocktail-of-the-day" className="btn-primary">
                    See More
                  </Link>
                </>
              ) : (
                <p className="text-left">Loading today's cocktail...</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section>
        <div className="z-10 w-full flex flex-col items-center">
          <h2 className="mb-4">Features</h2>
          <p className="mb-8">
            Discover your next favorite drink with our powerful features:
          </p>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div>
                <h5 className="mb-2">Extensive Search</h5>
                <p className="text-left text-base mb-0">
                  Search through our extensive cocktail database to find the
                  perfect drink for any occasion
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🧪</div>
              <div>
                <h5 className="mb-2">What Can I Make?</h5>
                <p className="text-left text-base mb-0">
                  Enter the ingredients you have on hand and instantly see every
                  cocktail you can make right now
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">❤️</div>
              <div>
                <h5 className="mb-2">Favorites Collection</h5>
                <p className="text-left text-base mb-0">
                  Save your favorite cocktails for quick access anytime
                  inspiration strikes
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">⚙️</div>
              <div>
                <h5 className="mb-2">Your Account</h5>
                <p className="text-left text-base mb-0">
                  Update your profile, change your password, and choose a light
                  or dark theme — all saved to your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
