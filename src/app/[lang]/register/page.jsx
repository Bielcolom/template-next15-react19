import Image from "next/image";
import { getTranslations } from "next-intl/server";
import styles from "./register.module.scss";
import logo from "@/../../public/logo/rectangular.png";
import RegisterForm from "./RegisterForm/RegisterForm";

export default async function RegisterPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "register" });

  return (
    <div className={styles.formPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
      </div>
      <Image className={styles.logo} src={logo} alt={t("logoAlt")} priority />
      <RegisterForm />
    </div>
  );
}
