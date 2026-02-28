
import PropTypes from "prop-types";
import styles from "./connectionErrorPage.module.scss";
import Button from "../base/Button";
const ConnectionErrorPage = ({ message = "Error de conexión. Por favor, verifica tu conexión a internet." }) => {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>¡Oh no!</h1>
            <p className={styles.message}>{message}</p>
            <Button
                className={styles.button}
                onClick={handleReload}
                text="reload"
            />
        </div>
    );
};

ConnectionErrorPage.propTypes = {
    message: PropTypes.string,
};
