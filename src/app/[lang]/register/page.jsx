import Image from "next/image";
import styles from "./register.module.scss";
import logo from "@/../../public/logo/rectangular.png";
import RegisterForm from "./RegisterForm/RegisterForm";
import { getDictionary } from "../dictionaries";

export default async function RegisterPage({ params }) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang, "register");

  return (
    <div className={styles.formPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{dictionary?.title}</h1>
      </div>
      <Image className={styles.logo} src={logo} alt={dictionary?.logoAlt} priority />
      <RegisterForm dictionary={dictionary} />
    </div>
  );
}
