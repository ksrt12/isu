import { NavLink } from "react-router-dom";

interface MainPageProps { }

const MainPage: React.FC<MainPageProps> = () => {
    const userScripts = [
        { label: "abit", name: "Система Абитуриент" },
        { label: "gto", name: "Проверка ГТО" },
        { label: "akt", name: "Акты" },
        { label: "de", name: "Описи" },
        { label: "dip", name: "Средний балл (по приложению к диплому)" },
        { label: "ias", name: "Средний балл (по зачётной книжке)" }
    ];
    return (
        <>
            <div className="license-text between">
                <p>UserScripts for ISU &amp; ABIT systems</p>
            </div>
            <ul>
                <p>Перед использованием скриптов установить <a target="_blank" rel="noreferrer" href="https://www.tampermonkey.net/">Tampermonkey</a></p>
                {userScripts.map(script => <li key={script.label}><a href={`scripts/${script.label}.user.js`}>{script.name}</a></li>)}
                <br />
                <li><NavLink to="/json2xls">Конвертация json в xls</NavLink></li>
            </ul>
        </>
    );
};

export default MainPage;