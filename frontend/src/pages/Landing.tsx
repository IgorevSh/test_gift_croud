import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.scss';

const BLOBS = Array.from({ length: 24 }, (_, i) => i + 1);

export default function Landing() {
  const featuresRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState({ features: false, steps: false, cta: false });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('data-landing-section');
          if (id) setVisible((v) => ({ ...v, [id]: true }));
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -20% 0px' }
    );
    const refs = [featuresRef.current, stepsRef.current, ctaRef.current];
    refs.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <div className="landing-page__bg" aria-hidden>
        {BLOBS.map((n) => (
          <span key={n} className={`landing-page__blob landing-page__blob--${n}`} />
        ))}
      </div>

      <section className="landing-page__hero">
        <h1 className="landing-page__title">
          Собери
          {'\n'}
          свой список желаний
          {'\n'}
          вместе с друзьями
        </h1>
        <p className="landing-page__subtitle">
          Создавайте вишлисты, добавляйте подарки и делитесь одной ссылкой. Друзья резервируют подарки или вносят вклад в сбор.
        </p>
      </section>

      <section
        ref={featuresRef}
        data-landing-section="features"
        className={`landing-page__features ${visible.features ? 'landing-page__section--visible' : ''}`}
      >
        <h2 className="landing-page__section-title">Возможности</h2>
        <div className="landing-page__features-list">
          <div className="landing-page__feature-row">
            <span className="landing-page__feature-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 23.3L18.4 22.8C16.4 20.9 15 19.7 15 18.2C15 17 16 16 17.2 16C17.9 16 18.6 16.3 19 16.8C19.4 16.3 20.1 16 20.8 16C22 16 23 16.9 23 18.2C23 19.7 21.6 20.9 19.6 22.8L19 23.3M17 4V10L15 8L13 10V4H9V20H13.08C13.2 20.72 13.45 21.39 13.8 22H7C5.95 22 5 21.05 5 20V19H3V17H5V13H3V11H5V7H3V5H5V4C5 2.89 5.9 2 7 2H19C20.05 2 21 2.95 21 4V13.34C20.37 13.12 19.7 13 19 13V4H17M5 19H7V17H5V19M5 13H7V11H5V13M5 7H7V5H5V7Z" />
              </svg>
            </span>
            <div className="landing-page__feature-content">
              <h3 className="landing-page__feature-title">Сбор на подарок</h3>
              <p className="landing-page__feature-desc">Укажите цель сбора — участники вносят любую сумму в подарок</p>
            </div>
          </div>
          <div className="landing-page__feature-row landing-page__feature-row--alt">
            <span className="landing-page__feature-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,5A3.5,3.5 0 0,0 8.5,8.5A3.5,3.5 0 0,0 12,12A3.5,3.5 0 0,0 15.5,8.5A3.5,3.5 0 0,0 12,5M12,7A1.5,1.5 0 0,1 13.5,8.5A1.5,1.5 0 0,1 12,10A1.5,1.5 0 0,1 10.5,8.5A1.5,1.5 0 0,1 12,7M5.5,8A2.5,2.5 0 0,0 3,10.5C3,11.44 3.53,12.25 4.29,12.68C4.65,12.88 5.06,13 5.5,13C5.94,13 6.35,12.88 6.71,12.68C7.08,12.47 7.39,12.17 7.62,11.81C6.89,10.86 6.5,9.7 6.5,8.5C6.5,8.41 6.5,8.31 6.5,8.22C6.2,8.08 5.86,8 5.5,8M18.5,8C18.14,8 17.8,8.08 17.5,8.22C17.5,8.31 17.5,8.41 17.5,8.5C17.5,9.7 17.11,10.86 16.38,11.81C16.5,12 16.63,12.15 16.78,12.3C16.94,12.45 17.1,12.58 17.29,12.68C17.65,12.88 18.06,13 18.5,13C18.94,13 19.35,12.88 19.71,12.68C20.47,12.25 21,11.44 21,10.5A2.5,2.5 0 0,0 18.5,8M12,14C9.66,14 5,15.17 5,17.5V19H19V17.5C19,15.17 14.34,14 12,14M4.71,14.55C2.78,14.78 0,15.76 0,17.5V19H3V17.07C3,16.06 3.69,15.22 4.71,14.55M19.29,14.55C20.31,15.22 21,16.06 21,17.07V19H24V17.5C24,15.76 21.22,14.78 19.29,14.55M12,16C13.53,16 15.24,16.5 16.23,17H7.77C8.76,16.5 10.47,16 12,16Z" />
              </svg>
            </span>
            <div className="landing-page__feature-content">
              <h3 className="landing-page__feature-title">Резервирование</h3>
              <p className="landing-page__feature-desc">Друзья отмечают, кто что дарит — без дублей и путаницы</p>
            </div>
          </div>
          <div className="landing-page__feature-row">
            <span className="landing-page__feature-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 9V5L18 12L11 19V14.9C6 14.9 2.5 16.5 0 20C1 15 4 10 11 9M17 8V5L24 12L17 19V16L21 12L17 8Z" />
              </svg>
            </span>
            <div className="landing-page__feature-content">
              <h3 className="landing-page__feature-title">Одна ссылка</h3>
              <p className="landing-page__feature-desc">Поделитесь ссылкой — получатели видят список и могут участвовать</p>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={stepsRef}
        data-landing-section="steps"
        className={`landing-page__steps ${visible.steps ? 'landing-page__section--visible' : ''}`}
      >
        <h2 className="landing-page__section-title">Как начать</h2>
        <div className="landing-page__steps-grid">
          <div className="landing-page__step app-card">
            <span className="landing-page__step-num" aria-hidden>1</span>
            <div className="landing-page__step-icon" aria-hidden>📝</div>
            <p className="landing-page__step-title">Создайте список</p>
            <p className="landing-page__step-desc">Название и описание — список готов к заполнению</p>
          </div>
          <div className="landing-page__step app-card">
            <span className="landing-page__step-num" aria-hidden>2</span>
            <div className="landing-page__step-icon" aria-hidden>🎁</div>
            <p className="landing-page__step-title">Добавьте пожелания</p>
            <p className="landing-page__step-desc">Ссылки на товары, цены и при необходимости цель сбора</p>
          </div>
          <div className="landing-page__step app-card">
            <span className="landing-page__step-num" aria-hidden>3</span>
            <div className="landing-page__step-icon" aria-hidden>🔗</div>
            <p className="landing-page__step-title">Поделитесь с друзьями</p>
            <p className="landing-page__step-desc">Отправьте ссылку — друзья смогут резервировать и вносить вклад</p>
          </div>
        </div>
      </section>

      <section
        ref={ctaRef}
        data-landing-section="cta"
        className={`landing-page__cta ${visible.cta ? 'landing-page__section--visible' : ''}`}
      >
        <div className="landing-page__cta-inner">
          <p className="landing-page__cta-text">Создайте первый список за минуту</p>
          <div className="landing-page__cta-btns">
            <Link to="/wishlist" className="landing-page__cta-btn landing-page__cta-btn--primary">
              Создать список
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
