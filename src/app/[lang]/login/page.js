import { LoginForm } from "./LoginForm/LoginForm";
import { LoginHeader } from "./LoginHeader/LoginHeader";
import styles from "./login.module.scss";
import logo from "@/../../public/logo/rectangular.png";

export default function Login() {
  return (
    <div className={styles.formPage}>
      <LoginHeader />
      <img className={styles.logo} src={logo.src} alt="rectangularLogo" />
      <LoginForm />
    </div>
  );
}