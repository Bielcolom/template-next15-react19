import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm/LoginForm";
import { LoginHeader } from "./LoginHeader/LoginHeader";
import styles from "./login.module.scss";
import logo from "@/../../public/logo/rectangular.png";

export default async function Login({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "login" });

  return (
    <div className={styles.formPage}>
      <LoginHeader />
      <Image className={styles.logo} src={logo} alt={t("logoAlt")} priority />
      <LoginForm />
    </div>
  );
}
