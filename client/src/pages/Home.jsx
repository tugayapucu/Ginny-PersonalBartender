import React from "react";
import { Link } from "react-router-dom";
import video from "../assets/videos/cocktail-video-3.mp4";
import howItWorksImg from "../assets/images/cocktail-img-1.jpg";

const Home = () => {
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

        <div className="z-10 flex flex-col items-center text-center relative">
          <h1 className="text-white">Welcome to Personal Bartender</h1>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/recipes" className="btn-primary border-white text-white">
              Search Recipes
            </Link>
            <Link to="/add" className="btn-primary border-white text-white">
              Cocktail of the Day
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center">
            <p className="text-white">Scroll down to explore</p>
            <div className="text-3xl mb-2 text-white">↓</div>
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
                Personal Bartender is a tool that helps you create cocktails
                based on your preferences. Our intelligent system analyzes your
                taste profile and suggests drinks you'll love.
              </p>

              <ul className="text-xl text-left list-disc pl-5 space-y-4">
                <li>Tell us what you like</li>
                <li>Get personalized recommendations</li>
                <li>Make amazing cocktails at home</li>
              </ul>
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
              <div className="feature-icon">🧠</div>
              <div>
                <h5 className="mb-2">Smart Recommendations</h5>
                <p className="text-left text-base mb-0">
                  Get personalized cocktail recommendations based on your unique
                  taste preferences
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
              <div className="feature-icon">✏️</div>
              <div>
                <h5 className="mb-2">Create & Share</h5>
                <p className="text-left text-base mb-0">
                  Create, save, and share your own unique cocktail recipes with
                  our passionate community
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
