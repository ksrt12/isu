import { useCallback, useState } from "react";

export interface Ibtn {
    id: string;
    ready: boolean;
    name: string;
    fileName: string;
    url: string;
    disabled: boolean;
    setName: React.Dispatch<React.SetStateAction<string>>;
    update: Function;
    remove: Function;
    disable: Function;
    enable: Function;
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

    const remove = useCallback(() => setReady(false), []);
    const disable = useCallback(() => setDisabled(true), []);
    const enable = useCallback(() => setDisabled(false), []);

    return {
        id, ready, name, fileName, url, disabled,
        setName, update, remove, disable, enable
    };
};

export default useBtn;