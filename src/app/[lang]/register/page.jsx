import Image from "next/image";
import styles from "./register.module.scss";
import logo from "@/../../public/logo/rectangular.png";
import RegisterForm from "./RegisterForm/RegisterForm";

export default function RegisterPage() {
  return (
    <div className={styles.formPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Register</h1>
      </div>
      <Image className={styles.logo} src={logo} alt="rectangularLogo" priority />
      <RegisterForm />
    </div>
  );
}
