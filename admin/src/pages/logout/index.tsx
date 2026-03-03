import { serverRequest } from "@/constants/variables/global.vars";
import { useEffect, useState, type FC, type ReactNode } from "react"

const Logout: FC = (): ReactNode => {

    const [response, setResponse] = useState<string>("");

    useEffect(() => {
        serverRequest("post", "/auth/static", { user_id: "108777232464672797851", email: "mksullivan2001@gmail.com" }, "json")
            .then((res) => {
                setResponse(res.message ?? "");
            })
            .catch((res) => {
                setResponse(res.message);
            })
    }, []);

    return (
        <div>{response}</div>
    )
}

export default Logout