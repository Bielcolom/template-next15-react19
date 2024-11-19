import cookie from "cookie";

export async function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || "");
    const myCookie = cookies.myCookieName;

    return {
        props: {
            myCookie,
        },
    };
}