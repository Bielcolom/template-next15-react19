import { LoginForm } from "./LoginForm/LoginForm";
import { LoginHeader } from "./LoginHeader/LoginHeader";
import Image from "next/image";
import styles from "./login.module.scss";
import logo from "@/../../public/logo/rectangular.png";

export default function Login() {
  return (
    <div className={styles.formPage}>
      <LoginHeader />
      <Image className={styles.logo} src={logo} alt="rectangularLogo" priority />
      <LoginForm />
    </div>
  );
}
