import { getUserRoles } from "./actions";
import styles from "./userRoles.module.scss";
import UserRolesClient from "./UserRolesClient";

export default async function UserRolesPage() {
    const userRoles = await getUserRoles(); // Llama a la función del servidor aquí
    return (
        <div className={styles.formPage}>
            <UserRolesClient userRoles={userRoles} /> {/* Pasa los datos como props */}
        </div>
    );
}
