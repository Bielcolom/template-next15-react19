import { LoginForm } from "./LoginForm/LoginForm";
import { LoginHeader } from "./LoginHeader/LoginHeader";
import Image from "next/image";
import styles from "./login.module.scss";
import logo from "@/../../public/logo/rectangular.png";
import { getDictionary } from "../dictionaries";

export default async function Login({ params }) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang, "login");

  return (
    <div className={styles.formPage}>
      <LoginHeader title={dictionary?.title} />
      <Image className={styles.logo} src={logo} alt={dictionary?.logoAlt} priority />
      <LoginForm dictionary={dictionary} />
    </div>
  );
}
