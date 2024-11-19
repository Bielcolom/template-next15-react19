import { LoginForm } from "./LoginForm/LoginForm";
import { LoginHeader } from "./LoginHeader/LoginHeader";
import styles from "./login.module.scss";

export default function Login() {
  return (
    <div className={styles.formPage}>
      <LoginHeader />
      <LoginForm />
    </div>
  );
}