import { useCallback, useState } from "react";

export interface Ibtn {
    id: string;
    ready: boolean;
    name: string;
    fileName: string;
    url: string;
    disabled: boolean;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
    update: Function;
    remove: Function;
}

const useBtn = (id: string, btnName: string): Ibtn => {
    const [ready, setReady] = useState(false);
    const [name, setName] = useState(btnName);
    const [fileName, setFileName] = useState("");
    const [url, setUrl] = useState("");
    const [disabled, setDisabled] = useState(true);

    const update = useCallback((newName: string, newUrl: string) => {
        setFileName(newName);
        setUrl(newUrl);
        setReady(true);
    }, []);


    const remove = useCallback(() => {
        setReady(false);
    }, []);

    return {
        id,
        ready,
        name,
        fileName,
        url,
        disabled,
        setName,
        setDisabled,
        update,
        remove
    };
};

export default useBtn;