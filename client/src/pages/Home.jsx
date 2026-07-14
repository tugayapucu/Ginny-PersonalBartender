import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion as Motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import {
  MagnifyingGlassIcon,
  FlaskIcon,
  HeartIcon,
  GearSixIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import { getCocktailById, getRandomCocktail } from "../api";
import { Reveal, Stagger, EASE } from "../lib/motion";
import { getCocktailOfTheDayRequest } from "../api";
import video from "../assets/videos/cocktail-video-3.mp4";
import howItWorksImg from "../assets/images/cocktail-img-1.jpg";

const features = [
  {
    Icon: MagnifyingGlassIcon,
    title: "Extensive search",
    body: "Search a catalogue of 600+ cocktails to find the right drink for any occasion.",
  },
  {
    Icon: FlaskIcon,
    title: "What can I make?",
    body: "Enter the ingredients you have on hand and instantly see every cocktail you can make right now.",
  },
  {
    Icon: HeartIcon,
    title: "Favorites",
    body: "Save the cocktails you love for quick access whenever inspiration strikes.",
  },
  {
    Icon: GearSixIcon,
    title: "Your account",
    body: "Update your profile, change your password, and pick a light or dark theme, all saved to your account.",
  },
];

const Home = () => {
  const [cocktail, setCocktail] = useState(null);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  // Hero parallax: the video drifts and swells slightly slower than the page,
  // while the headline lifts away and fades as you scroll past it.
  const videoScale = useTransform(scrollY, [0, 700], [1, 1.18]);
  const videoY = useTransform(scrollY, [0, 700], [0, 90]);
  const heroY = useTransform(scrollY, [0, 600], [0, 140]);
  const heroOpacity = useTransform(scrollY, [0, 460], [1, 0]);

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

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6">
        <Motion.div
          style={reduce ? undefined : { scale: videoScale, y: videoY }}
          className="absolute inset-0 -z-10 will-change-transform"
        >
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover object-[center_60%] brightness-[.4]"
          ></video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#14100c]" />
        </Motion.div>

        <Motion.div
          style={reduce ? undefined : { y: heroY, opacity: heroOpacity }}
          variants={container}
          initial={reduce ? false : "hidden"}
          animate={reduce ? false : "show"}
          className="relative z-10 flex flex-col items-center text-center text-[#f4ece1]"
        >
          <Motion.p variants={item} className="eyebrow mb-4">
            Your personal bartender
          </Motion.p>
          <Motion.h1 variants={item} className="mb-4">
            Ginny
          </Motion.h1>
          <Motion.h2
            variants={item}
            className="mb-6 font-normal text-[#e8ddcb]"
          >
            Pour something worth remembering
          </Motion.h2>
          <Motion.p variants={item} className="max-w-xl text-[#d6cab6]">
            Browse recipes, search by name or ingredient, and save the cocktails
            you love.
          </Motion.p>
          <Motion.div
            variants={item}
            className="mt-9 flex flex-wrap justify-center gap-4"
          >
            <Link to="/recipes" className="btn-primary px-6 py-3">
              Search Recipes
            </Link>
            <Link
              to="/cocktail-of-the-day"
              className="btn-secondary border-white/30 bg-white/10 px-6 py-3 text-white backdrop-blur hover:bg-white/20"
            >
              Cocktail of the Day
            </Link>
          </Motion.div>
        </Motion.div>
      </section>

      {/* How it works */}
      <section className="home-section bg-surface">
        <div className="section-pattern"></div>
        <div className="z-10 w-full max-w-6xl">
          <div className="flex w-full flex-col items-center gap-12 md:flex-row md:justify-between">
            <Reveal y={40} className="md:w-1/2">
              <div className="aspect-[3/4] max-w-[460px] overflow-hidden rounded-2xl border border-line">
                <Motion.img
                  src={howItWorksImg}
                  alt="A finished cocktail on a bar"
                  className="h-full w-full object-cover"
                  initial={reduce ? false : { scale: 1.12 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.1, ease: EASE }}
                />
              </div>
            </Reveal>
            <div className="md:w-1/2">
              <Reveal as="p" className="eyebrow mb-4">
                How it works
              </Reveal>
              <Reveal as="h2" delay={0.05} className="mb-6">
                Find your next drink
              </Reveal>
              <Reveal
                as="p"
                delay={0.1}
                className="mb-8 max-w-xl text-left text-lg leading-relaxed text-muted"
              >
                Ginny helps you discover cocktails you'll actually enjoy. Search
                by name or ingredient, see what you can make with what's already
                in your kitchen, and keep a collection of favorites.
              </Reveal>
              <ul className="space-y-3 text-left text-lg">
                {[
                  "Search by cocktail name or ingredient",
                  "Find drinks you can make right now",
                  "Save your favorites and come back any time",
                ].map((line, i) => (
                  <Reveal
                    as="li"
                    key={line}
                    delay={0.15 + i * 0.08}
                    className="flex items-start gap-3"
                  >
                    <CaretRightIcon
                      size={20}
                      weight="bold"
                      className="mt-1 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    {line}
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cocktail of the day */}
      <section className="home-section">
        <div className="section-pattern"></div>
        <div className="z-10 w-full max-w-6xl">
          <div className="flex w-full flex-col items-center gap-12 md:flex-row md:justify-between">
            <Reveal y={40} className="md:w-1/2">
              <div className="aspect-[3/4] max-w-[460px] overflow-hidden rounded-2xl border border-line">
                <Motion.img
                  src={cocktail?.thumb_url || howItWorksImg}
                  alt={cocktail?.name || "Cocktail of the Day"}
                  className="h-full w-full object-cover"
                  initial={reduce ? false : { scale: 1.12 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 1.1, ease: EASE }}
                />
              </div>
            </Reveal>
            <div className="md:w-1/2">
              <Reveal as="p" className="eyebrow mb-4">
                Cocktail of the day
              </Reveal>
              {cocktail ? (
                <>
                  <Reveal as="h2" delay={0.05} className="mb-6">
                    {cocktail.name}
                  </Reveal>
                  <Reveal
                    as="h4"
                    delay={0.1}
                    className="mb-3 text-left text-base font-semibold uppercase tracking-wide text-muted"
                  >
                    Ingredients
                  </Reveal>
                  <ul className="mb-8 space-y-2 text-left text-lg">
                    {cocktail.ingredients
                      ?.slice(0, 6)
                      .map((ingredient, idx) => (
                        <Reveal
                          as="li"
                          key={idx}
                          delay={0.15 + idx * 0.06}
                          className="flex items-start gap-3"
                        >
                          <span className="ing-marker" aria-hidden="true" />
                          {[ingredient.measure, ingredient.ingredient]
                            .filter(Boolean)
                            .join(" ")}
                        </Reveal>
                      ))}
                  </ul>
                  <Reveal delay={0.2}>
                    <Link to="/cocktail-of-the-day" className="btn-primary">
                      See full recipe
                    </Link>
                  </Reveal>
                </>
              ) : (
                <p className="text-left text-muted">
                  Loading today's cocktail…
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="home-section bg-surface">
        <div className="z-10 flex w-full flex-col items-center">
          <Reveal as="p" className="eyebrow mb-4">
            Features
          </Reveal>
          <Reveal as="h2" delay={0.05} className="mb-4 text-center">
            Everything you need behind the bar
          </Reveal>
          <Reveal as="p" delay={0.1} className="mb-12 text-center text-muted">
            Discover your next favorite drink with a few focused tools.
          </Reveal>
          <div className="feature-list">
            {features.map((feature, i) => {
              const FeatureIcon = feature.Icon;
              return (
                <Stagger key={feature.title} index={i} className="feature-item">
                  <div className="feature-icon">
                    <FeatureIcon
                      size={26}
                      weight="duotone"
                      className="text-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <h5 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h5>
                    <p className="text-left text-base text-muted">
                      {feature.body}
                    </p>
                  </div>
                </Stagger>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
