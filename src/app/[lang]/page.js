// handoff/src/app/[lang]/page.js
// Home redesign — reemplaza el page.js actual.

import { getTranslations } from "next-intl/server";
import RouteToastHandler from "./RouteToastHandler";
import styles from "./page.module.css";
import BrandMandala from "./components/base/BrandMandala";

export default async function Home({ params }) {
  const { lang } = await params;
  const homeT = await getTranslations({ locale: lang, namespace: "home" });
  const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" }); 
  const toastMessages = { registrationSuccess: feedbackT("registrationSuccess") };

  return (
    <div className={styles.page}>
      <RouteToastHandler toastMessages={toastMessages} />

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.statusChip}>
            <span className={styles.statusDot} />
            {homeT("availability")}
          </div>

          <h1 className={styles.heroTitle}>
            {homeT.rich("heroTitle", {
              em: (c) => <em>{c}</em>,
              br: () => <br />,
            })}
          </h1>

          <p className={styles.heroLead}>{homeT("heroLead")}</p>

          <div className={styles.heroActions}>
            <a className="button primary" href={`/${lang}/register`}>
              {homeT("ctaPrimary")}
            </a>
            <a className="button secondary" href={`/${lang}/about`}>
              {homeT("ctaSecondary")}
            </a>
          </div>

          <div className={styles.stats}>
            {[
              { n: homeT("stat1Value"), l: homeT("stat1Label") },
              { n: homeT("stat2Value"), l: homeT("stat2Label") },
              { n: homeT("stat3Value"), l: homeT("stat3Label") },
            ].map((s) => (
              <div key={s.l}>
                <div className={styles.statValue}>{s.n}</div>
                <div className={styles.statLabel}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.mandalaWrap}>
            <BrandMandala size={320} color="#086972" />
            <div className={`${styles.floatCard} ${styles.floatCardTop}`}>
              <div className={styles.floatIcon}>◇</div>
              <div>
                <strong>{homeT("card1Title")}</strong>
                {homeT("card1Body")}
              </div>
            </div>
            <div className={`${styles.floatCard} ${styles.floatCardBot}`}>
              <div className={`${styles.floatIcon} ${styles.floatIconSuccess}`}>↗</div>
              <div>
                <strong>{homeT("card2Title")}</strong>
                {homeT("card2Body")}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
