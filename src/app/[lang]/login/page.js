import { LoginForm } from "./LoginForm/LoginForm";
import { LoginHeader } from "./LoginHeader/LoginHeader";
import Image from "next/image";
import styles from "./login.module.scss";
import logo from "@/../../public/logo/rectangular.png";
import { getDictionary } from "../dictionaries";

export default async function Login({ params }) {
  const { lang } = params;
  const dict = await getDictionary(lang, "common");

  return (
    <div className={styles.formPage}>
      <LoginHeader />
      <Image className={styles.logo} src={logo} alt="rectangularLogo" priority />
      <LoginForm successMessage={dict?.feedback?.loginSuccess} />
    </div>
  );
}
